import { useEffect, useState } from 'react';
import { Plus, Users, ChevronDown } from 'lucide-react';
import { useStudentStore } from '@/hooks/useStudentStore';
import { useClassStore } from '@/hooks/useClassStore';
import {
  StudentModal,
  StudentTable,
} from '@/components/Student';
import { SearchBar, Pagination, DeleteConfirmModal } from '@/components/Class';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
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
    </div>
  );
}
