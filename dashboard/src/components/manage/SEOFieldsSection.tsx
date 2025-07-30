import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api/client'

interface SEOFieldsSectionProps {
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoKeywordsChange: (value: string) => void
  generateData: {
    type: 'news' | 'species' | 'protected-area'
    data: any
  }
  disabled?: boolean
}

export default function SEOFieldsSection({
  seoTitle,
  seoDescription,
  seoKeywords,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  generateData,
  disabled = false,
}: SEOFieldsSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateSEO = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      let result
      
      switch (generateData.type) {
        case 'news':
          result = await apiClient.ai.generateNewsSEO(generateData.data)
          break
        case 'species':
          result = await apiClient.ai.generateSpeciesSEO(generateData.data)
          break
        case 'protected-area':
          result = await apiClient.ai.generateProtectedAreaSEO(generateData.data)
          break
        default:
          throw new Error('Tipo de contenido no soportado')
      }

      if (result) {
        onSeoTitleChange(result.title)
        onSeoDescriptionChange(result.description)
        onSeoKeywordsChange(result.keywords)
      }
    } catch (error) {
      console.error('Error generating SEO:', error)
      setError(error instanceof Error ? error.message : 'Error al generar contenido SEO')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Optimización SEO</CardTitle>
            <CardDescription>
              Configura los metadatos para mejorar el posicionamiento en buscadores
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSEO}
            disabled={disabled || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar con IA
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="seo-title">
            Título SEO
            <span className="ml-2 text-xs text-muted-foreground">(máx. 60 caracteres)</span>
          </Label>
          <Input
            id="seo-title"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder="Título optimizado para buscadores"
            maxLength={60}
            disabled={disabled || isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            {seoTitle.length}/60 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">
            Descripción SEO
            <span className="ml-2 text-xs text-muted-foreground">(máx. 155 caracteres)</span>
          </Label>
          <Textarea
            id="seo-description"
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder="Descripción atractiva para los resultados de búsqueda"
            maxLength={155}
            rows={3}
            disabled={disabled || isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            {seoDescription.length}/155 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-keywords">
            Palabras clave
            <span className="ml-2 text-xs text-muted-foreground">(separadas por comas)</span>
          </Label>
          <Textarea
            id="seo-keywords"
            value={seoKeywords}
            onChange={(e) => onSeoKeywordsChange(e.target.value)}
            placeholder="biodiversidad, chile, naturaleza, conservación"
            rows={2}
            disabled={disabled || isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Ingresa palabras clave relevantes separadas por comas
          </p>
        </div>
      </CardContent>
    </Card>
  )
}