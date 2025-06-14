import React from 'react';

function Error({ statusCode, message }) {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4 text-danger">Hata!</h1>
      <p className="lead">
        {statusCode 
          ? `${statusCode} - Sunucuda bir hata oluştu`
          : 'Bir istemci hatası oluştu'}
      </p>
      <p className="text-muted">{message || 'Lütfen daha sonra tekrar deneyin.'}</p>
      <div className="mt-4">
        <a href="/" className="btn btn-primary">Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err ? err.message : '';
  return { statusCode, message };
};

export default Error; 