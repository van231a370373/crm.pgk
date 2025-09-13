import { useState, useEffect } from 'react';
import { ServiceCategory } from '../types';

const CATEGORIES_STORAGE_KEY = 'pgk-crm-service-categories';

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: '1', name: 'IRNR', createdAt: new Date().toISOString() },
  { id: '2', name: 'Alta autónomo', createdAt: new Date().toISOString() },
  { id: '3', name: 'Certificado digital', createdAt: new Date().toISOString() },
  { id: '4', name: 'Informe específico', createdAt: new Date().toISOString() },
];

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      // Initialize with default categories
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  // Save to localStorage whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  const addCategory = (name: string) => {
    const newCategory: ServiceCategory = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, name: name.trim() } : cat
      )
    );
  };

  return {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
  };
};