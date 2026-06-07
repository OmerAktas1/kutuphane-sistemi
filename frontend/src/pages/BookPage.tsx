import { useEffect, useState } from 'react';
import { Plus, BookOpen, ChevronDown } from 'lucide-react';
import { useBookStore } from '@/hooks/useBookStore';
import { SearchBar } from '@/components/Class';
import { DeleteConfirmModal } from '@/components/Class';
import { BookModal, BookTable } from '@/components/Book';
import { Pagination } from '@/components/Class';
import type { Book, BookStatus } from '@/types';

export default function BookPage() {
  const {
    books,
    pagination,
    isLoading,
    searchQuery,
    selectedStatus,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    setSearchQuery,
    setStatusFilter,
    setPage,
    setLimit,
  } = useBookStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCreate = async (data: { title: string; location?: string; status: BookStatus }) => {
    await createBook(data);
  };

  const handleUpdate = async (data: { title: string; location?: string; status: BookStatus }) => {
    if (editingBook) {
      await updateBook(editingBook.id, data);
    }
  };

  const handleDelete = async () => {
    if (deletingBook) {
      await deleteBook(deletingBook.id);
    }
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const openDeleteModal = (book: Book) => {
    setDeletingBook(book);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  };

  const availableCount = books.filter((b) => b.status === 'AVAILABLE').length;
  const borrowedCount = books.filter((b) => b.status === 'BORROWED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Kitap Yönetimi</h1>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni Kitap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Kitap adı veya raf numarası ile ara..."
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedStatus || ''}
                    onChange={(e) => setStatusFilter(e.target.value ? (e.target.value as BookStatus) : null)}
                    className="border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white min-w-[150px]"
                  >
                    <option value="">Tüm Durumlar</option>
                    <option value="AVAILABLE">Müsait</option>
                    <option value="BORROWED">Ödünç Verildi</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
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
          <BookTable
            books={books}
            isLoading={isLoading}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
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

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-primary-600">
              {pagination?.total || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Toplam Kitap</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {availableCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">Müsait</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-amber-600">
              {borrowedCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">Ödünç Verildi</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {pagination?.totalPages || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Toplam Sayfa</div>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingBook ? handleUpdate : handleCreate}
        book={editingBook}
        mode={editingBook ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleDelete}
        title="Kitap Silme"
        message="Bu kitabı silmek istediğinizden emin misiniz?"
        itemName={deletingBook?.title}
      />
    </div>
  );
}
