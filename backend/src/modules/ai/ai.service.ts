import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CloudflareAIResponse {
  result: {
    response: string;
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface SEOContent {
  title: string;
  description: string;
  keywords: string;
}

@Injectable()
export class AIService {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.accountId =
      this.configService.get<string>('cloudflare.accountId') || '';
    this.apiToken = this.configService.get<string>('cloudflare.apiToken') || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run`;

    if (!this.accountId || !this.apiToken) {
      console.warn('Cloudflare AI credentials not configured');
    }
  }

  /**
   * Generate SEO content for news articles
   */
  async generateNewsSEO(
    title: string,
    summary: string,
    content: string,
  ): Promise<SEOContent> {
    const prompt = `Genera contenido SEO optimizado en español para un artículo de noticias sobre biodiversidad y naturaleza en Chile.

Título del artículo: ${title}
Resumen: ${summary}
Contenido principal: ${content.substring(0, 500)}...

INSTRUCCIONES ESTRICTAS:

1. SEO Title: 
   - DEBE tener entre 50-60 caracteres (NO MÁS DE 60)
   - Incluir el tema principal y "Chile" si es relevante
   - Ejemplo longitud: "Descubren nueva especie de rana en los bosques de Chile" (55 caracteres)

2. SEO Description:
   - DEBE tener entre 145-155 caracteres (NO MÁS DE 155)
   - Comenzar con verbo de acción
   - Incluir dato más relevante y call-to-action
   - Ejemplo longitud: "Conoce los detalles del importante hallazgo científico que podría cambiar la comprensión de la biodiversidad en los ecosistemas chilenos. Lee más aquí." (153 caracteres)

3. SEO Keywords:
   - EXACTAMENTE 6-8 palabras clave
   - Separadas por comas
   - Incluir: tema principal, Chile, región específica si aplica, categoría
   - Ejemplo: "biodiversidad chile, conservación, fauna chilena, [tema específico], naturaleza, medio ambiente"

Formato de respuesta (RESPETAR EXACTAMENTE):
SEO_TITLE: [tu respuesta de 50-60 caracteres]
SEO_DESCRIPTION: [tu respuesta de 145-155 caracteres]
SEO_KEYWORDS: [6-8 palabras clave separadas por comas]`;

    return this.generateSEO(prompt);
  }

  /**
   * Generate SEO content for species
   */
  async generateSpeciesSEO(
    commonName: string,
    scientificName: string,
    description: string,
    habitat?: string,
    conservationStatus?: string,
  ): Promise<SEOContent> {
    const prompt = `Genera contenido SEO optimizado en español para una página de especie de la biodiversidad chilena.

Nombre común: ${commonName}
Nombre científico: ${scientificName}
Descripción: ${description}
${habitat ? `Hábitat: ${habitat}` : ''}
${conservationStatus ? `Estado de conservación: ${conservationStatus}` : ''}

INSTRUCCIONES ESTRICTAS:

1. SEO Title:
   - DEBE tener entre 50-60 caracteres (NO MÁS DE 60)
   - Formato: "[Nombre común] ([Nombre científico]) en Chile" o similar
   - Si el nombre científico es muy largo, usar solo nombre común + característica
   - Ejemplo: "Pudú (Pudu puda): El ciervo más pequeño de Chile" (50 caracteres)

2. SEO Description:
   - DEBE tener entre 145-155 caracteres (NO MÁS DE 155)
   - Incluir: característica distintiva + hábitat + estado conservación si aplica
   - Usar verbos como "Descubre", "Conoce", "Aprende sobre"
   - Ejemplo: "Descubre al pudú, el ciervo más pequeño del mundo que habita los bosques del sur de Chile. Conoce su hábitat, comportamiento y estado de conservación." (151 caracteres)

3. SEO Keywords:
   - EXACTAMENTE 6-8 palabras clave
   - Incluir: nombre común, nombre científico (si no es muy largo), fauna/flora chile, hábitat, región
   - Ejemplo: "pudú, pudu puda, fauna chile, mamíferos chilenos, bosque valdiviano, conservación, sur de chile"

Formato de respuesta (RESPETAR EXACTAMENTE):
SEO_TITLE: [tu respuesta de 50-60 caracteres]
SEO_DESCRIPTION: [tu respuesta de 145-155 caracteres]
SEO_KEYWORDS: [6-8 palabras clave separadas por comas]`;

    return this.generateSEO(prompt);
  }

  /**
   * Generate SEO content for protected areas
   */
  async generateProtectedAreaSEO(
    name: string,
    type: string,
    description: string,
    region?: string,
    keyFeatures?: string[],
  ): Promise<SEOContent> {
    const prompt = `Genera contenido SEO optimizado en español para una página de área protegida de Chile.

Nombre: ${name}
Tipo: ${type}
Descripción: ${description}
${region ? `Región: ${region}` : ''}
${keyFeatures && keyFeatures.length > 0 ? `Características principales: ${keyFeatures.join(', ')}` : ''}

INSTRUCCIONES ESTRICTAS:

1. SEO Title:
   - DEBE tener entre 50-60 caracteres (NO MÁS DE 60)
   - Formato: "[Nombre] - [Tipo] de [Región]" o "[Nombre]: [Característica principal]"
   - Ejemplo: "Parque Nacional Torres del Paine - Patagonia Chilena" (53 caracteres)

2. SEO Description:
   - DEBE tener entre 145-155 caracteres (NO MÁS DE 155)
   - Estructura: Invitación + atractivo principal + actividades/características + ubicación
   - Ejemplo: "Visita el Parque Nacional Torres del Paine y maravíllate con sus imponentes montañas, glaciares y fauna silvestre. Trekking y naturaleza en Patagonia." (152 caracteres)

3. SEO Keywords:
   - EXACTAMENTE 6-8 palabras clave
   - Incluir: nombre del área, tipo (parque nacional/reserva/etc), región, "chile", actividad principal, atractivo natural
   - Ejemplo: "torres del paine, parque nacional chile, patagonia, trekking chile, glaciares, guanacos, turismo naturaleza"

Formato de respuesta (RESPETAR EXACTAMENTE):
SEO_TITLE: [tu respuesta de 50-60 caracteres]
SEO_DESCRIPTION: [tu respuesta de 145-155 caracteres]
SEO_KEYWORDS: [6-8 palabras clave separadas por comas]`;

    return this.generateSEO(prompt);
  }

  /**
   * Generate SEO content with custom prompt
   */
  async generateCustomSEO(prompt: string): Promise<SEOContent> {
    return this.generateSEO(prompt);
  }

  /**
   * Internal method to call Cloudflare AI API
   */
  private async generateSEO(prompt: string): Promise<SEOContent> {
    if (!this.accountId || !this.apiToken) {
      throw new Error('Cloudflare AI credentials not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/@cf/meta/llama-3.1-8b-instruct`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `Eres un experto en SEO y biodiversidad chilena. Tu tarea es generar contenido SEO optimizado para mejorar el posicionamiento en Google Chile. 
              
              REGLAS CRÍTICAS QUE DEBES SEGUIR:
              1. RESPETAR ESTRICTAMENTE los límites de caracteres indicados
              2. CONTAR cada carácter incluyendo espacios y puntuación
              3. El SEO Title NUNCA debe exceder 60 caracteres
              4. El SEO Description NUNCA debe exceder 155 caracteres
              5. SIEMPRE incluir entre 6-8 keywords, ni más ni menos
              
              Directrices de contenido:
              - Usa palabras clave relevantes para Chile y Latinoamérica
              - El título debe ser atractivo y contener la palabra clave principal
              - La descripción debe incitar al clic y contener palabras clave secundarias
              - Las keywords deben incluir variaciones locales y términos científicos
              - Optimiza para búsquedas en español
              - Considera la intención de búsqueda de usuarios interesados en naturaleza y conservación
              
              IMPORTANTE: Si tu respuesta no cumple con los límites de caracteres exactos, será rechazada.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Cloudflare AI API error: ${response.statusText}`);
      }

      const data: CloudflareAIResponse = await response.json();

      if (!data.success) {
        throw new Error(`Cloudflare AI error: ${JSON.stringify(data.errors)}`);
      }

      // Parse the response
      const result = data.result.response;
      const seoTitle = this.extractValue(result, 'SEO_TITLE') || '';
      const seoDescription = this.extractValue(result, 'SEO_DESCRIPTION') || '';
      const seoKeywords = this.extractValue(result, 'SEO_KEYWORDS') || '';

      return {
        title: seoTitle.trim(),
        description: seoDescription.trim(),
        keywords: seoKeywords.trim(),
      };
    } catch (error) {
      console.error('Error generating SEO content:', error);
      throw error;
    }
  }

  /**
   * Extract value from formatted response
   */
  private extractValue(text: string, key: string): string | null {
    const regex = new RegExp(`${key}:\\s*(.+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }
}
