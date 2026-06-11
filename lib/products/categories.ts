// Canonical category list — keys are the exact productCategory values in the DB.
export const PRODUCT_CATEGORIES: Record<string, { label: string; description: string; image: string }> = {
  headphones: {
    label: 'Headphones',
    description: 'Premium audio for every moment — studio, commute, or the gym.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80',
  },
  jackets: {
    label: 'Jackets',
    description: 'Outerwear built for style and the elements.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&q=80',
  },
  shoes: {
    label: 'Shoes',
    description: 'Every step, elevated.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80',
  },
  watch: {
    label: 'Watches',
    description: 'Time kept beautifully.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80',
  },
  backpack: {
    label: 'Backpacks',
    description: 'Carry more, in style.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80',
  },
  sunglass: {
    label: 'Sunglasses',
    description: 'Shade with attitude.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1600&q=80',
  },
  streetwear: {
    label: 'Streetwear',
    description: 'Bold fits for the streets.',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80',
  },
}

// Ordered list of category keys for use in dropdowns and navigation.
export const CATEGORY_KEYS = Object.keys(PRODUCT_CATEGORIES) as (keyof typeof PRODUCT_CATEGORIES)[]
