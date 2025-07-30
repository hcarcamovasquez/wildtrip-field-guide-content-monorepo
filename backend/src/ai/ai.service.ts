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
    this.accountId = this.configService.get<string>('cloudflare.accountId') || '';
    this.apiToken = this.configService.get<string>('cloudflare.apiToken') || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run`;

    if (!this.accountId || !this.apiToken) {
      console.warn('Cloudflare AI credentials not configured');
    }
  }

  /**
   * Generate SEO content for news articles
   */
  async generateNewsSEO(title: string, summary: string, content: string): Promise<SEOContent> {
    const prompt = `Genera contenido SEO optimizado en español para un artículo de noticias sobre biodiversidad y naturaleza en Chile.

Título del artículo: ${title}
Resumen: ${summary}
Contenido principal: ${content.substring(0, 500)}...

Genera:
1. SEO Title (máximo 60 caracteres, debe incluir palabras clave relevantes)
2. SEO Description (máximo 155 caracteres, atractivo y descriptivo)
3. SEO Keywords (5-8 palabras clave separadas por comas, relevantes para Chile)

Formato de respuesta:
SEO_TITLE: [tu respuesta]
SEO_DESCRIPTION: [tu respuesta]
SEO_KEYWORDS: [tu respuesta]`;

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

Genera:
1. SEO Title (máximo 60 caracteres, incluye nombre común y científico)
2. SEO Description (máximo 155 caracteres, menciona características distintivas y ubicación en Chile)
3. SEO Keywords (5-8 palabras clave separadas por comas, incluye nombres comunes, científicos y hábitat)

Formato de respuesta:
SEO_TITLE: [tu respuesta]
SEO_DESCRIPTION: [tu respuesta]
SEO_KEYWORDS: [tu respuesta]`;

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

Genera:
1. SEO Title (máximo 60 caracteres, incluye nombre y tipo de área protegida)
2. SEO Description (máximo 155 caracteres, destaca atractivos naturales y ubicación)
3. SEO Keywords (5-8 palabras clave separadas por comas, incluye región, tipo de área y atractivos)

Formato de respuesta:
SEO_TITLE: [tu respuesta]
SEO_DESCRIPTION: [tu respuesta]
SEO_KEYWORDS: [tu respuesta]`;

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
      const response = await fetch(`${this.baseUrl}/@cf/meta/llama-3.1-8b-instruct`, {
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
              
              Directrices:
              - Usa palabras clave relevantes para Chile y Latinoamérica
              - El título debe ser atractivo y contener la palabra clave principal
              - La descripción debe incitar al clic y contener palabras clave secundarias
              - Las keywords deben incluir variaciones locales y términos científicos
              - Optimiza para búsquedas en español
              - Considera la intención de búsqueda de usuarios interesados en naturaleza y conservación
              - Sigue EXACTAMENTE el formato solicitado`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

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