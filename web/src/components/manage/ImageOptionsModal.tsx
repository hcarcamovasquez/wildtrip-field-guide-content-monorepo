import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'

interface ImageOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (options: ImageOptions) => void
  onDelete?: () => void
  initialOptions?: ImageOptions
  isEditing?: boolean
}

export interface ImageOptions {
  size: 'small' | 'medium' | 'large' | 'full' | 'custom'
  width?: string
  height?: string
  customHeight?: string
  border?: boolean
}

const SIZE_PRESETS = {
  small: { width: '25%', height: 'auto' },
  medium: { width: '50%', height: 'auto' },
  large: { width: '75%', height: 'auto' },
  full: { width: '100%', height: 'auto' },
}

export default function ImageOptionsModal({
  open,
  onOpenChange,
  onConfirm,
  onDelete,
  initialOptions = { size: 'medium', border: false },
  isEditing = false,
}: ImageOptionsModalProps) {
  const [options, setOptions] = useState<ImageOptions>(() => ({
    size: initialOptions.size || 'medium',
    width: initialOptions.width,
    height: initialOptions.height || 'auto',
    customHeight: initialOptions.customHeight,
    border: initialOptions.border || false,
  }))
  const [customWidth, setCustomWidth] = useState(initialOptions.width || '')
  const [customHeight, setCustomHeight] = useState(initialOptions.customHeight || '')

  useEffect(() => {
    if (open) {
      setOptions(initialOptions)
      setCustomWidth(initialOptions.width || '')
      setCustomHeight(initialOptions.customHeight || '')
    }
  }, [open, initialOptions.size, initialOptions.width, initialOptions.customHeight, initialOptions.border])

  const handleConfirm = () => {
    const finalOptions: ImageOptions = { ...options }

    if (options.size === 'custom') {
      if (customWidth) {
        finalOptions.width = customWidth.includes('%') || customWidth.includes('px') ? customWidth : `${customWidth}px`
      }
      if (customHeight) {
        finalOptions.height = customHeight.includes('%') || customHeight.includes('px') || customHeight === 'auto' ? customHeight : `${customHeight}px`
        finalOptions.customHeight = finalOptions.height
      } else {
        finalOptions.height = 'auto'
      }
    } else {
      const preset = SIZE_PRESETS[options.size]
      finalOptions.width = preset.width
      finalOptions.height = preset.height
    }

    onConfirm(finalOptions)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tamaño de imagen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Seleccionar tamaño</Label>
            <RadioGroup value={options.size} onValueChange={(value: any) => setOptions({ ...options, size: value })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="size-small" />
                <Label htmlFor="size-small" className="font-normal">
                  Pequeño (25%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="size-medium" />
                <Label htmlFor="size-medium" className="font-normal">
                  Mediano (50%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="size-large" />
                <Label htmlFor="size-large" className="font-normal">
                  Grande (75%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="size-full" />
                <Label htmlFor="size-full" className="font-normal">
                  Ancho completo (100%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="size-custom" />
                <Label htmlFor="size-custom" className="font-normal">
                  Personalizado
                </Label>
              </div>
            </RadioGroup>

            {options.size === 'custom' && (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="custom-width">Ancho personalizado</Label>
                  <Input
                    id="custom-width"
                    placeholder="ej: 300px o 60%"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-height">Alto personalizado</Label>
                  <Input
                    id="custom-height"
                    placeholder="ej: 200px, 50% o auto"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Opción de borde */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="border"
                checked={options.border || false}
                onCheckedChange={(checked) => setOptions({ ...options, border: checked as boolean })}
              />
              <Label htmlFor="border" className="cursor-pointer font-normal">
                Agregar borde
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between">
          <div>
            {isEditing && onDelete && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete()
                  onOpenChange(false)
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar imagen
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Aplicar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}