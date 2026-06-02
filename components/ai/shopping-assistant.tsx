"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Send, Astroid, X } from "lucide-react";

import { streamAiChat, type AiChatMessage, type ScoredProduct } from "@/lib/ai";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

// ScoredProduct has no image, so map a category to a stable Unsplash photo.
const CATEGORY_IMAGES: { match: RegExp; src: string }[] = [
  { match: /head|audio|ear|sound/i, src: "photo-1505740420928-5e560c06d30e" },
  {
    match: /jacket|coat|outerwear|shell/i,
    src: "photo-1551028719-00167b16eac5",
  },
  { match: /back ?pack|bag|travel/i, src: "photo-1553062407-98eeb64c6a62" },
  { match: /shoe|sneaker|run|foot/i, src: "photo-1542291026-7eec264c27ff" },
  { match: /watch/i, src: "photo-1523275335684-37898b6baf30" },
  { match: /sun ?glass|eyewear/i, src: "photo-1511499767150-a48a237f0083" },
  { match: /camera|photo|lens/i, src: "photo-1516035069371-29a1b244cc32" },
];
const DEFAULT_IMAGE = "photo-1441986300917-64674bd600d8";

function imageFor(category: string, name: string) {
  const hay = `${category} ${name}`;
  const hit = CATEGORY_IMAGES.find((entry) => entry.match.test(hay));
  return `https://images.unsplash.com/${hit?.src ?? DEFAULT_IMAGE}?auto=format&fit=crop&w=200&q=70`;
}

interface Suggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
  error?: boolean;
  suggestions?: Suggestion[];
  seeAllQuery?: string;
  quickReplies?: string[];
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  text: "Hi! I'm your Shopy shopping assistant. Tell me what you're after — a category, a budget, or a vibe — and I'll find the right pieces for you.",
  quickReplies: [
    "Headphones under $200",
    "A waterproof jacket",
    "Gifts under $50",
    "Running shoes",
  ],
};

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

interface ShoppingAssistantProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function ShoppingAssistant({
  open,
  onClose,
  initialQuery,
}: ShoppingAssistantProps) {
  const router = useRouter();
  const titleId = useId();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededQuery = useRef<string | undefined>(undefined);
  // Mirror messages so `send` always reads the latest history without re-memoizing.
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const send = useCallback(
    (raw: string) => {
      const query = raw.trim();
      if (!query || sending) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Build the conversation history from prior turns, then the new message.
      const history: AiChatMessage[] = messagesRef.current
        .filter((m) => !m.error && m.text.trim())
        .map((m) => ({ role: m.role, content: m.text }));
      history.push({ role: "user", content: query });

      const assistantId = nextId();
      setInput("");
      setSending(true);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: query },
        { id: assistantId, role: "assistant", text: "", streaming: true },
      ]);

      const patch = (changes: Partial<Message>) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...changes } : m)),
        );

      void streamAiChat(
        history.slice(-16),
        {
          onProducts: (products) => {
            const suggestions: Suggestion[] = products
              .slice(0, 4)
              .map((p: ScoredProduct) => ({
                id: p._id,
                name: p.productName,
                category: p.productCategory,
                price: p.productPrice,
                currency: p.productCurrency,
              }));
            patch({ suggestions, seeAllQuery: query });
          },
          onToken: (token) =>
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + token } : m,
              ),
            ),
          onDone: () => {
            patch({ streaming: false });
            setSending(false);
          },
          onError: (message) => {
            patch({
              streaming: false,
              error: true,
              text:
                message ||
                "I couldn't reach the assistant just now. You can browse everything in the meantime.",
              quickReplies: undefined,
            });
            setSending(false);
          },
        },
        controller.signal,
      );
    },
    [sending],
  );

  // Reset to the greeting and optionally auto-send the hero query each time it opens.
  useEffect(() => {
    if (!open) return;
    setMessages([GREETING]);
    if (
      initialQuery &&
      initialQuery.trim() &&
      seededQuery.current !== initialQuery
    ) {
      seededQuery.current = initialQuery;
      send(initialQuery);
    }
    if (!initialQuery) seededQuery.current = undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuery]);

  // Body scroll lock + Escape to close.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const goToProduct = (id: string) => {
    onClose();
    router.push(`/products/${id}`);
  };

  const goToResults = (query: string) => {
    onClose();
    router.push(
      query.trim() ? `/search?q=${encodeURIComponent(query)}` : "/products",
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex items-stretch justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="glass relative flex w-full flex-col overflow-hidden border-border bg-background/95 shadow-2xl sm:max-w-xl sm:rounded-none"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center bg-primary text-primary-foreground">
                  <Astroid className="size-4" />
                </span>
                <div className="leading-tight">
                  <p
                    id={titleId}
                    className="font-heading text-sm font-semibold"
                  >
                    Shopy Assistant
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Grounded in the live catalog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close assistant"
                className="grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:h-[72vh]"
            >
              {messages.map((message) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  onQuickReply={send}
                  onProduct={goToProduct}
                  onSeeAll={goToResults}
                />
              ))}
            </div>

            {/* Composer */}
            <form
              className="flex items-end gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask for anything — “warm jacket under $150”"
                aria-label="Message the shopping assistant"
                className="max-h-32 flex-1 resize-none bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label="Send"
                className="grid size-10 shrink-0 place-items-center bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MessageRow({
  message,
  onQuickReply,
  onProduct,
  onSeeAll,
}: {
  message: Message;
  onQuickReply: (text: string) => void;
  onProduct: (id: string) => void;
  onSeeAll: (query: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isUser ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : message.error
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-foreground",
        )}
      >
        {message.text ? (
          <span className="whitespace-pre-line">{message.text}</span>
        ) : message.streaming ? (
          <TypingDots />
        ) : null}
        {message.streaming && message.text && (
          <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-foreground/60" />
        )}
      </div>

      {/* Product suggestions */}
      {message.suggestions && message.suggestions.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-2">
          {message.suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onProduct(product.id)}
              className="group flex items-center gap-2.5 border border-border bg-card p-2 text-left transition-colors hover:border-primary/60"
            >
              <span className="relative size-12 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={imageFor(product.category, product.name)}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-xs font-medium text-foreground group-hover:text-primary">
                  {product.name}
                </span>
                <span className="font-heading mt-0.5 block text-xs font-semibold tabular-nums">
                  {formatPrice(product.price, product.currency)}
                </span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </button>
          ))}
        </div>
      )}

      {/* See all results */}
      {message.seeAllQuery && (
        <button
          type="button"
          onClick={() => onSeeAll(message.seeAllQuery as string)}
          className="inline-flex items-center gap-1 border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/60 hover:text-primary"
        >
          See all results
          <ArrowUpRight className="size-3.5" />
        </button>
      )}

      {/* Quick replies */}
      {message.quickReplies && message.quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onQuickReply(reply)}
              className="border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {message.error && (
        <button
          type="button"
          onClick={() => onSeeAll("")}
          className="inline-flex items-center gap-1 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          Browse the catalog
          <ArrowUpRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span
      className="flex items-center gap-1 py-0.5"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-foreground/40"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
