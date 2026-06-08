import { useEffect, useState } from 'react';
import { Plus, BookOpen, ChevronDown, RotateCcw, Clock, CheckCircle, History, AlertCircle } from 'lucide-react';
import { useBorrowingStore } from '@/hooks/useBorrowingStore';
import { SearchBar, Pagination } from '@/components/Class';
import { BorrowModal, BorrowingTable, ReturnModal } from '@/components/Borrowing';
import { borrowingService } from '@/services/borrowingService';
import BackButton from '@/components/BackButton';
import type { Borrowing, BorrowStatus, StudentOption, BookOption } from '@/types';

type TabType = 'active' | 'history';

export default function BorrowingPage() {
  const {
    borrowings,
    pagination,
    stats,
    isLoading,
    fetchBorrowings,
    fetchStats,
    createBorrowing,
    returnBook,
    setPage,
    setLimit,
    setStatusFilter,
    queryParams,
  } = useBorrowingStore();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [availableBooks, setAvailableBooks] = useState<BookOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    fetchBorrowings();
    fetchStats();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'active') {
      setStatusFilter('BORROWED');
    } else {
      setStatusFilter('RETURNED');
    }
  }, [activeTab]);

  const openBorrowModal = async () => {
    setIsLoadingData(true);
    try {
      const [studentsData, booksData] = await Promise.all([
        borrowingService.getStudents(),
        borrowingService.getAvailableBooks(),
      ]);
      setStudents(studentsData);
      setAvailableBooks(booksData);
      setIsBorrowModalOpen(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const openReturnModal = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReturnModalOpen(true);
  };

  const handleCreate = async (data: { studentId: number; bookId: number; borrowDate: string; dueDate: string; notes?: string }) => {
    await createBorrowing(data);
  };

  const handleReturn = async (borrowingId: number, notes?: string) => {
    const success = await returnBook(borrowingId, notes);
    if (success) {
      setIsReturnModalOpen(false);
      setSelectedBorrowing(null);
    }
  };

  const handleReturnSubmit = async (notes?: string) => {
    if (selectedBorrowing) {
      await handleReturn(selectedBorrowing.id, notes);
    }
  };

  const handleReturnDirect = async (borrowing: Borrowing) => {
    await returnBook(borrowing.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Kitap Alma Sistemi</h1>
            </div>

            <button
              onClick={openBorrowModal}
              disabled={isLoadingData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoadingData ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Kitap Ver
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
                <div className="text-sm text-gray-500">Toplam İşlem</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats?.borrowed || 0}</div>
                <div className="text-sm text-gray-500">Aktif Ödünç</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats?.returned || 0}</div>
                <div className="text-sm text-gray-500">İade Edildi</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
                <div className="text-sm text-gray-500">Gecikmiş</div>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowing List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                Aktif Ödünçler
                {stats?.borrowed !== undefined && stats.borrowed > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                    {stats.borrowed}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="w-4 h-4" />
                Geçmiş Kayıtlar
                {stats?.returned !== undefined && stats.returned > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    {stats.returned}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <SearchBar
                  value=""
                  onChange={() => {}}
                  placeholder="Öğrenci veya kitap ara..."
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pagination?.limit || 10}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <BorrowingTable
            borrowings={borrowings}
            isLoading={isLoading}
            onReturn={activeTab === 'active' ? openReturnModal : handleReturnDirect}
            showReturnDate={activeTab === 'history'}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900">Bilgi</h4>
              <p className="text-sm text-amber-700 mt-1">
                <strong>Aktif Ödünçler:</strong> Henüz iade edilmemiş kitaplar.
                <strong>Geçmiş Kayıtlar:</strong> İade edilmiş kitapların geçmişi.
                Aktif ödünçlerde "Teslim Al" butonu ile iade işlemi yapabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSubmit={handleCreate}
        students={students}
        books={availableBooks}
        isLoading={isLoadingData}
      />

      {/* Return Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedBorrowing(null);
        }}
        onSubmit={handleReturnSubmit}
        borrowing={selectedBorrowing}
      />
    </div>
  );
}
