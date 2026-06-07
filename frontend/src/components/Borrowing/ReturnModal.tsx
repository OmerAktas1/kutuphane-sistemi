import { useState } from 'react';
import { X, RotateCcw, Loader2, AlertTriangle, BookOpen, User, Calendar, Clock } from 'lucide-react';
import type { Borrowing } from '@/types';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes?: string) => Promise<void>;
  borrowing: Borrowing | null;
}

export default function ReturnModal({ isOpen, onClose, onSubmit, borrowing }: ReturnModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(notes.trim() || undefined);
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !borrowing) return null;

  const isOverdue = new Date(borrowing.dueDate) < new Date() && borrowing.status === 'BORROWED';
  const today = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kitap İade</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Overdue Warning */}
            {isOverdue && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Gecikmiş İade</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    Bu kitabın teslim tarihi {new Date(borrowing.dueDate).toLocaleDateString('tr-TR')} tarihinde geçmiş.
                  </p>
                </div>
              </div>
            )}

            {/* Borrowing Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Kitap</p>
                  <p className="text-sm font-medium text-gray-900">{borrowing.book?.title}</p>
                  {borrowing.book?.location && (
                    <p className="text-xs text-gray-500">Raf: {borrowing.book.location}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Öğrenci</p>
                  <p className="text-sm font-medium text-gray-900">
                    {borrowing.student?.firstName} {borrowing.student?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {borrowing.student?.studentNumber} - {borrowing.student?.class?.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Alış Tarihi</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(borrowing.borrowDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Son Teslim</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Date Display */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600">İade Tarihi</p>
                  <p className="text-sm font-medium text-green-800">{today}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="returnNotes" className="block text-sm font-medium text-gray-700 mb-1.5">
                İade Notu (Opsiyonel)
              </label>
              <textarea
                id="returnNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="İade ile ilgili not ekleyebilirsiniz..."
                rows={2}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400"
                disabled={isSubmitting}
              />
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
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    İade Ediliyor...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Teslim Al
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