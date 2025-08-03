import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { TiptapEditorProps } from './TiptapEditor'

const TiptapEditor = lazy(() => import('./TiptapEditor'))

export default function TiptapEditorLazy(props: TiptapEditorProps) {
  return (
    <Suspense
      fallback={
        <div className="overflow-hidden rounded-lg border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      }
    >
      <TiptapEditor {...props} />
    </Suspense>
  )
}