import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Loader2 } from 'lucide-react';
import type { Class } from '@/types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  classItem?: Class | null;
  mode: 'create' | 'edit';
}

export default function ClassModal({ isOpen, onClose, onSubmit, classItem, mode }: ClassModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (classItem) {
      setName(classItem.name);
    } else {
      setName('');
    }
    setError('');
  }, [classItem, isOpen]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Sınıf adı gerekli');
      return false;
    }
    if (name.length > 20) {
      setError('Sınıf adı en fazla 20 karakter olabilir');
      return false;
    }
    if (!/^[a-zA-Z0-9ÇçĞğİıÖöŞşÜü\s]+$/.test(name)) {
      setError('Sınıf adı sadece harf, rakam ve boşluk içerebilir');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Yeni Sınıf Ekle' : 'Sınıf Düzenle'}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1.5">
                Sınıf Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="className"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="Örn: 9A, 10B, 11A"
                className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                autoFocus
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Örnek: 9A, 9B, 10A, 11A, 12A
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    {mode === 'create' ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    {mode === 'create' ? 'Ekle' : 'Güncelle'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
