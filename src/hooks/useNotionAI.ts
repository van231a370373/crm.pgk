import { useState } from 'react';
import { useGeminiAI } from './useGeminiAI';
import { Client } from '../types';

interface NotionAIResponse {
  content: string;
  confidence: number;
  category?: string;
}

interface ClientAnalysis {
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'documentacion' | 'residencia' | 'trabajo' | 'familia' | 'consulta_general';
  keyPoints: string[];
  nextActions: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface InteractionSummary {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  followUpNeeded: boolean;
  followUpDate?: string;
}

export const useNotionAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { chatWithAssistant } = useGeminiAI();

  // Prompt templates adaptados de Notion AI para CRM
  const SYSTEM_PROMPTS = {
    CLIENT_ANALYSIS: `Eres un asistente especializado en análisis de clientes para una consultoría legal de inmigración polaca.
    
    Analiza la información del cliente y proporciona:
    1. Resumen ejecutivo de la situación del cliente
    2. Nivel de urgencia (low, medium, high, critical) basado en:
       - Fechas límite de documentos
       - Complejidad del caso
       - Estado emocional del cliente
    3. Categorización del tipo de consulta
    4. Puntos clave extraídos
    5. Próximas acciones recomendadas
    6. Análisis de sentimiento
    
    Responde SIEMPRE en español y en formato JSON válido.`,

    INTERACTION_SUMMARIZER: `Eres un asistente que resume interacciones con clientes de inmigración polaca.
    
    Resume la conversación identificando:
    1. Resumen conciso de la interacción
    2. Decisiones clave tomadas
    3. Tareas y acciones pendientes
    4. Si se necesita seguimiento y cuándo
    
    Sé conciso pero completo. Responde en español y formato JSON válido.`,

    SMART_SEARCH: `Realiza búsqueda semántica inteligente en la información de clientes.
    
    Analiza la consulta y encuentra:
    1. Clientes con situaciones similares
    2. Casos relacionados por tipo de trámite
    3. Patrones en los datos
    4. Recomendaciones basadas en casos exitosos
    
    Proporciona resultados relevantes y contextualizados en español.`,

    RESPONSE_GENERATOR: `Genera respuestas profesionales para consultas de clientes sobre inmigración polaca.
    
    Características de las respuestas:
    - Profesionales pero cálidas
    - Específicas al contexto del cliente
    - Incluyen próximos pasos claros
    - Mencionan documentos necesarios cuando aplique
    - Estimaciones realistas de tiempos
    
    Responde siempre en español con un tono empático y profesional.`
  };

  // Análisis inteligente de cliente
  const analyzeClient = async (client: Client, additionalNotes?: string): Promise<ClientAnalysis> => {
    setIsProcessing(true);
    try {
      const prompt = `${SYSTEM_PROMPTS.CLIENT_ANALYSIS}

Cliente: ${client.name}
Email: ${client.emails?.[0]?.value || 'No disponible'}
Teléfono: ${client.phones?.[0]?.value || 'No disponible'}
Tipo de Consulta: ${client.consultationType}
Status: ${client.status}
Fecha de Registro: ${new Date(client.createdAt).toLocaleDateString()}
${client.notes ? `Notas: ${client.notes}` : ''}
${additionalNotes ? `Información adicional: ${additionalNotes}` : ''}

Analiza este cliente y responde en el siguiente formato JSON:
{
  "summary": "Resumen ejecutivo del cliente",
  "urgency": "low|medium|high|critical",
  "category": "documentacion|residencia|trabajo|familia|consulta_general",
  "keyPoints": ["punto1", "punto2", "punto3"],
  "nextActions": ["accion1", "accion2", "accion3"],
  "sentiment": "positive|neutral|negative"
}`;

      const response = await chatWithAssistant(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing client:', error);
      // Fallback analysis
      return {
        summary: `Cliente ${client.name} con consulta de ${client.consultationType}`,
        urgency: 'medium',
        category: 'consulta_general',
        keyPoints: [`Tipo: ${client.consultationType}`, `Status: ${client.status}`],
        nextActions: ['Revisar documentación', 'Programar seguimiento'],
        sentiment: 'neutral'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Resumidor de interacciones
  const summarizeInteraction = async (
    client: Client, 
    messages: string[], 
    context?: string
  ): Promise<InteractionSummary> => {
    setIsProcessing(true);
    try {
      const conversationText = messages.join('\n');
      
      const prompt = `${SYSTEM_PROMPTS.INTERACTION_SUMMARIZER}

Cliente: ${client.name}
Tipo de Consulta: ${client.consultationType}
${context ? `Contexto: ${context}` : ''}

Conversación:
${conversationText}

Resume esta interacción en el siguiente formato JSON:
{
  "summary": "Resumen de la conversación",
  "keyDecisions": ["decisión1", "decisión2"],
  "actionItems": ["tarea1", "tarea2"],
  "followUpNeeded": true/false,
  "followUpDate": "YYYY-MM-DD" (opcional)
}`;

      const response = await chatWithAssistant(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error summarizing interaction:', error);
      return {
        summary: `Interacción con ${client.name} sobre ${client.consultationType}`,
        keyDecisions: [],
        actionItems: ['Revisar conversación'],
        followUpNeeded: true
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Búsqueda semántica inteligente
  const smartSearch = async (
    query: string, 
    clients: Client[], 
    searchType: 'similar_cases' | 'client_search' | 'pattern_analysis' = 'client_search'
  ): Promise<Client[]> => {
    setIsProcessing(true);
    try {
      const clientsContext = clients.map(c => 
        `ID: ${c.id}, Nombre: ${c.name}, Tipo: ${c.consultationType}, Status: ${c.status}, Notas: ${c.notes || 'Sin notas'}`
      ).join('\n');

      const prompt = `${SYSTEM_PROMPTS.SMART_SEARCH}

Consulta: "${query}"
Tipo de búsqueda: ${searchType}

Clientes disponibles:
${clientsContext}

Encuentra y lista los IDs de los clientes más relevantes para esta consulta.
Responde solo con los IDs separados por comas (ejemplo: 1,3,5)`;

      const response = await chatWithAssistant(prompt);
      const relevantIds = response.split(',').map((id: string) => id.trim());
      
      return clients.filter(client => 
        relevantIds.includes(client.id.toString()) ||
        relevantIds.includes(client.id)
      );
    } catch (error) {
      console.error('Error in smart search:', error);
      // Fallback to basic search
      return clients.filter(client =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.consultationType.toLowerCase().includes(query.toLowerCase()) ||
        (client.notes && client.notes.toLowerCase().includes(query.toLowerCase()))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Generador de respuestas automáticas
  const generateAutoResponse = async (
    query: string,
    clientContext: Client,
    responseType: 'consultation' | 'follow_up' | 'document_request' | 'status_update' = 'consultation'
  ): Promise<NotionAIResponse> => {
    setIsProcessing(true);
    try {
      const prompt = `${SYSTEM_PROMPTS.RESPONSE_GENERATOR}

Cliente: ${clientContext.name}
Tipo de Consulta: ${clientContext.consultationType}
Status Actual: ${clientContext.status}
Consulta del Cliente: "${query}"
Tipo de Respuesta: ${responseType}

Genera una respuesta profesional y empática que:
1. Reconozca la consulta específica
2. Proporcione información útil
3. Incluya próximos pasos claros
4. Mantenga un tono profesional pero cálido

Responde en formato JSON:
{
  "content": "Respuesta completa al cliente",
  "confidence": 0-100,
  "category": "categoria_de_la_respuesta"
}`;

      const response = await chatWithAssistant(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating auto response:', error);
      return {
        content: `Hola ${clientContext.name}, gracias por tu consulta sobre ${clientContext.consultationType}. Estamos revisando tu caso y te contactaremos pronto con más información.`,
        confidence: 50,
        category: 'respuesta_generica'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Clasificador automático de notas
  const classifyNote = async (note: string, context?: string): Promise<{
    category: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    summary: string;
  }> => {
    setIsProcessing(true);
    try {
      const prompt = `Eres un clasificador inteligente de notas para consultoría de inmigración polaca.

Nota a clasificar: "${note}"
${context ? `Contexto adicional: ${context}` : ''}

Clasifica esta nota determinando:
1. Categoría principal (documentacion, residencia, trabajo, familia, urgente, seguimiento, etc.)
2. Nivel de urgencia
3. Tags relevantes
4. Resumen en una línea

Responde en formato JSON:
{
  "category": "categoria_principal",
  "urgency": "low|medium|high|critical",
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "Resumen en una línea"
}`;

      const response = await chatWithAssistant(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error classifying note:', error);
      return {
        category: 'general',
        urgency: 'medium',
        tags: ['sin_clasificar'],
        summary: note.substring(0, 50) + '...'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    analyzeClient,
    summarizeInteraction,
    smartSearch,
    generateAutoResponse,
    classifyNote
  };
};