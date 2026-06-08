import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services/dashboardService';
import {
  BookOpen, Users, GraduationCap, AlertTriangle, RefreshCw,
  Printer, FileText, Calendar, TrendingUp,
  Clock, CheckCircle
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import type { DashboardStats, MonthlyStats, ClassStats } from '@/types';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState<'overview' | 'monthly' | 'class' | 'overdue'>('overview');

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, monthlyData, classData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMonthlyStats(selectedYear),
        dashboardService.getClassStats(),
      ]);
      setStats(statsData);
      setMonthlyStats(monthlyData);
      setClassStats(classData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const maxMonthlyValue = Math.max(
    ...monthlyStats.map((m) => Math.max(m.borrowed, m.returned)),
    1
  );

  const maxBorrowCount = Math.max(...classStats.map((c) => c.borrowCount), 1);

  const currentMonth = new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="flex items-center justify-center w-9 h-9 bg-purple-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Raporlar ve İstatistikler</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Yazdır
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Type Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setReportType('overview')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                reportType === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Genel Bakış
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                reportType === 'monthly'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Aylık Rapor
            </button>
            <button
              onClick={() => setReportType('class')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                reportType === 'class'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Sınıf Raporu
            </button>
            <button
              onClick={() => setReportType('overdue')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                reportType === 'overdue'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Gecikenler
            </button>
          </div>
        </div>

        {/* Overview Report */}
        {reportType === 'overview' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Kütüphane Genel Durum Raporu</h2>
                  <p className="text-purple-100 mt-1">{currentMonth} itibarıyla</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-200">Rapor Tarihi</p>
                  <p className="font-medium">{new Date().toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Toplam Öğrenci</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Toplam Kitap</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalBooks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Müsait Kitap</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.availableBooks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ödünçteki Kitap</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.borrowedBooks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <RefreshCw className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Toplam İade</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.returnedBooks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Geciken Kitap</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.overdueBooks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Toplam Sınıf</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalClasses || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Toplam İşlem</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalBorrowings || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => navigate('/students')}
                  className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Öğrenci Listesi</span>
                </button>
                <button
                  onClick={() => navigate('/books')}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium">Kitap Listesi</span>
                </button>
                <button
                  onClick={() => navigate('/borrowings')}
                  className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Ödünç İşlemleri</span>
                </button>
                <button
                  onClick={() => navigate('/classes')}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-sm font-medium">Sınıf Listesi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Report */}
        {reportType === 'monthly' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Aylık İşlem Raporu</h2>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded" />
                  <span className="text-sm text-gray-600">Ödünç Verilen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm text-gray-600">İade Edilen</span>
                </div>
              </div>

              <div className="flex items-end gap-1.5 h-64">
                {monthlyStats.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-0.5 items-end" style={{ height: '200px' }}>
                      <div
                        className="flex-1 bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                        style={{ height: `${(m.borrowed / maxMonthlyValue) * 100}%`, minHeight: m.borrowed > 0 ? '4px' : '0' }}
                        title={`Ödünç: ${m.borrowed}`}
                      />
                      <div
                        className="flex-1 bg-green-400 rounded-t transition-all hover:bg-green-500"
                        style={{ height: `${(m.returned / maxMonthlyValue) * 100}%`, minHeight: m.returned > 0 ? '4px' : '0' }}
                        title={`İade: ${m.returned}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-2">{m.month}</span>
                    <span className="text-xs text-gray-400">{m.borrowed + m.returned}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Toplam Ödünç</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {monthlyStats.reduce((acc, m) => acc + m.borrowed, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Toplam İade</p>
                  <p className="text-2xl font-bold text-green-600">
                    {monthlyStats.reduce((acc, m) => acc + m.returned, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Net Değişim</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {monthlyStats.reduce((acc, m) => acc + m.borrowed, 0) - monthlyStats.reduce((acc, m) => acc + m.returned, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Report */}
        {reportType === 'class' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sınıf Bazlı İstatistikler</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sınıf</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Öğrenci</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Ödünç</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Doluluk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classStats.map((c) => (
                      <tr key={c.className} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                            {c.className}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">{c.studentCount}</td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">{c.borrowCount}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5 max-w-[120px]">
                              <div
                                className="bg-purple-500 h-2.5 rounded-full"
                                style={{ width: `${c.studentCount > 0 ? Math.min((c.borrowCount / c.studentCount) * 100, 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {c.studentCount > 0 ? Math.round((c.borrowCount / c.studentCount) * 100) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {classStats.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2" />
                  <p>Henüz sınıf verisi yok</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overdue Report */}
        {reportType === 'overdue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Geciken Kitaplar</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{stats?.overdueBooks || 0} Geciken</span>
                </div>
              </div>

              {stats?.overdueBooks === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">Harika!</h3>
                  <p className="text-gray-500 mt-1">Şu anda geciken kitap yok.</p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Geciken kitapları görüntülemek için <button onClick={() => navigate('/borrowings')} className="text-purple-600 hover:underline">Ödünç İşlemleri</button> sayfasını ziyaret edin.
                </p>
              )}
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Müsait</p>
                    <p className="text-2xl font-bold text-green-800">{stats?.availableBooks || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Ödünçte</p>
                    <p className="text-2xl font-bold text-blue-800">{stats?.borrowedBooks || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-red-600">Gecikmiş</p>
                    <p className="text-2xl font-bold text-red-800">{stats?.overdueBooks || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
