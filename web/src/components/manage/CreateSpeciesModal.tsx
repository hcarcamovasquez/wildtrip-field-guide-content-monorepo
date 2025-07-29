import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateSpeciesModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (speciesId: number) => void
}

export function CreateSpeciesModal({ open, onClose, onSuccess }: CreateSpeciesModalProps) {
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    scientificName: '',
    commonName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.scientificName.trim() || !formData.commonName.trim()) {
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/manage/species', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scientificName: formData.scientificName.trim(),
          commonName: formData.commonName.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onSuccess(data.id)
        setFormData({ scientificName: '', commonName: '' })
      }
    } catch (error) {
      console.error('Error creating species:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva Especie</DialogTitle>
            <DialogDescription>Crea una nueva especie para agregar a la guía de campo</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scientificName">Nombre científico</Label>
              <Input
                id="scientificName"
                value={formData.scientificName}
                onChange={(e) => setFormData((prev) => ({ ...prev, scientificName: e.target.value }))}
                placeholder="Ej: Panthera onca"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commonName">Nombre común</Label>
              <Input
                id="commonName"
                value={formData.commonName}
                onChange={(e) => setFormData((prev) => ({ ...prev, commonName: e.target.value }))}
                placeholder="Ej: Jaguar"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={creating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating || !formData.scientificName.trim() || !formData.commonName.trim()}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear especie
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
