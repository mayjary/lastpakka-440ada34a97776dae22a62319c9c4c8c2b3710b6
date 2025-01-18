import { Suspense } from 'react'
import BudgetContent from '@/components/BudgetContent'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monthly Budget</h1>
      <Suspense fallback={<BudgetSkeleton />}>
        <BudgetContent />
      </Suspense>
    </div>
  )
}

function BudgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-1/3" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

