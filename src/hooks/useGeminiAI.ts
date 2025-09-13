import { GoogleGenerativeAI } from '@google/generative-ai';
import { useState } from 'react';

// API Key desde variables de entorno
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC3Vke-ZAYqDI5xrAgsh38H1a3RwedUDus';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Tipos para el asistente
export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface AIAnalysis {
  summary: string;
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
  nextActions: string[];
}

export const useGeminiAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat general con el asistente
  const chatWithAssistant = async (message: string, context?: string): Promise<string> => {
    console.log('🤖 Iniciando chat con asistente:', { message, context });
    setLoading(true);
    setError(null);
    
    try {
      // Validar API Key
      if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 30) {
        throw new Error('API Key de Gemini no válida o no configurada');
      }

      console.log('🔑 API Key validada, iniciando modelo...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Eres un asistente IA especializado en CRM para Polska Grupa Konsultingowa.
Tu función es ayudar al usuario a gestionar mejor su CRM y sus clientes.

${context ? `Contexto actual: ${context}` : ''}

Usuario pregunta: "${message}"

Responde de manera:
- Profesional pero amigable
- Específica y accionable
- En español
- Con sugerencias prácticas para mejorar la gestión del CRM

Si la pregunta es sobre un cliente específico, incluye análisis y recomendaciones.
Si es sobre el negocio, proporciona insights y estrategias.
`;

      console.log('📝 Enviando prompt a Gemini...');
      const result = await model.generateContent(prompt);
      
      console.log('📥 Respuesta recibida, procesando...');
      const response = await result.response;
      
      // Verificar si la respuesta fue bloqueada por filtros de seguridad
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        console.error('❌ No hay candidatos en la respuesta');
        throw new Error('La respuesta fue filtrada por políticas de seguridad. Intenta reformular tu pregunta.');
      }

      const text = response.text();
      console.log('✅ Texto extraído exitosamente:', text.substring(0, 100) + '...');
      
      setLoading(false);
      return text;
      
    } catch (err) {
      console.error('💥 Error en chatWithAssistant:', err);
      
      let errorMessage = 'Error desconocido al comunicarse con IA';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Mensajes específicos para diferentes tipos de error
        if (err.message.includes('API_KEY_INVALID')) {
          errorMessage = 'La API Key de Gemini no es válida. Verifica la configuración.';
        } else if (err.message.includes('QUOTA_EXCEEDED')) {
          errorMessage = 'Se ha excedido la cuota de la API de Gemini. Intenta más tarde.';
        } else if (err.message.includes('SAFETY')) {
          errorMessage = 'Tu consulta fue bloqueada por filtros de seguridad. Intenta reformularla.';
        } else if (err.message.includes('BLOCKED')) {
          errorMessage = 'El contenido fue bloqueado. Intenta con una pregunta diferente.';
        }
      }
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Analizar datos de un cliente específico
  const analyzeClient = async (clientData: any): Promise<AIAnalysis> => {
    setLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Analiza estos datos del cliente y proporciona insights profesionales:

DATOS DEL CLIENTE:
- Nombre: ${clientData.name}
- Email: ${clientData.emails?.[0] || 'No disponible'}
- Teléfono: ${clientData.phones?.[0] || 'No disponible'}
- Empresa: ${clientData.company || 'No especificada'}
- Tipo de consulta: ${clientData.consultation_type}
- Estado actual: ${clientData.status}
- Prioridad: ${clientData.priority}
- Notas: ${clientData.notes}
- Fecha de creación: ${clientData.created_at}
- Categoría: ${clientData.category}
- Fuente: ${clientData.source || 'No especificada'}

Proporciona:
1. Un resumen profesional del caso
2. 3-5 sugerencias específicas de acción
3. Evaluación de prioridad (low/medium/high) con justificación
4. 2-3 próximos pasos recomendados

Formato la respuesta como JSON:
{
  "summary": "resumen del caso",
  "suggestions": ["sugerencia 1", "sugerencia 2", ...],
  "priority": "high|medium|low",
  "nextActions": ["acción 1", "acción 2", ...]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Intentar parsear como JSON, si falla devolver estructura básica
      try {
        const analysis = JSON.parse(text.replace('```json', '').replace('```', ''));
        setLoading(false);
        return analysis;
      } catch {
        // Si el JSON falla, crear estructura manualmente
        setLoading(false);
        return {
          summary: text.substring(0, 200) + '...',
          suggestions: ['Revisar caso manualmente', 'Contactar al cliente', 'Actualizar información'],
          priority: 'medium' as const,
          nextActions: ['Seguimiento en 24 horas', 'Documentar progreso']
        };
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar cliente');
      setLoading(false);
      throw err;
    }
  };

  // Generar respuesta automática para WhatsApp
  const generateWhatsAppResponse = async (
    clientData: any, 
    incomingMessage: string, 
    conversationHistory?: string[]
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const historyText = conversationHistory?.join('\n') || 'Sin historial previo';
      
      const prompt = `
Genera una respuesta profesional de WhatsApp para Polska Grupa Konsultingowa.

INFORMACIÓN DEL CLIENTE:
- Nombre: ${clientData.name}
- Servicio: ${clientData.consultation_type}
- Estado del caso: ${clientData.status}
- Notas del caso: ${clientData.notes}

HISTORIAL DE CONVERSACIÓN:
${historyText}

MENSAJE RECIBIDO:
"${incomingMessage}"

Genera una respuesta que sea:
- Profesional pero cálida
- Específica al caso del cliente
- Útil y accionable
- En español
- Máximo 2-3 párrafos
- Incluir próximos pasos si es relevante

NO uses emojis excesivos, mantén un tono profesional de consultoría.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setLoading(false);
      return text;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar respuesta');
      setLoading(false);
      throw err;
    }
  };

  // Generar insights del negocio
  const generateBusinessInsights = async (clients: any[], tasks: any[]): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Preparar estadísticas
      const totalClients = clients.length;
      const clientsByStatus = clients.reduce((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      }, {});
      
      const clientsByCategory = clients.reduce((acc, client) => {
        acc[client.category] = (acc[client.category] || 0) + 1;
        return acc;
      }, {});
      
      const totalTasks = tasks.length;
      const tasksByStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      const prompt = `
Analiza estos datos del CRM de Polska Grupa Konsultingowa y genera insights profesionales:

ESTADÍSTICAS DE CLIENTES:
- Total de clientes: ${totalClients}
- Por estado: ${JSON.stringify(clientsByStatus)}
- Por categoría: ${JSON.stringify(clientsByCategory)}

ESTADÍSTICAS DE TAREAS:
- Total de tareas: ${totalTasks}
- Por estado: ${JSON.stringify(tasksByStatus)}

Proporciona:
1. Análisis de tendencias actuales
2. Oportunidades identificadas
3. Áreas de mejora
4. Recomendaciones estratégicas específicas
5. Alertas o puntos de atención

Respuesta en español, profesional, estructurada con bullets o números.
Enfócate en acciones concretas que puede tomar el usuario.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setLoading(false);
      return text;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar insights');
      setLoading(false);
      throw err;
    }
  };

  // Extraer datos de cliente de texto libre
  const extractClientData = async (freeText: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Extrae información del cliente del siguiente texto y estructura los datos en formato JSON.

TEXTO PROPORCIONADO:
"${freeText}"

Extrae y estructura la siguiente información (usa "No especificado" si no encuentras el dato):
- Nombre completo
- Teléfono(s) 
- Email(s)
- Empresa (si aplica)
- Tipo de consulta/servicio solicitado
- Notas adicionales
- Prioridad estimada (low/medium/high)
- Categoría del servicio (IRNR, Alta autónomo, Constitución SL, Laboral, Fiscal, etc.)

FORMATO DE RESPUESTA ESTRICTO - SOLO JSON:
{
  "name": "Nombre Completo",
  "phones": [{"value": "+34 XXX XXX XXX", "label": "Móvil", "isPrimary": true}],
  "emails": [{"value": "email@domain.com", "label": "Personal", "isPrimary": true}],
  "company": "Nombre empresa o vacío",
  "consultationType": "Descripción del servicio",
  "category": "Categoría del servicio",
  "notes": "Información adicional extraída",
  "priority": "low|medium|high",
  "source": "llamada"
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, sin texto adicional.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Limpiar y parsear JSON
      let cleanJson = text;
      if (text.includes('```json')) {
        cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      
      try {
        const extractedData = JSON.parse(cleanJson);
        
        // Validar datos mínimos
        if (!extractedData.name || extractedData.name === "No especificado") {
          throw new Error('No se pudo extraer el nombre del cliente');
        }
        
        // Asegurar estructura de arrays
        if (!Array.isArray(extractedData.phones)) {
          extractedData.phones = extractedData.phones ? 
            [{ value: extractedData.phones, label: "Móvil", isPrimary: true }] : 
            [];
        }
        
        if (!Array.isArray(extractedData.emails)) {
          extractedData.emails = extractedData.emails ? 
            [{ value: extractedData.emails, label: "Personal", isPrimary: true }] : 
            [];
        }
        
        // Añadir IDs a contactos
        extractedData.phones = extractedData.phones.map((phone: any, index: number) => ({
          ...phone,
          id: `phone-${index + 1}`,
          isPrimary: index === 0
        }));
        
        extractedData.emails = extractedData.emails.map((email: any, index: number) => ({
          ...email,
          id: `email-${index + 1}`,
          isPrimary: index === 0
        }));
        
        // Valores por defecto
        extractedData.status = 'pending';
        extractedData.aiSuggestions = 'Cliente creado automáticamente por IA. Revisar y completar información.';
        extractedData.driveLinks = [];
        extractedData.keyDates = {
          birthday: '',
          paymentDue: '',
          renewal: '',
          closing: ''
        };
        
        setLoading(false);
        return extractedData;
        
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError, 'Text:', cleanJson);
        throw new Error('No se pudieron extraer los datos del cliente. Verifica que el texto contenga información completa.');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al extraer datos');
      setLoading(false);
      throw err;
    }
  };

  // Nueva función para extraer datos de documentos de identidad usando Vision API
  const extractDataFromDocument = async (file: File): Promise<{
    name: string;
    documentNumber: string;
    documentType: string;
    birthDate: string;
    address?: string;
    nationality?: string;
    gender?: string;
    issueDate?: string;
    expiryDate?: string;
    confidence: number;
  }> => {
    console.log('📄 Iniciando extracción de datos del documento:', file.name);
    setLoading(true);
    setError(null);

    try {
      // Validar API Key
      if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 30) {
        throw new Error('API Key de Gemini no válida o no configurada');
      }

      // Convertir archivo a base64
      const base64 = await fileToBase64(file);
      
      console.log('🔄 Archivo convertido a base64, analizando con Gemini Vision...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Eres un experto en análisis de documentos de identidad. Extrae TODOS los datos posibles de este documento.

REGLAS IMPORTANTES:
- Si no puedes leer un campo claramente, haz tu mejor estimación basada en el contexto
- Para campos no visibles, usa cadena vacía ""
- Devuelve ÚNICAMENTE JSON válido, sin texto adicional
- Intenta detectar el tipo de documento automáticamente
- Si ves texto parcial, completa lo que puedas inferir lógicamente

Tipos de documentos comunes:
- DNI (España): 8 números + letra
- NIE (España): X/Y/Z + 7 números + letra  
- Pasaporte: Formato variable según país
- Carnet de conducir: Formato específico

EXTRAE ESTOS DATOS (usa "" si no están claros):
{
  "name": "Nombre y apellidos completos (intenta leer aunque esté parcial)",
  "documentNumber": "Número completo del documento",
  "documentType": "DNI|NIE|Pasaporte|Carnet|Otro",
  "birthDate": "DD/MM/YYYY (intenta inferir año si está parcial)",
  "address": "Dirección completa visible",
  "nationality": "Nacionalidad (ESP para españoles)",
  "gender": "M|F|Otro",
  "issueDate": "DD/MM/YYYY",
  "expiryDate": "DD/MM/YYYY", 
  "confidence": 85
}

ANALIZA LA IMAGEN Y EXTRAE TODO LO QUE PUEDAS VER:`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: file.type
          }
        }
      ]);

      const response = result.response.text();
      console.log('📋 Respuesta de Gemini Vision:', response);

      // Limpiar respuesta y extraer JSON
      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const extractedData = JSON.parse(cleanResponse);
        
        // Validación flexible - permitir extracción parcial
        console.log('🔍 Datos extraídos (puede ser parcial):', extractedData);
        
        // Solo advertir si no hay datos mínimos, no bloquear
        if (!extractedData.name && !extractedData.documentNumber) {
          console.warn('⚠️ No se pudieron extraer datos mínimos, pero continuando...');
        }

        // Normalizar datos extraídos con valores predeterminados
        const normalizedData = {
          name: extractedData.name || '',
          documentNumber: extractedData.documentNumber || '',
          documentType: extractedData.documentType || '',
          birthDate: extractedData.birthDate || '',
          address: extractedData.address || '',
          nationality: extractedData.nationality || '',
          gender: extractedData.gender || '',
          issueDate: extractedData.issueDate || '',
          expiryDate: extractedData.expiryDate || '',
          confidence: 0
        };

        // Asignar confianza basada en la calidad de los datos extraídos
        const confidence = calculateDataConfidence(normalizedData);
        normalizedData.confidence = confidence;

        console.log('✅ Datos extraídos exitosamente:', normalizedData);
        setLoading(false);
        return normalizedData;

      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError, 'Raw response:', cleanResponse);
        throw new Error('Error al procesar la respuesta del reconocimiento de texto. El documento podría no ser legible o estar en un formato no soportado.');
      }

    } catch (err) {
      console.error('❌ Error en extracción de documento:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el documento');
      setLoading(false);
      throw err;
    }
  };

  // Función auxiliar para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función para calcular la confianza de los datos extraídos
  const calculateDataConfidence = (data: any): number => {
    let score = 40; // Puntuación base más alta
    let bonusPoints = 0;

    // Nombre - 20 puntos bonus si existe
    if (data.name && data.name.length > 1) bonusPoints += 20;

    // Número de documento - 20 puntos bonus si existe
    if (data.documentNumber && data.documentNumber.length > 2) bonusPoints += 20;

    // Tipo de documento - 10 puntos bonus
    if (data.documentType && data.documentType.length > 0) bonusPoints += 10;

    // Fecha de nacimiento - 10 puntos bonus
    if (data.birthDate && data.birthDate.length > 0) bonusPoints += 10;

    // Cualquier dato adicional - hasta 10 puntos
    if (data.address && data.address.length > 3) bonusPoints += 5;
    if (data.nationality && data.nationality.length > 0) bonusPoints += 3;
    if (data.gender && data.gender.length > 0) bonusPoints += 2;

    const finalScore = Math.min(95, score + bonusPoints); // Máximo 95%
    console.log(`📊 Confianza calculada: ${finalScore}% (base: ${score}, bonus: ${bonusPoints})`);
    return finalScore;
  };

  // Función para análizar y sugerir categoría del cliente basado en el documento
  const suggestClientCategory = async (documentData: any): Promise<{
    suggestedCategory: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }> => {
    console.log('🎯 Sugiriendo categoría para cliente:', documentData.name);
    setLoading(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Basándote en los siguientes datos de un documento de identidad, sugiere la categoría más apropiada para este cliente en un despacho de servicios legales y migratorios.

Datos del documento:
- Nombre: ${documentData.name}
- Tipo documento: ${documentData.documentType}
- Nacionalidad: ${documentData.nationality || 'No especificada'}
- Fecha nacimiento: ${documentData.birthDate}

Categorías disponibles:
- Visas y Permisos
- NIE y Residencia  
- Nacionalidad Española
- Reagrupación Familiar
- Trámites Laborales
- Consulta General
- Estudios y Estudiantes
- Inversión y Negocios

Devuelve SOLO un JSON con este formato:
{
  "suggestedCategory": "Categoría sugerida",
  "reason": "Explicación breve de por qué esta categoría",
  "priority": "high/medium/low"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const suggestion = JSON.parse(cleanResponse);
      setLoading(false);
      
      return suggestion;
      
    } catch (err) {
      console.error('Error sugiriendo categoría:', err);
      setLoading(false);
      // Retornar categoría por defecto
      return {
        suggestedCategory: 'Consulta General',
        reason: 'Categoría por defecto cuando no se puede determinar automáticamente',
        priority: 'medium'
      };
    }
  };

  return {
    loading,
    error,
    chatWithAssistant,
    analyzeClient,
    generateWhatsAppResponse,
    generateBusinessInsights,
    extractClientData,
    extractDataFromDocument,
    suggestClientCategory
  };
};