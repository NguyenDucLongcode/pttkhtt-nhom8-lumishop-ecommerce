import React from 'react'
import { Skeleton } from '../common/Skeleton'

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({
  count = 8,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-3 space-y-3"
        >
          <Skeleton className="w-full aspect-square rounded-lg" />
          <Skeleton className="w-1/3 h-3" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="w-1/2 h-5" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
