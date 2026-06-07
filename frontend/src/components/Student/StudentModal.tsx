import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Loader2, ChevronDown } from 'lucide-react';
import type { Student, Class } from '@/types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { firstName: string; lastName: string; studentNumber: string; classId: number }) => Promise<void>;
  student?: Student | null;
  classes: Class[];
  mode: 'create' | 'edit';
}

export default function StudentModal({ isOpen, onClose, onSubmit, student, classes, mode }: StudentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [classId, setClassId] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setStudentNumber(student.studentNumber);
      setClassId(student.classId);
    } else {
      setFirstName('');
      setLastName('');
      setStudentNumber('');
      setClassId('');
    }
    setErrors({});
  }, [student, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Ad gerekli';
    } else if (!/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/.test(firstName)) {
      newErrors.firstName = 'Ad sadece harf içerebilir';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Soyad gerekli';
    } else if (!/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/.test(lastName)) {
      newErrors.lastName = 'Soyad sadece harf içerebilir';
    }

    if (!studentNumber.trim()) {
      newErrors.studentNumber = 'Okul numarası gerekli';
    }

    if (!classId) {
      newErrors.classId = 'Sınıf seçimi gerekli';
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentNumber: studentNumber.trim(),
        classId: classId as number,
      });
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
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Yeni Öğrenci Ekle' : 'Öğrenci Düzenle'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                  }}
                  placeholder="Örn: Ahmet"
                  className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  autoFocus
                  disabled={isSubmitting}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                  }}
                  placeholder="Örn: Yılmaz"
                  className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Student Number */}
              <div>
                <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Okul Numarası <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="studentNumber"
                  value={studentNumber}
                  onChange={(e) => {
                    setStudentNumber(e.target.value);
                    if (errors.studentNumber) setErrors((prev) => ({ ...prev, studentNumber: '' }));
                  }}
                  placeholder="Örn: 1234"
                  className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.studentNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.studentNumber && <p className="mt-1 text-sm text-red-600">{errors.studentNumber}</p>}
              </div>

              {/* Class */}
              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sınıf <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="classId"
                    value={classId}
                    onChange={(e) => {
                      setClassId(e.target.value ? Number(e.target.value) : '');
                      if (errors.classId) setErrors((prev) => ({ ...prev, classId: '' }));
                    }}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none ${
                      errors.classId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    } ${!classId ? 'text-gray-400' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Sınıf seçin</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId}</p>}
              </div>
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
