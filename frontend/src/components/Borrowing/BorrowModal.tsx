import { useState, useEffect } from 'react';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  class?: { id: number; name: string };
}

interface Book {
  id: number;
  title: string;
  location: string | null;
}

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { studentId: number; bookId: number; borrowDate: string; dueDate: string; notes?: string }) => Promise<void>;
  students: Student[];
  books: Book[];
  isLoading?: boolean;
}

export default function BorrowModal({ isOpen, onClose, onSubmit, students, books, isLoading }: BorrowModalProps) {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [bookId, setBookId] = useState<number | ''>('');
  const [borrowDate, setBorrowDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set default dates
      const today = new Date();
      const due = new Date(today);
      due.setDate(due.getDate() + 15);

      setBorrowDate(today.toISOString().split('T')[0]);
      setDueDate(due.toISOString().split('T')[0]);
      setStudentId('');
      setBookId('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!studentId) {
      newErrors.studentId = 'Öğrenci seçimi gerekli';
    }

    if (!bookId) {
      newErrors.bookId = 'Kitap seçimi gerekli';
    }

    if (!borrowDate) {
      newErrors.borrowDate = 'Alış tarihi gerekli';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Son teslim tarihi gerekli';
    } else if (new Date(dueDate) <= new Date(borrowDate)) {
      newErrors.dueDate = 'Son teslim tarihi alış tarihinden sonra olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        studentId: studentId as number,
        bookId: bookId as number,
        borrowDate,
        dueDate,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Kitap Ödünç Ver</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Student Selection */}
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Öğrenci <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="studentId"
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value ? Number(e.target.value) : '');
                      if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: '' }));
                    }}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none ${
                      errors.studentId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    } ${!studentId ? 'text-gray-400' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Öğrenci seçin</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentNumber}) - {s.class?.name || '-'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
              </div>

              {/* Book Selection */}
              <div>
                <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kitap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="bookId"
                    value={bookId}
                    onChange={(e) => {
                      setBookId(e.target.value ? Number(e.target.value) : '');
                      if (errors.bookId) setErrors((prev) => ({ ...prev, bookId: '' }));
                    }}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none ${
                      errors.bookId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    } ${!bookId ? 'text-gray-400' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Kitap seçin</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} {b.location ? `(${b.location})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {books.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    Müsait kitap yok. Tüm kitaplar ödünç verilmiş olabilir.
                  </p>
                )}
                {errors.bookId && <p className="mt-1 text-sm text-red-600">{errors.bookId}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="borrowDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Alış Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="borrowDate"
                    value={borrowDate}
                    onChange={(e) => {
                      setBorrowDate(e.target.value);
                      if (errors.borrowDate) setErrors((prev) => ({ ...prev, borrowDate: '' }));
                    }}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.borrowDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.borrowDate && <p className="mt-1 text-sm text-red-600">{errors.borrowDate}</p>}
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Son Teslim Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
                    }}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Not
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Opsiyonel not..."
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
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
                disabled={isSubmitting || books.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Ödünç Ver
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
