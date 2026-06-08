import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Loader2, Search, BookOpen } from 'lucide-react';
import type { StudentOption, BookOption, BorrowFormErrors } from '@/types';
import { getDefaultBorrowDates, formatDateToISO, parseISODate, calculateDueDate } from '@/utils/dateUtils';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { studentId: number; bookId: number; borrowDate: string; dueDate: string; notes?: string }) => Promise<void>;
  students: StudentOption[];
  books: BookOption[];
  isLoading?: boolean;
}

export default function BorrowModal({ isOpen, onClose, onSubmit, students, books, isLoading }: BorrowModalProps) {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [bookId, setBookId] = useState<number | ''>('');
  const [borrowDate, setBorrowDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<BorrowFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  /** Modal açıldığında formu sıfırla ve tarihleri otomatik hesapla */
  const resetForm = useCallback(() => {
    const defaults = getDefaultBorrowDates();
    setBorrowDate(defaults.borrowDate.formatted);
    setDueDate(defaults.dueDate.formatted);
    setStudentId('');
    setBookId('');
    setNotes('');
    setErrors({});
    setStudentSearch('');
    setBookSearch('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  /** Verilme tarihi değiştiğinde iade tarihini otomatik olarak 15 gün sonrasına güncelle */
  const handleBorrowDateChange = useCallback((newBorrowDate: string) => {
    setBorrowDate(newBorrowDate);
    if (errors.borrowDate) {
      setErrors((prev) => ({ ...prev, borrowDate: undefined }));
    }
    // İade tarihini otomatik olarak 15 gün sonrasına hesapla
    if (newBorrowDate) {
      const parsedDate = parseISODate(newBorrowDate);
      const calculatedDue = calculateDueDate(parsedDate);
      setDueDate(formatDateToISO(calculatedDue));
    }
  }, [errors.borrowDate]);

  // Filtrelenmiş listeler
  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.studentNumber}`.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    (b.location && b.location.toLowerCase().includes(bookSearch.toLowerCase()))
  );

  const validateForm = (): boolean => {
    const newErrors: BorrowFormErrors = {};

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
    } else if (borrowDate && new Date(dueDate) <= new Date(borrowDate)) {
      newErrors.dueDate = 'Son teslim tarihi alış tarihinden sonra olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form verilerini toplayıp BorrowTransaction formatında işleyen fonksiyon
   */
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
      resetForm();
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => s.id === studentId);
  const selectedBook = books.find(b => b.id === bookId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kitap Ödünç Ver</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Öğrenci Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Öğrenci Seç <span className="text-red-500">*</span>
                </label>

                {/* Arama */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Öğrenci ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Öğrenci Listesi */}
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Öğrenci bulunamadı
                    </div>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setStudentId(s.id);
                          if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: undefined }));
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          studentId === s.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-700">
                              {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-500">{s.studentNumber} - {s.class?.name || '-'}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
              </div>

              {/* Kitap Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kitap Seç <span className="text-red-500">*</span>
                </label>

                {/* Arama */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Kitap ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Kitap Listesi */}
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {bookSearch ? 'Kitap bulunamadı' : 'Müsait kitap yok'}
                    </div>
                  ) : (
                    filteredBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setBookId(b.id);
                          if (errors.bookId) setErrors((prev) => ({ ...prev, bookId: undefined }));
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          bookId === b.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                        }`}
                      >
                        <p className="font-medium text-gray-900">{b.title}</p>
                        {b.location && (
                          <p className="text-xs text-gray-500">Raf: {b.location}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
                {errors.bookId && <p className="mt-1 text-sm text-red-600">{errors.bookId}</p>}
              </div>

              {/* Tarihler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="borrowDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Verilme Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="borrowDate"
                    value={borrowDate}
                    onChange={(e) => handleBorrowDateChange(e.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.borrowDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.borrowDate && <p className="mt-1 text-sm text-red-600">{errors.borrowDate}</p>}
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    İade Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                    }}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                  <p className="mt-1 text-xs text-gray-400">Otomatik: Verilme + 15 gün</p>
                </div>
              </div>

              {/* Not */}
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
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Seçili Bilgiler */}
            {(selectedStudent || selectedBook) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-2">Seçilenler:</p>
                {selectedStudent && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Öğrenci:</span> {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                )}
                {selectedBook && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Kitap:</span> {selectedBook.title}
                  </p>
                )}
              </div>
            )}

            {/* Butonlar */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting || books.length === 0 || students.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    İşlemi Tamamla
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