import { X, Loader2, ExternalLink, Maximize2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewUrl: string
  publicUrl?: string
  title?: string
}

export default function PreviewModal({
  isOpen,
  onClose,
  previewUrl,
  publicUrl,
  title = 'Vista previa',
}: PreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Force iframe reload by changing key
      setIframeKey((prev) => prev + 1)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`relative flex flex-col rounded-lg bg-background shadow-2xl transition-all duration-300 ${
          isFullscreen ? 'm-0 h-full w-full rounded-none' : 'm-4 h-[90vh] w-[95vw] max-w-[1600px]'
        }`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-lg border-b bg-background px-6 py-4">
          <h2 className="truncate pr-4 text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {publicUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                className="gap-2"
                title="Ver versión pública"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Público</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(previewUrl, '_blank')}
              className="gap-2"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva pestaña</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10" title="Cerrar">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={previewUrl}
            className="h-full w-full border-0"
            onLoad={handleIframeLoad}
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>
      </div>
    </div>
  )

  // Use portal to render at document root
  return createPortal(modalContent, document.body)
}
