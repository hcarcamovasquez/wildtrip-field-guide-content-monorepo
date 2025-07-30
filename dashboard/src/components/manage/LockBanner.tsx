import { Lock, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface LockBannerProps {
  lockedBy: string
  onClose?: () => void
}

export default function LockBanner({ lockedBy, onClose }: LockBannerProps) {
  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-900">
          <strong>{lockedBy}</strong> está editando este contenido actualmente. Podrás editarlo cuando termine.
        </span>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-4 hover:bg-orange-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
