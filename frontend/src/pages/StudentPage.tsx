import { useEffect, useState } from 'react';
import { Plus, Users, ChevronDown, X, BookOpen, Search } from 'lucide-react';
import { useStudentStore } from '@/hooks/useStudentStore';
import { useClassStore } from '@/hooks/useClassStore';
import {
  StudentModal,
  StudentTable,
} from '@/components/Student';
import { SearchBar, Pagination, DeleteConfirmModal } from '@/components/Class';
import { borrowingService } from '@/services/borrowingService';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import type { Student } from '@/types';

export default function StudentPage() {
  const {
    students,
    pagination,
    isLoading,
    searchQuery,
    selectedClassId,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    setSearchQuery,
    setClassFilter,
    setPage,
    setLimit,
  } = useStudentStore();

  const { classes, fetchClasses } = useClassStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Kitap verme modal state
  const [isGiveBookModalOpen, setIsGiveBookModalOpen] = useState(false);
  const [selectedStudentForBook, setSelectedStudentForBook] = useState<Student | null>(null);
  const [availableBooks, setAvailableBooks] = useState<{ id: number; title: string; location: string | null }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleCreate = async (data: { firstName: string; lastName: string; studentNumber: string; classId: number }) => {
    await createStudent(data);
  };

  const handleUpdate = async (data: { firstName: string; lastName: string; studentNumber: string; classId: number }) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data);
    }
  };

  const handleDelete = async () => {
    if (deletingStudent) {
      await deleteStudent(deletingStudent.id);
    }
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const openDeleteModal = (student: Student) => {
    setDeletingStudent(student);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  // Kitap verme fonksiyonları
  const openGiveBookModal = async (student: Student) => {
    setSelectedStudentForBook(student);
    setIsLoadingBooks(true);
    setIsGiveBookModalOpen(true);
    setSelectedBookId(null);
    setSearchTerm('');

    try {
      const books = await borrowingService.getAvailableBooks();
      setAvailableBooks(books);
    } catch (error) {
      console.error('Kitaplar yüklenemedi:', error);
      toast.error('Kitaplar yüklenemedi');
      setAvailableBooks([]);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const closeGiveBookModal = () => {
    setIsGiveBookModalOpen(false);
    setSelectedStudentForBook(null);
    setSelectedBookId(null);
    setAvailableBooks([]);
    setSearchTerm('');
  };

  const handleGiveBook = async () => {
    if (!selectedStudentForBook || !selectedBookId) {
      toast.error('Lütfen kitap seçin');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 14);

      await borrowingService.create({
        studentId: selectedStudentForBook.id,
        bookId: selectedBookId,
        borrowDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
      });

      toast.success('Kitap başarıyla verildi');
      fetchStudents(); // Listeyi yenile
      closeGiveBookModal();
    } catch (error: any) {
      console.error('Kitap verilemedi:', error);
      toast.error(error?.response?.data?.error || 'Kitap verilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrelenmiş kitap listesi
  const filteredBooks = availableBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.location && book.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Öğrenci Yönetimi</h1>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni Öğrenci
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
                  placeholder="Ad, soyad veya numara ile ara..."
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => setClassFilter(e.target.value ? Number(e.target.value) : null)}
                    className="border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white min-w-[140px]"
                  >
                    <option value="">Tüm Sınıflar</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
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
          <StudentTable
            students={students}
            isLoading={isLoading}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onGiveBook={openGiveBookModal}
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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-primary-600">
              {pagination?.total || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Toplam Öğrenci</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {classes.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Sınıf Sayısı</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {selectedClassId
                ? students.filter((s) => s.classId === selectedClassId).length
                : pagination?.total || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {selectedClassId ? 'Seçili Sınıf' : 'Görüntülenen'}
            </div>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingStudent ? handleUpdate : handleCreate}
        student={editingStudent}
        classes={classes}
        mode={editingStudent ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        title="Öğrenci Silme"
        message="Bu öğrenciyi silmek istediğinizden emin misiniz?"
        itemName={deletingStudent ? `${deletingStudent.firstName} ${deletingStudent.lastName}` : undefined}
      />

      {/* Kitap Verme Modal */}
      {isGiveBookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeGiveBookModal} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Kitap Ver</h3>
                </div>
                <button
                  onClick={closeGiveBookModal}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Öğrenci Bilgisi */}
                {selectedStudentForBook && (
                  <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-700">
                          {selectedStudentForBook.firstName.charAt(0)}{selectedStudentForBook.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedStudentForBook.firstName} {selectedStudentForBook.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedStudentForBook.studentNumber} - {selectedStudentForBook.class?.name || 'Sınıfsız'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kitap Arama ve Seçimi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Müsait Kitaplar
                  </label>
                  
                  {/* Arama Kutusu */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Kitap ara..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {isLoadingBooks ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-gray-600">Kitaplar yükleniyor...</span>
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {searchTerm ? 'Arama sonucunda kitap bulunamadı' : 'Müsait kitap yok'}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredBooks.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => setSelectedBookId(book.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedBookId === book.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedBookId === book.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                            }`}>
                              {selectedBookId === book.id && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{book.title}</p>
                              {book.location && (
                                <p className="text-sm text-gray-500">Raf: {book.location}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seçili Kitap Bilgisi */}
                {selectedBookId && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Seçili Kitap:</p>
                    <p className="text-gray-900">
                      {availableBooks.find(b => b.id === selectedBookId)?.title}
                    </p>
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex gap-3">
                  <button
                    onClick={closeGiveBookModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleGiveBook}
                    disabled={!selectedBookId || isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Veriliyor...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        Kitap Ver
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
