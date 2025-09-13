import React, { useState } from 'react';
import {
  Menu,
  X,
  Users,
  CheckSquare,
  Settings,
  Calendar,
  FileText,
  MessageCircle,
  BarChart3,
  User,
  LogOut
} from 'lucide-react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

interface NavigationMenuProps {
  onAddClient: () => void;
  onManageCategories: () => void;
  onOpenTasks: () => void;
  onToggleClientsList: () => void;
  showClientsList: boolean;
  onSignOut: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  onAddClient,
  onManageCategories,
  onOpenTasks,
  onToggleClientsList,
  showClientsList,
  onSignOut,
}) => {
  const { user } = useSimpleAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: 'Nuevo Cliente',
      icon: Users,
      action: () => {
        onAddClient();
        setIsOpen(false);
      },
      shortcut: 'Ctrl+N'
    },
    {
      label: 'Ver Lista de Clientes',
      icon: showClientsList ? Users : Users,
      action: () => {
        onToggleClientsList();
        setIsOpen(false);
      },
      active: showClientsList
    },
    {
      label: 'Gestionar Tareas',
      icon: CheckSquare,
      action: () => {
        onOpenTasks();
        setIsOpen(false);
      },
      shortcut: 'Ctrl+T'
    },
    {
      label: 'Categorías',
      icon: Settings,
      action: () => {
        onManageCategories();
        setIsOpen(false);
      }
    },
    {
      label: 'Reportes',
      icon: BarChart3,
      action: () => {
        // TODO: Implement reports
        setIsOpen(false);
      }
    },
    {
      label: 'Plantillas',
      icon: MessageCircle,
      action: () => {
        // TODO: Implement templates
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        title="Menú"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop menu */}
      <div className="hidden lg:flex items-center space-x-2">
        {menuItems.slice(0, 4).map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
            className={`p-2 rounded-lg transition-colors ${
              item.active
                ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}

        {/* User menu dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Usuario"
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline text-sm font-medium">
              {user?.name || 'Usuario'}
            </span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'superadmin' ? 'Superadministrador' :
                       user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              {/* Sign out */}
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role === 'superadmin' ? 'Superadministrador' :
                   user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {item.shortcut}
                </span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Sign out */}
          <button
            onClick={() => {
              onSignOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};