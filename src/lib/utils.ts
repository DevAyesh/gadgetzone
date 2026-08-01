import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price / 100).replace('LKR', 'Rs. ');
}

export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns Tailwind colour classes for a given order status.
 * Centralises the colour logic that was previously duplicated across 3 files.
 */
export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'pending':    return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    case 'processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'shipped':    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'delivered':  return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    case 'cancelled':  return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default:           return 'bg-muted text-muted-foreground border-border';
  }
}

/**
 * Converts a string to a URL-safe slug.
 * e.g. "Apple iPhone 16 Pro!" → "apple-iphone-16-pro"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
