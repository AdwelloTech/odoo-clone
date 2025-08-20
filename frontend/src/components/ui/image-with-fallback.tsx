import React, { useState } from 'react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { getImageUrl, handleImageError } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFallbackIcon?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const fallbackIconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-12 h-12', 
  xl: 'w-16 h-16'
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackClassName,
  size = 'md',
  showFallbackIcon = true
}) => {
  const [imageError, setImageError] = useState(false)
  const imageUrl = getImageUrl(src)
  const showImage = imageUrl && !imageError

  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true)
    handleImageError(e)
  }

  if (!showImage) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center',
          sizeClasses[size],
          fallbackClassName
        )}
      >
        {showFallbackIcon && (
          <UserCircleIcon className={cn('text-white', fallbackIconSizes[size])} />
        )}
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      onError={handleImageLoadError}
    />
  )
}
