import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServerHealth } from '../store/solarDataSlice';
import LanguageSwitcher from './LanguageSwitcher';

// Dil çevirilerini burada sabit olarak tanımlıyoruz
const translations = {
  tr: {
    home: "Ana Sayfa",
    dashboard: "Dashboard",
    dataimport: "Veri İçe Aktar",
    statistics: "İstatistikler"
  },
  en: {
    home: "Home",
    dashboard: "Dashboard",
    dataimport: "Import Data",
    statistics: "Statistics"
  }
};

export default function Navbar() {
  const router = useRouter();
  const locale = router.locale || 'tr';
  const t = translations[locale];
  const dispatch = useDispatch();
  const { serverHealth } = useSelector(state => state.solarData);

  useEffect(() => {
    // Sayfa yüklendiğinde sunucu durumunu kontrol et
    dispatch(fetchServerHealth());
    
    // Her 30 saniyede bir sunucu durumunu kontrol et
    const interval = setInterval(() => {
      dispatch(fetchServerHealth());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const getHealthStatusBadge = () => {
    const { status, database } = serverHealth;
    
    if (status === 'healthy' && database === 'connected') {
      return <span className="badge bg-success ms-2">Online</span>;
    } else if (status === 'error') {
      return <span className="badge bg-danger ms-2">Offline</span>;
    } else {
      return <span className="badge bg-warning ms-2">Kontrol Ediliyor</span>;
    }
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link href="/" className="navbar-brand">
          Solar Tahmin
          {getHealthStatusBadge()}
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* <li className="nav-item">
              <Link 
                href="/" 
                className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}
              >
                {t.home}
              </Link>
            </li> */}
            <li className="nav-item">
              <Link 
                href="/dashboard" 
                className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}
              >
                {t.dashboard}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/import" 
                className={`nav-link ${router.pathname === '/import' ? 'active' : ''}`}
              >
                {t.dataimport}
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link 
                href="/stats" 
                className={`nav-link ${router.pathname === '/stats' ? 'active' : ''}`}
              >
                {t.statistics}
              </Link>
            </li> */}
          </ul>
          <div className="d-flex">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
} 