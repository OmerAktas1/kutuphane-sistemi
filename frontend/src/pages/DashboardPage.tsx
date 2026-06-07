import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { dashboardService } from '@/services/dashboardService';
import toast from 'react-hot-toast';
import {
  BookOpen, Users, GraduationCap, AlertTriangle, ArrowRight,
  LogOut, Clock, CheckCircle, RefreshCw, TrendingUp,
} from 'lucide-react';
import type { DashboardStats, RecentTransaction, MonthlyStats, ClassStats } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use callback to prevent infinite loop
  const handleLogout = useCallback(() => {
    logout();
    toast.success('Çıkış yapıldı');
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, transactionsData, monthlyData, classData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentTransactions(8),
          dashboardService.getMonthlyStats(new Date().getFullYear()),
          dashboardService.getClassStats(),
        ]);
        setStats(statsData);
        setTransactions(transactionsData);
        setMonthlyStats(monthlyData);
        setClassStats(classData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const maxBorrowCount = Math.max(...classStats.map((c) => c.borrowCount), 1);
  const maxMonthlyValue = Math.max(
    ...monthlyStats.map((m) => Math.max(m.borrowed, m.returned)),
    1
  );

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
              <h1 className="text-xl font-bold text-gray-900">Kütüphane Takip Sistemi</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-gray-500">
                <span>{user?.username}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-primary-600 font-medium">{user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all group"
            onClick={() => navigate('/students')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Öğrenci</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : stats?.totalStudents || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Yönet</span>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group"
            onClick={() => navigate('/classes')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Sınıf</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : stats?.totalClasses || 0}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                <GraduationCap className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-primary-600">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Yönet</span>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
            onClick={() => navigate('/books')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Kitap</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : stats?.totalBooks || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-blue-600">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Yönet</span>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all group"
            onClick={() => navigate('/borrowings')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ödünçteki Kitap</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : stats?.borrowedBooks || 0}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-amber-600">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Görüntüle</span>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-red-300 transition-all group"
            onClick={() => navigate('/borrowings')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Geciken Kitap</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : stats?.overdueBooks || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-red-600">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Görüntüle</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Aylık İşlem Grafiği</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary-600" />
                  <span className="text-gray-500">Ödünç</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-500">İade</span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-48">
              {monthlyStats.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: '160px' }}>
                    <div
                      className="flex-1 bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                      style={{ height: `${(m.borrowed / maxMonthlyValue) * 100}%`, minHeight: m.borrowed > 0 ? '4px' : '0' }}
                      title={`Ödünç: ${m.borrowed}`}
                    />
                    <div
                      className="flex-1 bg-green-400 rounded-t transition-all hover:bg-green-500"
                      style={{ height: `${(m.returned / maxMonthlyValue) * 100}%`, minHeight: m.returned > 0 ? '4px' : '0' }}
                      title={`İade: ${m.returned}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Class Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sınıf Bazlı</h2>
              <GraduationCap className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {classStats.slice(0, 8).map((c) => (
                <div key={c.className} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-10">{c.className}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(c.borrowCount / maxBorrowCount) * 100}%`, minWidth: c.borrowCount > 0 ? '8px' : '0' }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{c.borrowCount}</span>
                </div>
              ))}
              {classStats.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Veri yok</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Hızlı Erişim</h2>
            <button
              onClick={() => navigate('/borrowings')}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-left text-white shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Kitap Alma</p>
                  <p className="text-sm text-primary-100">Ödünç ve iade işlemleri</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/books')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-left text-white shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Kitap Yönetimi</p>
                  <p className="text-sm text-blue-100">Kitap ekle ve düzenle</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/students')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-left text-white shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Öğrenci Yönetimi</p>
                  <p className="text-sm text-green-100">Öğrenci işlemleri</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 text-left text-white shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Raporlar</p>
                  <p className="text-sm text-purple-100">Detaylı raporlar</p>
                </div>
              </div>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Son İşlemler</h2>
              <button
                onClick={() => navigate('/borrowings')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 text-primary-600 animate-spin" />
                <span className="ml-2 text-gray-500">Yükleniyor...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Clock className="h-10 w-10 mb-2" />
                <p className="text-sm">Henüz işlem yapılmadı</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      t.type === 'RETURN' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {t.type === 'RETURN' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.studentName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.bookTitle}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        t.type === 'RETURN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.type === 'RETURN' ? 'İade' : 'Ödünç'}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(t.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Müsait Kitap</span>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-1">{stats?.availableBooks || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Aktif Ödünç</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-1">{stats?.borrowedBooks || 0}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Toplam İade</span>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-1">{stats?.returnedBooks || 0}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700 font-medium">Gecikme</span>
            </div>
            <p className="text-2xl font-bold text-red-800 mt-1">{stats?.overdueBooks || 0}</p>
          </div>
        </div>
      </main>
    </div>
  );
}