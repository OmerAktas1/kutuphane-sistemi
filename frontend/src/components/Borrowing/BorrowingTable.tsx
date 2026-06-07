import { useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle, Clock, RotateCcw, AlertCircle, CalendarCheck } from 'lucide-react';
import type { Borrowing, BorrowStatus } from '@/types';

interface BorrowingTableProps {
  borrowings: Borrowing[];
  isLoading: boolean;
  onReturn: (borrowing: Borrowing) => void;
  showReturnDate?: boolean;
}

function StatusBadge({ status }: { status: BorrowStatus }) {
  switch (status) {
    case 'BORROWED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3" />
          Ödünç Verildi
        </span>
      );
    case 'RETURNED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          İade Edildi
        </span>
      );
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3" />
          Gecikmiş
        </span>
      );
    case 'LOST':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertTriangle className="w-3 h-3" />
          Kayıp
        </span>
      );
    default:
      return null;
  }
}

function isOverdue(borrowing: Borrowing): boolean {
  return (borrowing.status === 'BORROWED' || borrowing.status === 'OVERDUE') &&
    new Date(borrowing.dueDate) < new Date();
}

export default function BorrowingTable({ borrowings, isLoading, onReturn, showReturnDate = false }: BorrowingTableProps) {
  const [returningId, setReturningId] = useState<number | null>(null);

  const handleReturn = async (borrowing: Borrowing) => {
    setReturningId(borrowing.id);
    try {
      await onReturn(borrowing);
    } finally {
      setReturningId(null);
    }
  };

  if (isLoading && borrowings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-600">Yükleniyor...</span>
      </div>
    );
  }

  if (borrowings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <AlertTriangle className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-lg font-medium">Kayıt bulunamadı</p>
        <p className="text-sm">Henüz ödünç işlemi yapılmadı.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Öğrenci
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Kitap
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Alış Tarihi
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Son Teslim
            </th>
            {showReturnDate && (
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                İade Tarihi
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Durum
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              İşlem
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {borrowings.map((borrowing) => {
            const overdue = isOverdue(borrowing);
            return (
              <tr key={borrowing.id} className={`hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-green-700">
                        {borrowing.student?.firstName?.charAt(0)}
                        {borrowing.student?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {borrowing.student?.firstName} {borrowing.student?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {borrowing.student?.studentNumber} - {borrowing.student?.class?.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{borrowing.book?.title}</p>
                  <p className="text-xs text-gray-500">{borrowing.book?.location || '-'}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(borrowing.borrowDate).toLocaleDateString('tr-TR')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  {new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}
                  {overdue && <span className="ml-1 text-xs">⚠️</span>}
                </td>
                {showReturnDate && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {borrowing.returnDate ? (
                      <div className="flex items-center gap-1.5 text-sm text-green-600">
                        <CalendarCheck className="w-4 h-4" />
                        {new Date(borrowing.returnDate).toLocaleDateString('tr-TR')}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={borrowing.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {(borrowing.status === 'BORROWED' || borrowing.status === 'OVERDUE') && (
                    <button
                      onClick={() => handleReturn(borrowing)}
                      disabled={returningId === borrowing.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                      title="İade Et"
                    >
                      {returningId === borrowing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      Teslim Al
                    </button>
                  )}
                  {borrowing.status === 'RETURNED' && showReturnDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Tamamlandı
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
