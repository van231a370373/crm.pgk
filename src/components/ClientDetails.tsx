import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Phone, 
  Mail, 
  Building2,
  Copy,
  CheckSquare,
  ExternalLink,
  Edit,
  Save,
  RotateCcw,
  Star,
  Send,
  Calendar,
  Clock,
  HandCoins,
  FileText,
  AlertCircle,
  History
} from 'lucide-react';
import { Client, WhatsAppMessage } from '../types';

interface ClientDetailsProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onWhatsApp: () => void;
  whatsappMessages: WhatsAppMessage[];
  onUpdateClient: (updates: Partial<Client>) => void;
  onOpenTasks: (clientId: string) => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  isOpen,
  onClose,
  onDelete,
  onWhatsApp,
  onUpdateClient,
  onOpenTasks,
}) => {
  // Función para actualizar cualquier campo directamente
  const updateField = (field: string, value: any) => {
    onUpdateClient({ [field]: value });
  };

  if (!isOpen) return null;

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status: Client['status']) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'in-progress': return 'En Proceso';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleEmail = () => {
    const primaryEmail = client.emails.find(email => email.isPrimary) || client.emails[0];
    if (primaryEmail) {
      window.open(`mailto:${primaryEmail.value}`, '_blank');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h2>
            {isQuickEditing ? (
              <select
                value={quickEditData.status}
                onChange={(e) => setQuickEditData(prev => ({ ...prev, status: e.target.value as Client['status'] }))}
                className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Proceso</option>
                <option value="paid">Pagada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                {getStatusText(client.status)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isQuickEditing ? (
              <>
                <button
                  onClick={handleQuickSave}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Guardar cambios"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleQuickCancel}
                  className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Cancelar"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsQuickEditing(true)}
                className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="Edición rápida"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onOpenTasks(client.id)}
              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Ver tareas del cliente"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Editar cliente"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Eliminar cliente"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información de Contacto</h3>
              
              {/* Emails */}
              {client.emails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Emails ({client.emails.length})
                  </h4>
                  {client.emails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {email.isPrimary && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <div>
                          <span className="text-gray-900 dark:text-white">{email.value}</span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {email.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(email.value)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Copiar email"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`mailto:${email.value}`, '_blank')}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Enviar email"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Phones */}
              {client.phones.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Teléfonos ({client.phones.length})
                  </h4>
                  {client.phones.map((phone) => (
                    <div key={phone.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {phone.isPrimary && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <div>
                          <span className="text-gray-900 dark:text-white">{phone.value}</span>
                          <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                            {phone.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(phone.value)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Copiar teléfono"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const cleanPhone = phone.value.replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                          }}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Enviar mensaje WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {client.company && (
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-gray-900 dark:text-white">{client.company}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Consulta</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {client.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <span className="text-gray-900 dark:text-white">{client.consultationType}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Prioridad:</span>
                  {isQuickEditing ? (
                    <select
                      value={quickEditData.priority}
                      onChange={(e) => setQuickEditData(prev => ({ ...prev, priority: e.target.value as Client['priority'] }))}
                      className="px-2 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  ) : (
                    <span className={`font-medium ${getPriorityColor(client.priority)}`}>
                      {getPriorityText(client.priority)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Origen:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{client.source}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pago en efectivo:</span>
                  {isQuickEditing ? (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={quickEditData.paidInCash}
                        onChange={(e) => setQuickEditData(prev => ({ ...prev, paidInCash: e.target.checked }))}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <HandCoins className="w-4 h-4 text-green-600" />
                    </label>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {client.paidInCash ? (
                        <>
                          <HandCoins className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 dark:text-green-400 font-medium">Sí</span>
                        </>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Fechas Clave
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Cumpleaños</span>
                  <Calendar className="w-4 h-4 text-pink-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(client.keyDates.birthday)}
                </span>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de Pago</span>
                  <Clock className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(client.keyDates.paymentDue)}
                </span>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Renovación</span>
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(client.keyDates.renewal)}
                </span>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Cierre</span>
                  <Calendar className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(client.keyDates.closing)}
                </span>
              </div>
            </div>
          </div>

          {/* Drive Links */}
          {client.driveLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Documentos y Enlaces
              </h3>
              <div className="space-y-2">
                {client.driveLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white text-sm truncate flex-1 mr-4">
                      {link}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(link)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Copiar enlace"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDriveLink(link)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Abrir enlace"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp History */}
          {whatsappMessages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-green-500" />
                Historial WhatsApp ({whatsappMessages.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {whatsappMessages.slice(-5).map((msg) => (
                  <div key={msg.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        msg.type === 'sent' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {msg.type === 'sent' ? 'Enviado' : 'Recibido'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {msg.aiGenerated && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                            IA
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(msg.timestamp).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{msg.message}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={onWhatsApp}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar nuevo mensaje</span>
              </button>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Apuntes
              </h3>
              {isQuickEditing ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <textarea
                    value={quickEditData.notes}
                    onChange={(e) => setQuickEditData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    placeholder="Añadir apuntes sobre el cliente..."
                  />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-900 dark:text-white whitespace-pre-wrap">{client.notes || 'Sin apuntes'}</span>
                    <button
                      onClick={() => copyToClipboard(client.notes)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
                      title="Copiar apuntes"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Suggestions */}
          {client.aiSuggestions && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-purple-500" />
                Sugerencias de IA
              </h3>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <span className="text-purple-800 dark:text-purple-200 whitespace-pre-wrap">{client.aiSuggestions}</span>
                  <button
                    onClick={() => copyToClipboard(client.aiSuggestions)}
                    className="p-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 ml-2"
                    title="Copiar sugerencias"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Historial
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Cliente creado:</span>
                <span>{formatDate(client.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Última actualización:</span>
                <span>{formatDate(client.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};