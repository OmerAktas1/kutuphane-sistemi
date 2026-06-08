import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useClassStore } from '@/hooks/useClassStore';
import {
  ClassModal,
  ClassTable,
  Pagination,
  SearchBar,
  DeleteConfirmModal,
} from '@/components/Class';
import BackButton from '@/components/BackButton';
import type { Class } from '@/types';

export default function ClassPage() {
  const {
    classes,
    pagination,
    isLoading,
    searchQuery,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    setSearchQuery,
    setPage,
    setLimit,
  } = useClassStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (name: string) => {
    await createClass(name);
  };

  const handleUpdate = async (name: string) => {
    if (editingClass) {
      await updateClass(editingClass.id, name);
    }
  };

  const handleDelete = async () => {
    if (deletingClass) {
      await deleteClass(deletingClass.id);
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (classItem: Class) => {
    setEditingClass(classItem);
    setIsModalOpen(true);
  };

  const openDeleteModal = (classItem: Class) => {
    setDeletingClass(classItem);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sınıf Yönetimi</h1>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni Sınıf
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
                  placeholder="Sınıf adı ile ara..."
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Kayıt:</label>
                <select
                  value={pagination?.limit || 10}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <ClassTable
            classes={classes}
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
            <div className="text-sm text-gray-500 mt-1">Toplam Sınıf</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {pagination?.totalPages || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Toplam Sayfa</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {pagination?.limit || 10}
            </div>
            <div className="text-sm text-gray-500 mt-1">Sayfa Başına Kayıt</div>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingClass ? handleUpdate : handleCreate}
        classItem={editingClass}
        mode={editingClass ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        onConfirm={handleDelete}
        title="Sınıf Silme"
        message="Bu sınıfı silmek istediğinizden emin misiniz?"
        itemName={deletingClass?.name}
      />
    </div>
  );
}
