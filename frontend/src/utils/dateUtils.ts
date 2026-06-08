/**
 * Tarih yardımcı fonksiyonları
 * Kütüphane Takip Sistemi - Kitap Alma Modülü
 */

import type { DateInfo } from '@/types';

/**
 * Varsayılan ödünç süresi (gün)
 */
export const DEFAULT_BORROW_DAYS = 15;

/**
 * Bugünün tarihini Date nesnesi olarak döndürür
 * @returns Bugünün tarihi (saat 00:00:00)
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Belirtilen tarihe gün ekler
 * @param date - Başlangıç tarihi
 * @param days - Eklenecek gün sayısı
 * @returns Yeni tarih
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * İade tarihini hesaplar (verilme tarihinden 15 gün sonra)
 * @param borrowDate - Verilme tarihi
 * @param days - Ödünç gün sayısı (varsayılan: 15)
 * @returns Hesaplanan iade tarihi
 */
export function calculateDueDate(borrowDate: Date, days: number = DEFAULT_BORROW_DAYS): Date {
  return addDays(borrowDate, days);
}

/**
 * Tarihi ISO formatında (YYYY-MM-DD) döndürür
 * @param date - Formatlanacak tarih
 * @returns ISO formatında tarih stringi
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Tarihi Türkçe formatta (DD.MM.YYYY) döndürür
 * @param date - Formatlanacak tarih
 * @returns Türkçe formatlı tarih stringi
 */
export function formatDateToDisplay(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Tarihi DateInfo nesnesi olarak döndürür
 * @param date - İşlenecek tarih
 * @returns DateInfo nesnesi
 */
export function getDateInfo(date: Date): DateInfo {
  return {
    date,
    formatted: formatDateToISO(date),
    display: formatDateToDisplay(date),
  };
}

/**
 * ISO formatındaki stringi Date nesnesine dönüştürür
 * @param isoString - ISO formatında tarih stringi (YYYY-MM-DD)
 * @returns Date nesnesi
 */
export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Bugünün tarihi ve varsayılan iade tarihini içeren nesneyi döndürür
 * Ödünç verme formu için kullanılır
 * @param days - Ödünç gün sayısı (varsayılan: 15)
 * @returns { borrowDate: DateInfo, dueDate: DateInfo }
 */
export function getDefaultBorrowDates(days: number = DEFAULT_BORROW_DAYS): {
  borrowDate: DateInfo;
  dueDate: DateInfo;
} {
  const today = getToday();
  const due = calculateDueDate(today, days);

  return {
    borrowDate: getDateInfo(today),
    dueDate: getDateInfo(due),
  };
}

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param date1 - İlk tarih
 * @param date2 - İkinci tarih
 * @returns Gün farkı
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Bir tarihin geçerli olup olmadığını kontrol eder
 * @param date - Kontrol edilecek tarih
 * @returns Geçerli ise true
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Tarih bilgisini backend'e gönderilecek formata dönüştürür
 * @param date - Dönüştürülecek tarih
 * @returns ISO formatında string
 */
export function toBackendDate(date: Date): string {
  return formatDateToISO(date);
}

/**
 * Backend'den gelen tarihi Date nesnesine dönüştürür
 * @param backendDate - Backend'den gelen tarih stringi
 * @returns Date nesnesi
 */
export function fromBackendDate(backendDate: string): Date {
  return parseISODate(backendDate);
}
