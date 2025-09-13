import { useState, useCallback } from 'react';
import { useGeminiAI } from './useGeminiAI';
import { Client } from '../types';

export interface ExtractedDocumentData {
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
}

export interface DocumentProcessingResult {
  success: boolean;
  data?: ExtractedDocumentData;
  suggestedCategory?: string;
  categoryReason?: string;
  priority?: 'low' | 'medium' | 'high';
  duplicateWarning?: {
    isDuplicate: boolean;
    existingClient?: Client;
    matchingFields: string[];
  };
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useDocumentExtraction = () => {
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<DocumentProcessingResult | null>(null);
  
  const { extractDataFromDocument, suggestClientCategory } = useGeminiAI();

  // Procesar documento completo
  const processDocument = useCallback(async (
    file: File, 
    existingClients: Client[] = []
  ): Promise<DocumentProcessingResult> => {
    setProcessing(true);
    
    try {
      console.log('🔄 Iniciando procesamiento completo del documento:', file.name);
      
      // Paso 1: Extraer datos del documento
      console.log('📋 Extrayendo datos del documento...');
      const extractedData = await extractDataFromDocument(file);
      
      // Paso 2: Validar datos extraídos
      console.log('✅ Validando datos extraídos...');
      const validation = validateExtractedData(extractedData);
      
      if (!validation.isValid) {
        setProcessing(false);
        const result: DocumentProcessingResult = {
          success: false,
          error: `Datos extraídos inválidos: ${validation.errors.join(', ')}`
        };
        setLastResult(result);
        return result;
      }

      // Paso 3: Verificar duplicados
      console.log('🔍 Verificando duplicados...');
      const duplicateCheck = checkForDuplicates(extractedData, existingClients);
      
      // Paso 4: Sugerir categoría
      console.log('🎯 Sugiriendo categoría...');
      const categoryData = await suggestClientCategory(extractedData);
      
      // Resultado final
      const result: DocumentProcessingResult = {
        success: true,
        data: extractedData,
        suggestedCategory: categoryData.suggestedCategory,
        categoryReason: categoryData.reason,
        priority: categoryData.priority,
        duplicateWarning: duplicateCheck
      };
      
      console.log('✅ Procesamiento completado exitosamente:', result);
      setLastResult(result);
      setProcessing(false);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en procesamiento del documento:', error);
      const result: DocumentProcessingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al procesar el documento'
      };
      setLastResult(result);
      setProcessing(false);
      return result;
    }
  }, [extractDataFromDocument, suggestClientCategory]);

  // Validar datos extraídos
  const validateExtractedData = useCallback((data: ExtractedDocumentData): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones convertidas a advertencias - NO bloqueantes
    if (!data.name || data.name.length < 2) {
      warnings.push('No se pudo extraer el nombre completo del documento');
    }

    if (!data.documentNumber || data.documentNumber.length < 3) {
      warnings.push('No se pudo extraer un número de documento válido');
    }

    if (!data.documentType) {
      warnings.push('No se pudo determinar el tipo de documento');
    }

    // Validaciones específicas por tipo de documento - convertidas a advertencias
    if (data.documentType?.toLowerCase().includes('dni') && data.documentNumber) {
      const dniPattern = /^\d{8}[A-Za-z]$/;
      if (!dniPattern.test(data.documentNumber)) {
        warnings.push('El formato del DNI podría no ser completamente válido, revisa manualmente');
      }
    }

    // Validaciones de fecha
    if (data.birthDate) {
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!datePattern.test(data.birthDate)) {
        warnings.push('El formato de fecha de nacimiento podría no ser correcto (DD/MM/YYYY)');
      } else {
        // Verificar que la fecha sea lógica
        const [day, month, year] = data.birthDate.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const now = new Date();
        const age = now.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 120) {
          warnings.push('La fecha de nacimiento parece incorrecta (edad calculada fuera del rango normal)');
        }
        
        if (birthDate > now) {
          warnings.push('La fecha de nacimiento parece ser futura, revisa manualmente');
        }
      }
    }

    // Validación de confianza
    if (data.confidence < 60) {
      warnings.push('La confianza en los datos extraídos es baja. Revisa manualmente los campos');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Verificar duplicados
  const checkForDuplicates = useCallback((
    extractedData: ExtractedDocumentData, 
    existingClients: Client[]
  ) => {
    const matchingFields: string[] = [];
    let bestMatch: Client | undefined;
    let matchScore = 0;

    for (const client of existingClients) {
      let currentScore = 0;
      const currentMatches: string[] = [];

      // Verificar número de documento (match exacto = muy alta prioridad)
      if (client.documentNumber && client.documentNumber === extractedData.documentNumber) {
        currentScore += 100;
        currentMatches.push('número de documento');
      }

      // Verificar nombre (similitud)
      if (client.name && extractedData.name) {
        const nameSimilarity = calculateStringSimilarity(
          client.name.toLowerCase().trim(),
          extractedData.name.toLowerCase().trim()
        );
        if (nameSimilarity > 0.8) {
          currentScore += 50;
          currentMatches.push('nombre');
        }
      }

      // Verificar fecha de nacimiento
      if (client.keyDates?.birthday && extractedData.birthDate) {
        const clientBirth = new Date(client.keyDates.birthday);
        const [day, month, year] = extractedData.birthDate.split('/').map(Number);
        const extractedBirth = new Date(year, month - 1, day);
        
        if (clientBirth.getTime() === extractedBirth.getTime()) {
          currentScore += 30;
          currentMatches.push('fecha de nacimiento');
        }
      }

      // Si hay múltiples coincidencias, es muy probable que sea duplicado
      if (currentScore > matchScore) {
        matchScore = currentScore;
        bestMatch = client;
        matchingFields.length = 0;
        matchingFields.push(...currentMatches);
      }
    }

    // Consideramos duplicado si el score es alto
    const isDuplicate = matchScore >= 80; // Número de documento exacto o nombre muy similar + fecha

    return {
      isDuplicate,
      existingClient: bestMatch,
      matchingFields: [...matchingFields]
    };
  }, []);

  // Calcular similitud entre strings
  const calculateStringSimilarity = useCallback((str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }, []);

  // Distancia de Levenshtein para similitud de strings
  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }, []);

  // Convertir datos extraídos a formato de cliente
  const convertToClientData = useCallback((
    extractedData: ExtractedDocumentData,
    suggestedCategory?: string
  ): Partial<Client> => {
    // Parsear fecha de nacimiento
    let birthday = '';
    if (extractedData.birthDate) {
      try {
        const [day, month, year] = extractedData.birthDate.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        birthday = birthDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      } catch {
        console.warn('No se pudo parsear fecha de nacimiento:', extractedData.birthDate);
      }
    }

    return {
      name: extractedData.name.trim(),
      emails: [],
      phones: [],
      documentNumber: extractedData.documentNumber,
      documentType: extractedData.documentType,
      nationality: extractedData.nationality || '',
      address: extractedData.address || '',
      gender: extractedData.gender || '',
      category: suggestedCategory || 'Consulta General',
      consultationType: suggestedCategory || 'Consulta General',
      notes: `Cliente creado automáticamente desde documento de identidad.
Confianza de extracción: ${extractedData.confidence}%
Tipo de documento: ${extractedData.documentType}
${extractedData.issueDate ? `Fecha de expedición: ${extractedData.issueDate}` : ''}
${extractedData.expiryDate ? `Fecha de vencimiento: ${extractedData.expiryDate}` : ''}`,
      keyDates: {
        birthday,
        firstContact: new Date().toISOString().split('T')[0],
        paymentDue: '',
        renewal: '',
        closing: ''
      },
      status: 'pending',
      priority: 'medium',
      source: 'Documento de Identidad',
      paidInCash: false
    };
  }, []);

  // Limpiar estado
  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    processing,
    lastResult,
    processDocument,
    validateExtractedData,
    checkForDuplicates,
    convertToClientData,
    clearResult
  };
};