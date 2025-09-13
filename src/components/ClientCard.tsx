import React from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  FileText, 
  AlertCircle,
  Building2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Send,
  HandCoins,
  CheckSquare,
  Bot,
  Sparkles
} from 'lucide-react';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
  onEdit: () => void;
  onWhatsApp: () => void;
  onAddTask: () => void;
  onAIAnalyze?: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, onEdit, onWhatsApp, onAddTask, onAIAnalyze }) => {
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

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Pause className="w-4 h-4" />;
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

  const getPriorityColor = (priority: Client['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWhatsApp();
  };

  const handleAddTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTask();
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const primaryEmail = client.emails.find(email => email.isPrimary) || client.emails[0];
    if (primaryEmail) {
      window.open(`mailto:${primaryEmail.value}`, '_blank');
    }
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(client.priority)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700`}
      onClick={onClick}
    >
      <div className="p-3 md:p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base md:text-lg truncate">{client.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(client.status)}`}>
                {getStatusIcon(client.status)}
                <span>{getStatusText(client.status)}</span>
              </span>
            </div>
            {client.company && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <Building2 className="w-4 h-4 mr-1" />
                <span className="text-sm truncate">{client.company}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {client.category}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {client.consultationType}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
          {client.emails.length > 0 && (
            <button
              onClick={handleEmail}
              className="flex items-center space-x-1 px-2 py-1 md:px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs md:text-sm"
            >
              <Mail className="w-3 h-3 md:w-4 md:h-4" />
              <span>Email ({client.emails.length})</span>
            </button>
          )}
          {client.phones.length > 0 && (
            <>
              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-1 px-2 py-1 md:px-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-xs md:text-sm"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4" />
                <span>Mensaje</span>
              </button>
              <button
                onClick={handleAddTask}
                className="flex items-center space-x-1 px-2 py-1 md:px-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-xs md:text-sm"
              >
                <CheckSquare className="w-3 h-3 md:w-4 md:h-4" />
                <span>Tarea</span>
              </button>
              {onAIAnalyze && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAIAnalyze();
                  }}
                  className="flex items-center space-x-1 px-2 py-1 md:px-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 transition-all text-xs md:text-sm"
                >
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                  <span>IA</span>
                </button>
              )}
              <button
                onClick={(e) => copyToClipboard(client.phones.find(p => p.isPrimary)?.value || client.phones[0].value, e)}
                className="flex items-center space-x-1 px-2 py-1 md:px-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs md:text-sm"
              >
                <Phone className="w-3 h-3 md:w-4 md:h-4" />
                <span>Tel ({client.phones.length})</span>
              </button>
            </>
          )}
        </div>

        {/* Key dates */}
        {(client.keyDates.paymentDue || client.keyDates.birthday || client.keyDates.closing) && (
          <div className="flex flex-wrap gap-1 md:gap-2 mb-3 text-xs">
            {client.keyDates.paymentDue && (
              <div className="flex items-center space-x-1 px-1.5 py-0.5 md:px-2 md:py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Pago: {formatDate(client.keyDates.paymentDue)}</span>
              </div>
            )}
            {client.keyDates.birthday && (
              <div className="flex items-center space-x-1 px-1.5 py-0.5 md:px-2 md:py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Cumpleaños: {formatDate(client.keyDates.birthday)}</span>
              </div>
            )}
            {client.keyDates.closing && (
              <div className="flex items-center space-x-1 px-1.5 py-0.5 md:px-2 md:py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Cierre: {formatDate(client.keyDates.closing)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes preview and links */}
        <div className="space-y-2">
          {client.notes && (
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1 mb-1">
                <FileText className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-medium">Apuntes:</span>
              </div>
              <p className="line-clamp-2 text-xs bg-gray-50 dark:bg-gray-700 p-1.5 md:p-2 rounded">
                {client.notes}
              </p>
            </div>
          )}

          {client.aiSuggestions && (
            <div className="text-xs md:text-sm">
              <div className="flex items-center space-x-1 mb-1">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">IA Sugiere:</span>
              </div>
              <p className="line-clamp-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 p-1.5 md:p-2 rounded">
                {client.aiSuggestions}
              </p>
            </div>
          )}

          {client.driveLinks.length > 0 && (
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {client.driveLinks.length} documento(s) adjunto(s)
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Creado: {formatDate(client.createdAt)}
          </span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${client.priority === 'high' ? 'bg-red-500' : client.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {client.priority === 'high' ? 'Alta' : client.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
            {client.paidInCash && (
              <div className="flex items-center space-x-1 ml-2">
                <HandCoins className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
                <span className="text-xs text-green-600 dark:text-green-400">Efectivo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};