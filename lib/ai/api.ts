import { z } from 'zod'

import { env } from '@/lib/env'

import {
  aiSearchDoneSchema,
  aiSearchMetaSchema,
  scoredProductSchema,
  type AiSearchDone,
  type AiSearchMeta,
  type ScoredProduct,
} from './schema'

const chatProductsSchema = z.object({ products: z.array(scoredProductSchema) })

export interface AiStreamCallbacks {
  onMeta: (meta: AiSearchMeta) => void
  onToken: (token: string) => void
  onDone: (final: AiSearchDone) => void
  onError: (message: string) => void
}

const STREAM_PATH = '/api/ai/search/stream'

/**
 * POSTs a query to the AI search stream and dispatches SSE events to the
 * supplied callbacks. EventSource doesn't support POST, so we read the raw
 * stream and parse `event:` / `data:` lines ourselves.
 */
export async function streamAiSearch(
  query: string,
  callbacks: AiStreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${STREAM_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ query }),
      credentials: 'include',
      signal,
    })
  } catch (error) {
    if ((error as { name?: string } | undefined)?.name === 'AbortError') return
    callbacks.onError('Unable to reach the AI search service.')
    return
  }

  if (!response.ok) {
    let message = 'AI search failed.'
    try {
      const body = (await response.json()) as { error?: { message?: string } }
      if (body?.error?.message) message = body.error.message
    } catch {
      /* non-JSON response body */
    }
    if (response.status === 429) {
      message = 'Too many AI searches — please wait a moment before trying again.'
    }
    callbacks.onError(message)
    return
  }

  if (!response.body) {
    callbacks.onError('No response stream from AI search.')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let separatorIndex
      while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)
        dispatchSseChunk(raw, callbacks)
      }
    }
    if (buffer.trim()) dispatchSseChunk(buffer, callbacks)
  } catch (error) {
    if ((error as { name?: string } | undefined)?.name !== 'AbortError') {
      callbacks.onError('The AI search connection was interrupted.')
    }
  }
}

function dispatchSseChunk(raw: string, callbacks: AiStreamCallbacks): void {
  let event = 'message'
  let data = ''
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) data += line.slice(5).trim()
  }
  if (!data) return

  let payload: unknown
  try {
    payload = JSON.parse(data)
  } catch {
    return
  }

  switch (event) {
    case 'meta': {
      const parsed = aiSearchMetaSchema.safeParse(payload)
      if (parsed.success) callbacks.onMeta(parsed.data)
      break
    }
    case 'token': {
      const t = (payload as { t?: unknown })?.t
      if (typeof t === 'string') callbacks.onToken(t)
      break
    }
    case 'done': {
      const parsed = aiSearchDoneSchema.safeParse(payload)
      if (parsed.success) callbacks.onDone(parsed.data)
      break
    }
    case 'error': {
      const message = (payload as { message?: unknown })?.message
      callbacks.onError(typeof message === 'string' ? message : 'AI search failed.')
      break
    }
  }
}

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiChatCallbacks {
  onProducts: (products: ScoredProduct[]) => void
  onToken: (token: string) => void
  onDone: () => void
  onError: (message: string) => void
}

const CHAT_PATH = '/api/ai/chat/stream'

/**
 * POSTs the conversation to the AI chat stream and dispatches SSE events.
 * The assistant may reply with a clarifying question (token events only) or,
 * once it has enough context, emit a `products` event followed by a streamed
 * recommendation.
 */
export async function streamAiChat(
  messages: AiChatMessage[],
  callbacks: AiChatCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${CHAT_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ messages }),
      credentials: 'include',
      signal,
    })
  } catch (error) {
    if ((error as { name?: string } | undefined)?.name === 'AbortError') return
    callbacks.onError('Unable to reach the shopping assistant.')
    return
  }

  if (!response.ok) {
    let message = 'The shopping assistant is unavailable.'
    try {
      const body = (await response.json()) as { error?: { message?: string } }
      if (body?.error?.message) message = body.error.message
    } catch {
      /* non-JSON response body */
    }
    if (response.status === 429) {
      message = 'Too many messages — please wait a moment before trying again.'
    }
    callbacks.onError(message)
    return
  }

  if (!response.body) {
    callbacks.onError('No response stream from the shopping assistant.')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let separatorIndex
      while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)
        dispatchChatChunk(raw, callbacks)
      }
    }
    if (buffer.trim()) dispatchChatChunk(buffer, callbacks)
  } catch (error) {
    if ((error as { name?: string } | undefined)?.name !== 'AbortError') {
      callbacks.onError('The shopping assistant connection was interrupted.')
    }
  }
}

function dispatchChatChunk(raw: string, callbacks: AiChatCallbacks): void {
  let event = 'message'
  let data = ''
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) data += line.slice(5).trim()
  }
  if (!data) return

  let payload: unknown
  try {
    payload = JSON.parse(data)
  } catch {
    return
  }

  switch (event) {
    case 'products': {
      const parsed = chatProductsSchema.safeParse(payload)
      if (parsed.success) callbacks.onProducts(parsed.data.products)
      break
    }
    case 'token': {
      const t = (payload as { t?: unknown })?.t
      if (typeof t === 'string') callbacks.onToken(t)
      break
    }
    case 'done': {
      callbacks.onDone()
      break
    }
    case 'error': {
      const message = (payload as { message?: unknown })?.message
      callbacks.onError(typeof message === 'string' ? message : 'The shopping assistant failed.')
      break
    }
  }
}
