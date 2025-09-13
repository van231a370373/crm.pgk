import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Camera,
  FileImage,
  Trash2
} from 'lucide-react';

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  isProcessing?: boolean;
  acceptedFormats?: string[];
  maxFileSize?: number; // en MB
}

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileSelect,
  onCancel,
  isProcessing = false,
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.pdf'],
  maxFileSize = 10
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    // Validar tamaño
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo ${maxFileSize}MB.`;
    }

    // Validar formato
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Formato no soportado. Use: ${acceptedFormats.join(', ')}.`;
    }

    // Validar tipo MIME
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf'
    ];
    
    if (!validMimeTypes.includes(file.type)) {
      return 'Tipo de archivo no válido.';
    }

    return null;
  }, [acceptedFormats, maxFileSize]);

  // Crear preview del archivo
  const createPreview = useCallback((file: File): Promise<FilePreview> => {
    return new Promise((resolve, reject) => {
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            file,
            preview: reader.result as string,
            type: fileType
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        // Para PDFs, usar un ícono genérico
        resolve({
          file,
          preview: '',
          type: fileType
        });
      }
    });
  }, []);

  // Manejar selección de archivo
  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    try {
      const preview = await createPreview(file);
      setSelectedFile(preview);
    } catch (err) {
      setError('Error al procesar el archivo.');
    }
  }, [validateFile, createPreview]);

  // Drag and Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Manejar input file
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Procesar archivo seleccionado
  const handleProcessFile = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile.file);
    }
  }, [selectedFile, onFileSelect]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subir Documento de Identidad
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                DNI, Pasaporte, Cédula o documento similar
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedFile ? (
            /* Upload Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleInputChange}
                className="hidden"
                disabled={isProcessing}
              />

              <div className="flex flex-col items-center space-y-4">
                <Upload className="w-12 h-12 text-gray-400" />
                
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Arrastra tu documento aquí
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    o haz clic para seleccionar
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FileImage className="w-4 h-4" />
                    <span>JPG, PNG</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                  <span>Máx. {maxFileSize}MB</span>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Area */
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {selectedFile.type === 'image' ? (
                      <Image className="w-6 h-6 text-green-600" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearSelection}
                    disabled={isProcessing}
                    className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview */}
                {selectedFile.type === 'image' ? (
                  <div className="relative max-w-md mx-auto">
                    <img
                      src={selectedFile.preview}
                      alt="Document preview"
                      className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      ✓ Listo
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FileText className="w-16 h-16 text-red-600 mb-3" />
                    <p className="font-medium text-gray-900 dark:text-white">
                      Documento PDF seleccionado
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Listo para procesar
                    </p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200">
                      ¿Qué datos extraeremos?
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1">
                      <li>• Nombre completo</li>
                      <li>• Número de documento</li>
                      <li>• Fecha de nacimiento</li>
                      <li>• Dirección (si está disponible)</li>
                      <li>• Validación de duplicados</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>

          <div className="flex items-center space-x-3">
            {selectedFile && (
              <button
                onClick={clearSelection}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
              >
                Cambiar archivo
              </button>
            )}
            
            <button
              onClick={handleProcessFile}
              disabled={!selectedFile || isProcessing}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Extraer Datos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};