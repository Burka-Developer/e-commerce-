import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative overflow-hidden h-64">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="w-full h-9" />
      </CardFooter>
    </Card>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative overflow-hidden h-40">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="p-4">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-2/3 mb-3" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

