import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MapPin, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';

interface WebAppointmentFormProps {
  onSuccess?: (appointmentId: string) => void;
  onCancel?: () => void;
}

const WebAppointmentForm: React.FC<WebAppointmentFormProps> = ({ onSuccess, onCancel }) => {
  const { addAppointment, getAvailableTimeSlots, loading, error } = useAppointments();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    title: '',
    description: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation' as 'consultation' | 'follow-up' | 'document-review' | 'signing' | 'other',
    location: 'office' as 'office' | 'video-call' | 'phone' | 'client-location'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Obtener fechas disponibles (próximos 30 días, excluyendo fines de semana)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Excluir fines de semana
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();
  const availableTimeSlots = formData.appointmentDate ? getAvailableTimeSlots(formData.appointmentDate) : [];

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.clientName.trim()) {
        errors.clientName = 'El nombre es obligatorio';
      }
      if (!formData.clientEmail.trim()) {
        errors.clientEmail = 'El email es obligatorio';
      } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
        errors.clientEmail = 'El email no es válido';
      }
      if (!formData.clientPhone.trim()) {
        errors.clientPhone = 'El teléfono es obligatorio';
      }
      if (!formData.title.trim()) {
        errors.title = 'El asunto es obligatorio';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.appointmentDate) {
        errors.appointmentDate = 'La fecha es obligatoria';
      }
      if (!formData.appointmentTime) {
        errors.appointmentTime = 'La hora es obligatoria';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    try {
      setSubmitted(true);
      
      const appointmentData = {
        ...formData,
        duration: 60, // duración por defecto
        status: 'scheduled' as const,
        reminderSent: false,
        confirmationSent: false,
        source: 'web-booking' as const,
        notes: formData.description,
        createdBy: 'web-form'
      };

      const newAppointment = await addAppointment(appointmentData);
      
      if (onSuccess) {
        onSuccess(newAppointment.id);
      }
    } catch (err) {
      setSubmitted(false);
      console.error('Error al crear la cita:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error de validación cuando el usuario empieza a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Cita Reservada con Éxito!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hemos recibido tu solicitud de cita. Te contactaremos pronto para confirmar los detalles.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resumen de tu cita:</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Fecha:</strong> {new Date(formData.appointmentDate).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> {formData.appointmentTime}</p>
              <p><strong>Tipo:</strong> {formData.type}</p>
              <p><strong>Modalidad:</strong> {formData.location}</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>Error al procesar la solicitud</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Paso {step} de 3
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Información Personal
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor, proporciona tus datos de contacto
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.clientName 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-gray-100`}
                  placeholder="Tu nombre completo"
                />
                {validationErrors.clientName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.clientEmail 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-gray-100`}
                  placeholder="tu@email.com"
                />
                {validationErrors.clientEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.clientEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.clientPhone 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-gray-100`}
                  placeholder="+34 600 000 000"
                />
                {validationErrors.clientPhone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.clientPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Asunto de la consulta *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.title 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-gray-100`}
                  placeholder="Ej: Consulta sobre trámites de residencia"
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de consulta
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="consultation">Consulta inicial</option>
                  <option value="follow-up">Seguimiento</option>
                  <option value="document-review">Revisión de documentos</option>
                  <option value="signing">Firma de documentos</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción adicional
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Describe brevemente el motivo de tu consulta..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date and Time Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Fecha y Hora
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Selecciona tu fecha y hora preferidas
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha *
                </label>
                <select
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.appointmentDate 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                >
                  <option value="">Selecciona una fecha</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
                {validationErrors.appointmentDate && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.appointmentDate}</p>
                )}
              </div>

              {formData.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Hora *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableTimeSlots.filter(slot => slot.available).map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleInputChange('appointmentTime', slot.time)}
                        className={`p-2 text-sm border rounded-lg transition-colors ${
                          formData.appointmentTime === slot.time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {availableTimeSlots.filter(slot => slot.available).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      No hay horarios disponibles para esta fecha
                    </p>
                  )}
                  {validationErrors.appointmentTime && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.appointmentTime}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Modalidad de la cita
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="office">Presencial en oficina</option>
                  <option value="video-call">Videollamada</option>
                  <option value="phone">Llamada telefónica</option>
                  <option value="client-location">A domicilio</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Confirmar Cita
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Revisa los datos de tu cita antes de confirmar
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Datos de contacto</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Nombre:</strong> {formData.clientName}</p>
                    <p><strong>Email:</strong> {formData.clientEmail}</p>
                    <p><strong>Teléfono:</strong> {formData.clientPhone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detalles de la cita</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Fecha:</strong> {new Date(formData.appointmentDate).toLocaleDateString('es-ES')}</p>
                    <p><strong>Hora:</strong> {formData.appointmentTime}</p>
                    <p><strong>Modalidad:</strong> {formData.location}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Consulta</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Asunto:</strong> {formData.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Tipo:</strong> {formData.type}
                </p>
                {formData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Descripción:</strong> {formData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Importante:</strong> Una vez confirmada la cita, recibirás un email de confirmación y te contactaremos para verificar los detalles.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Anterior
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ml-4"
              >
                Cancelar
              </button>
            )}
          </div>
          
          <div>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Procesando...' : 'Siguiente'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Confirmando...' : 'Confirmar Cita'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default WebAppointmentForm;