import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { Lamp } from 'lucide-react'

interface FallbackImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
}

export const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  alt = 'Sản phẩm LumiShop',
  className,
  fallbackClassName,
  ...props
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (hasError || !src) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 select-none',
          fallbackClassName || className
        )}
      >
        <Lamp className="w-8 h-8 stroke-1 text-slate-400 mb-1" />
        <span className="text-[11px] font-medium tracking-tight text-slate-500">
          LumiShop
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  )
}
