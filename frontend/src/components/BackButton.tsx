import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Geri dönülecek yol. Varsayılan: '/' (Dashboard) */
  to?: string;
  /** Butonun yanında gösterilecek metin. Opsiyonel */
  label?: string;
  /** Ek CSS class'ları */
  className?: string;
}

/**
 * Dashboard ve alt sayfalarda tutarlı geri dönüş navigasyonu sağlayan bileşen.
 * React Router DOM kullanarak yönlendirme yapar.
 *
 * Kullanım:
 * ```tsx
 * <BackButton />                        // Dashboard'a döner
 * <BackButton to="/books" />             // Kitap sayfasına döner
 * <BackButton label="Ana Sayfa" />       // Metin etiketi ile gösterir
 * ```
 */
export default function BackButton({ to = '/', label, className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group ${className}`}
      title={label || 'Ana Sayfa'}
    >
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}