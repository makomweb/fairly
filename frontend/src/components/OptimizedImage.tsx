import { ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  fallback?: string
}

/**
 * Optimized Image Component mit:
 * - Lazy Loading
 * - WebP Support
 * - Responsive srcSet
 * - Fallback auf Error
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallback,
  className,
  ...props
}: OptimizedImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallback) {
      e.currentTarget.src = fallback
    }
    props.onError?.(e as any)
  }

  return (
    <picture>
      {/* WebP Format für moderne Browser */}
      <source srcSet={`${src}?fmt=webp`} type="image/webp" />
      {/* Fallback auf Original */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={cn('object-cover', className)}
        onError={handleError}
        {...props}
      />
    </picture>
  )
}

/**
 * Utility zur Generierung von responsive Image URLs
 */
export function getResponsiveImageUrl(baseUrl: string, size: 'sm' | 'md' | 'lg'): string {
  const sizes = {
    sm: '400',
    md: '800',
    lg: '1200',
  }
  return `${baseUrl}?w=${sizes[size]}`
}
