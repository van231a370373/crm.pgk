import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, FileText, Link as LinkIcon, Mail, Phone, Star, HandCoins, Upload, CheckCircle, User, Building2, MapPin, CreditCard } from 'lucide-react';
import { Client, ServiceCategory, ContactInfo } from '../types';
import { DocumentUpload } from './DocumentUpload';
import { useDocumentExtraction } from '../hooks/useDocumentExtraction';

interface ClientFormProps {
  client?: Client;
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isOpen: boolean;
  categories: ServiceCategory[];
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel, isOpen, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    emails: [{ id: crypto.randomUUID(), value: '', label: 'Principal', isPrimary: true }] as ContactInfo[],
    phones: [{ id: crypto.randomUUID(), value: '', label: 'Principal', isPrimary: true }] as ContactInfo[],
    company: '',
    category: '',
    status: 'pending' as Client['status'],
    consultationType: '',
    notes: '',
    aiSuggestions: '',
    driveLinks: [''],
    keyDates: {
      birthday: '',
      paymentDue: '',
      renewal: '',
      closing: '',
      firstContact: '',
    },
    priority: 'medium' as Client['priority'],
    source: 'manual' as Client['source'],
    paidInCash: false,
    whatsappHistory: [] as any[],
    // Nuevos campos para documentos
    documentNumber: '',
    documentType: '',
    nationality: '',
    address: '',
    gender: '',
  });

  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentProcessed, setDocumentProcessed] = useState(false);
  const { processDocument, processing: isProcessing } = useDocumentExtraction();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        emails: client.emails.length > 0 ? client.emails : [{ id: crypto.randomUUID(), value: '', label: 'Principal', isPrimary: true }],
        phones: client.phones.length > 0 ? client.phones : [{ id: crypto.randomUUID(), value: '', label: 'Principal', isPrimary: true }],
        company: client.company || '',
        category: client.category,
        status: client.status,
        consultationType: client.consultationType,
        notes: client.notes,
        aiSuggestions: client.aiSuggestions,
        driveLinks: client.driveLinks.length > 0 ? client.driveLinks : [''],
        keyDates: {
          birthday: client.keyDates?.birthday || '',
          paymentDue: client.keyDates?.paymentDue || '',
          renewal: client.keyDates?.renewal || '',
          closing: client.keyDates?.closing || '',
          firstContact: client.keyDates?.firstContact || '',
        },
        priority: client.priority,
        source: client.source,
        paidInCash: client.paidInCash,
        whatsappHistory: client.whatsappHistory || [],
        documentNumber: client.documentNumber || '',
        documentType: client.documentType || '',
        nationality: client.nationality || '',
        address: client.address || '',
        gender: client.gender || '',
      });
    } else {
      setFormData({
        name: '',
        emails: [{ id: crypto.randomUUID(), value: '', label: 'Principal', isPrimary: true }],
        phones: [{ id: crypto.randomUUID(), value: '', label: 'Principal', isPrimary: true }],
        company: '',
        category: categories.length > 0 ? categories[0].name : '',
        status: 'pending',
        consultationType: '',
        notes: '',
        aiSuggestions: '',
        driveLinks: [''],
        keyDates: {
          birthday: '',
          paymentDue: '',
          renewal: '',
          closing: '',
          firstContact: '',
        },
        priority: 'medium',
        source: 'manual',
        paidInCash: false,
        whatsappHistory: [],
        documentNumber: '',
        documentType: '',
        nationality: '',
        address: '',
        gender: '',
      });
    }
  }, [client, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      emails: formData.emails.filter(email => email.value.trim() !== ''),
      phones: formData.phones.filter(phone => phone.value.trim() !== ''),
      driveLinks: formData.driveLinks.filter(link => link.trim() !== ''),
    };
    onSave(cleanedData);
  };

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { id: crypto.randomUUID(), value: '', label: 'Secundario', isPrimary: false }]
    }));
  };

  const removeEmail = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter(email => email.id !== id)
    }));
  };

  const updateEmail = (id: string, field: keyof ContactInfo, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map(email => 
        email.id === id ? { ...email, [field]: value } : email
      )
    }));
  };

  const setPrimaryEmail = (id: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map(email => ({ ...email, isPrimary: email.id === id }))
    }));
  };

  const addPhone = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { id: crypto.randomUUID(), value: '', label: 'Secundario', isPrimary: false }]
    }));
  };

  const removePhone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.filter(phone => phone.id !== id)
    }));
  };

  const updatePhone = (id: string, field: keyof ContactInfo, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.map(phone => 
        phone.id === id ? { ...phone, [field]: value } : phone
      )
    }));
  };

  const setPrimaryPhone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.map(phone => ({ ...phone, isPrimary: phone.id === id }))
    }));
  };

  const addDriveLink = () => {
    setFormData(prev => ({
      ...prev,
      driveLinks: [...prev.driveLinks, '']
    }));
  };

  const removeDriveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      driveLinks: prev.driveLinks.filter((_, i) => i !== index)
    }));
  };

  const updateDriveLink = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      driveLinks: prev.driveLinks.map((link, i) => i === index ? value : link)
    }));
  };

  const handleDocumentUpload = async (file: File) => {
    try {
      const result = await processDocument(file);
      
      if (result.success && result.data) {
        const data = result.data;
        
        // Auto-populate form with extracted data
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          documentNumber: data.documentNumber || prev.documentNumber,
          documentType: data.documentType || prev.documentType,
          nationality: data.nationality || prev.nationality,
          address: data.address || prev.address,
          gender: data.gender || prev.gender,
          keyDates: {
            ...prev.keyDates,
            birthday: data.birthDate || prev.keyDates.birthday,
            firstContact: new Date().toISOString().split('T')[0],
          },
          category: result.suggestedCategory || prev.category,
          source: 'document' as Client['source'],
          aiSuggestions: result.duplicateWarning?.isDuplicate 
            ? `⚠️ Posible duplicado detectado: ${result.duplicateWarning.existingClient?.name || 'Cliente existente'}\n\nDatos extraídos del documento con ${Math.round((data.confidence || 0) * 100)}% de confianza.`
            : `Datos extraídos automáticamente del documento con ${Math.round((data.confidence || 0) * 100)}% de confianza.`,
        }));
        
        setDocumentProcessed(true);
        setShowDocumentUpload(false);
      } else {
        console.error('Error processing document:', result.error);
      }
    } catch (error) {
      console.error('Error processing document:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="md:col-span-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.paidInCash}
                onChange={(e) => setFormData(prev => ({ ...prev, paidInCash: e.target.checked }))}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <HandCoins className="w-4 h-4 text-green-600" />
                <span>Pagado en mano (efectivo)</span>
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
              Marcar si el pago se realizó en efectivo o presencialmente
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Upload Section */}
          {!client && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Subir Documento de Identidad</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Sube una foto del documento para extraer datos automáticamente
                </p>
                <button
                  type="button"
                  onClick={() => setShowDocumentUpload(true)}
                  disabled={isProcessing}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar Documento
                    </>
                  )}
                </button>
                {documentProcessed && (
                  <div className="mt-2 flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Documento procesado</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Upload Modal */}
          {showDocumentUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold">Subir Documento</h3>
                  <button
                    onClick={() => setShowDocumentUpload(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <DocumentUpload 
                    onFileSelect={handleDocumentUpload} 
                    onCancel={() => setShowDocumentUpload(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Emails Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Emails
              </h3>
              <button
                type="button"
                onClick={addEmail}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir email</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.emails.map((email) => (
                <div key={email.id} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPrimaryEmail(email.id)}
                    className={`p-1 rounded ${email.isPrimary ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    title={email.isPrimary ? 'Email principal' : 'Marcar como principal'}
                  >
                    <Star className={`w-4 h-4 ${email.isPrimary ? 'fill-current' : ''}`} />
                  </button>
                  <input
                    type="email"
                    value={email.value}
                    onChange={(e) => updateEmail(email.id, 'value', e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={email.label}
                    onChange={(e) => updateEmail(email.id, 'label', e.target.value)}
                    placeholder="Etiqueta"
                    className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                  />
                  {formData.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(email.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Phones Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Teléfonos
              </h3>
              <button
                type="button"
                onClick={addPhone}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir teléfono</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.phones.map((phone) => (
                <div key={phone.id} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPrimaryPhone(phone.id)}
                    className={`p-1 rounded ${phone.isPrimary ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    title={phone.isPrimary ? 'Teléfono principal' : 'Marcar como principal'}
                  >
                    <Star className={`w-4 h-4 ${phone.isPrimary ? 'fill-current' : ''}`} />
                  </button>
                  <input
                    type="tel"
                    value={phone.value}
                    onChange={(e) => updatePhone(phone.id, 'value', e.target.value)}
                    placeholder="+34 600 000 000"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={phone.label}
                    onChange={(e) => updatePhone(phone.id, 'label', e.target.value)}
                    placeholder="Etiqueta"
                    className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                  />
                  {formData.phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(phone.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Document Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Información del Documento
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: 12345678A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="dni">DNI</option>
                  <option value="nie">NIE</option>
                  <option value="passport">Pasaporte</option>
                  <option value="driving_license">Carnet de Conducir</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Española"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Género
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Dirección
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Dirección completa según documento"
              />
            </div>
          </div>

          {/* Consultation Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Client['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Proceso</option>
                <option value="paid">Pagada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Client['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Consulta
            </label>
            <input
              type="text"
              value={formData.consultationType}
              onChange={(e) => setFormData(prev => ({ ...prev, consultationType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: Declaración IRPF, Constitución SL, etc."
            />
          </div>

          {/* Key Dates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Fechas Clave
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cumpleaños
                </label>
                <input
                  type="date"
                  value={formData.keyDates.birthday}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    keyDates: { ...prev.keyDates, birthday: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={formData.keyDates.paymentDue}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    keyDates: { ...prev.keyDates, paymentDue: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renovación
                </label>
                <input
                  type="date"
                  value={formData.keyDates.renewal}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    keyDates: { ...prev.keyDates, renewal: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cierre
                </label>
                <input
                  type="date"
                  value={formData.keyDates.closing}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    keyDates: { ...prev.keyDates, closing: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primer Contacto
                </label>
                <input
                  type="date"
                  value={formData.keyDates.firstContact}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    keyDates: { ...prev.keyDates, firstContact: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Drive Links */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                Enlaces de Drive
              </h3>
              <button
                type="button"
                onClick={addDriveLink}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir enlace</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.driveLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateDriveLink(index, e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.driveLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDriveLink(index)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Apuntes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Notas sobre el cliente o la consulta..."
            />
          </div>

          {/* AI Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sugerencias IA
            </label>
            <textarea
              value={formData.aiSuggestions}
              onChange={(e) => setFormData(prev => ({ ...prev, aiSuggestions: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Acciones sugeridas por IA o recordatorios automáticos..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {client ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};