import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Error from 'next/error';

// Default Error Component
const CustomError = ({ statusCode, message }) => {
  return (
    <div className="container py-5 text-center">
      <h1 className="text-danger">Hata!</h1>
      <p>
        {statusCode 
          ? `${statusCode} - Sunucuda bir hata oluştu`
          : 'Bir istemci hatası oluştu'}
      </p>
      <p className="text-muted">{message || 'Lütfen daha sonra tekrar deneyin.'}</p>
    </div>
  );
};

function MyApp({ Component, pageProps }) {
  // Bootstrap JS'i client tarafında yükleme
  useEffect(() => {
    typeof document !== undefined
      ? require('bootstrap/dist/js/bootstrap')
      : null;
  }, []);

  // Hata durumunu kontrol et
  if (pageProps.error) {
    return <CustomError statusCode={pageProps.error.statusCode} message={pageProps.error.message} />;
  }

  return (
    <Provider store={store}>
      <Navbar />
      <Component {...pageProps} />
    </Provider>
  );
}

// appWithTranslation yerine doğrudan bileşeni export ediyoruz
// appWithTranslation eklenmek istendiğinde tekrar aktif edilebilir
export default MyApp; 