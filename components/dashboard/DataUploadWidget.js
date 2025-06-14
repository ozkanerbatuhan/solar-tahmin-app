import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDataFile, resetUploadStatus, resetJobStatus } from '../../store/solarDataSlice';
import { Card, Form, Button, Alert, ProgressBar, Table, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRouter } from 'next/router';

// Chart.js bileşenlerini kaydet
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Çeviriler için sabit nesne
const translations = {
  tr: {
    title: "Veri Yükleme",
    description: "Güneş enerji üretim verilerinizi TXT formatında yükleyerek tahmin modelimizin doğruluğunu artırabilirsiniz.",
    selectFile: "Dosya Seçin",
    supportedFormats: "Desteklenen format: TXT",
    upload: "Dosyayı Yükle",
    uploading: "Yükleniyor...",
    preview: "Önizleme",
    selectFileError: "Lütfen bir dosya seçin.",
    fileSizeError: "Dosya boyutu çok büyük. Maksimum 10MB.",
    fileTypeError: "Lütfen geçerli bir TXT dosyası seçin.",
    uploadSuccess: "Dosya başarıyla yüklendi ve işlendi!",
    dataFormat: "Veri Formatı",
    requiredColumns: "Yüklediğiniz dosyada aşağıdaki sütunlar bulunmalıdır:",
    timeColumn: "Time (GG/AA/YYYY SS:DD:SS formatında)",
    inverterColumns: "INV/1/DayEnergy (kWh) - INV/8/DayEnergy (kWh)",
    uploadedDataStats: "Yüklenen Veri İstatistikleri",
    totalData: "Toplam Veri Sayısı:",
    dateRange: "Kapsanan Tarih Aralığı:",
    records: "kayıt",
    filePreview: "Dosya Önizleme",
    first5Rows: "İlk 5 Satır:",
    previewChart: "Ön İzleme Grafiği:",
    hourlyData: "24 Saatlik Üretim Verisi",
    close: "Kapat",
    uploadThisData: "Bu Verileri Yükle"
  },
  en: {
    title: "Data Upload",
    description: "Upload your solar energy production data in CSV or Excel format to improve the accuracy of our prediction model.",
    selectFile: "Select File",
    supportedFormats: "Supported formats: CSV, Excel (.xls, .xlsx)",
    upload: "Upload File",
    uploading: "Uploading...",
    preview: "Preview",
    selectFileError: "Please select a file.",
    fileSizeError: "File size is too large. Maximum 10MB.",
    fileTypeError: "Please select a valid CSV or Excel file.",
    uploadSuccess: "File uploaded and processed successfully!",
    dataFormat: "Data Format",
    requiredColumns: "Your uploaded file should contain the following columns:",
    dateColumn: "Date (in YYYY-MM-DD format)",
    hourColumn: "Hour (integer between 0-23)",
    productionColumn: "Production (in kWh)",
    temperatureColumn: "Temperature (optional, in Celsius)",
    irradianceColumn: "Irradiance (optional, in W/m²)",
    uploadedDataStats: "Uploaded Data Statistics",
    totalData: "Total Data Count:",
    dateRange: "Date Range Covered:",
    records: "records",
    filePreview: "File Preview",
    first5Rows: "First 5 Rows:",
    previewChart: "Preview Chart:",
    hourlyData: "24 Hour Production Data",
    close: "Close",
    uploadThisData: "Upload This Data"
  }
};

const DataUploadWidget = () => {
  const dispatch = useDispatch();
  const { uploadStatus = {}, jobStatus = {}, historicalData = [] } = useSelector(state => state.solarData || {});
  const router = useRouter();
  const locale = router.locale || 'tr';
  const t = translations[locale];
  
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState({
    show: false,
    data: [],
    hasHeaders: true
  });
  const [validationError, setValidationError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewChart, setPreviewChart] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [uploadOptions, setUploadOptions] = useState({
    validate_only: false,
    fetch_weather: true,
    forced: false,
    train_models: true,
    fetch_future_weather: true
  });

  // Redux uploadStatus'dan bileşen state'ine senkronize et
  useEffect(() => {
    if (uploadStatus?.success && file) {
      // Yükleme başarılı olduysa dosya state'ini temizle
      setFile(null);
      
      // 5 saniye sonra başarı mesajını temizle
      const timer = setTimeout(() => {
        dispatch(resetUploadStatus());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadStatus?.success, dispatch, file]);

  // Job tamamlanma durumunu izle
  useEffect(() => {
    if (jobStatus?.completed) {
      setShowToast(true);
      
      // 10 saniye sonra job status'u temizle
      const timer = setTimeout(() => {
        dispatch(resetJobStatus());
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [jobStatus?.completed, dispatch]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setValidationError('');
    
    // Önceki yükleme statusunu temizle
    if (uploadStatus?.success || uploadStatus?.error) {
      dispatch(resetUploadStatus());
    }
    
    // Dosya önizleme işlemi burada yapılacak
    // Gerçek uygulamada bu kısımda Papa Parse veya xlsx.js kullanılmalı
    previewFile(selectedFile);
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split('\t');
      const data = lines.slice(1).map(line => {
        const values = line.split('\t');
        return {
          time: values[0],
          inv1: parseFloat(values[1]),
          inv2: parseFloat(values[2]),
          inv3: parseFloat(values[3]),
          inv4: parseFloat(values[4]),
          inv5: parseFloat(values[5]),
          inv6: parseFloat(values[6]),
          inv7: parseFloat(values[7]),
          inv8: parseFloat(values[8])
        };
      }).filter(row => row.time); // Boş satırları filtrele

      setFilePreview({
        show: true,
        data: data.slice(0, 5), // İlk 5 satırı göster
        hasHeaders: true
      });

      // Önizleme grafiği için veri hazırla
      preparePreviewChart(data);
    };
    reader.readAsText(file);
  };
  
  const preparePreviewChart = (data) => {
    const chartData = {
      labels: data.map(row => row.time.split(' ')[1]), // Saat kısmını al
      datasets: [
        {
          label: 'Toplam Üretim (kWh)',
          data: data.map(row => 
            row.inv1 + row.inv2 + row.inv3 + row.inv4 + 
            row.inv5 + row.inv6 + row.inv7 + row.inv8
          ),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3
        }
      ]
    };
    
    setPreviewChart(chartData);
  };

  const validateFile = () => {
    // Gerçek uygulamada dosya içeriği doğrulanır
    // Örneğin: gerekli sütunların varlığı, veri formatının doğruluğu vs.
    
    // Örnek bir doğrulama - dosya boyutu kontrolü
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setValidationError(t.fileSizeError);
      return false;
    }
    
    // CSV/Excel formatı kontrolü
    if (!file.name.endsWith('.txt')) {
      setValidationError(t.fileTypeError);
      return false;
    }
    
    return true;
  };

  const handleUpload = (e) => {
    e.preventDefault();
    
    if (!file) {
      setValidationError(t.selectFileError);
      return;
    }
    
    if (!validateFile()) {
      return;
    }
    
    // Redux action çağır - yeni API kullan
    dispatch(uploadDataFile({ file, options: uploadOptions }));
  };
  
  const handleShowPreview = () => {
    setShowPreviewModal(true);
  };
  
  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  return (
    <>
      <Card>
        <Card.Header as="h5">{t.title}</Card.Header>
        <Card.Body>
          <Card.Text>
            {t.description}
          </Card.Text>
          
          <Form onSubmit={handleUpload}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>{t.selectFile}</Form.Label>
              <Form.Control 
                type="file" 
                accept=".txt" 
                onChange={handleFileChange}
                disabled={uploadStatus?.isUploading}
              />
              <Form.Text className="text-muted">
                {t.supportedFormats}
              </Form.Text>
            </Form.Group>

            {/* Upload Seçenekleri */}
            <div className="mb-3">
              <h6>Yükleme Seçenekleri</h6>
              <Form.Check 
                type="checkbox"
                id="fetch_weather"
                label="Hava durumu verilerini getir"
                checked={uploadOptions.fetch_weather}
                onChange={(e) => setUploadOptions(prev => ({...prev, fetch_weather: e.target.checked}))}
                className="mb-2"
              />
              <Form.Check 
                type="checkbox"
                id="train_models"
                label="Modelleri eğit"
                checked={uploadOptions.train_models}
                onChange={(e) => setUploadOptions(prev => ({...prev, train_models: e.target.checked}))}
                className="mb-2"
              />
              <Form.Check 
                type="checkbox"
                id="fetch_future_weather"
                label="Gelecek hava durumu verilerini getir"
                checked={uploadOptions.fetch_future_weather}
                onChange={(e) => setUploadOptions(prev => ({...prev, fetch_future_weather: e.target.checked}))}
                className="mb-2"
              />
              <Form.Check 
                type="checkbox"
                id="forced"
                label="Zorla yükle (mevcut verilerin üzerine yaz)"
                checked={uploadOptions.forced}
                onChange={(e) => setUploadOptions(prev => ({...prev, forced: e.target.checked}))}
                className="mb-2"
              />
            </div>
            
            {uploadStatus?.progress > 0 && (
              <ProgressBar 
                now={uploadStatus.progress} 
                label={`${uploadStatus.progress}%`} 
                className="mb-3" 
                variant="info" 
              />
            )}

            {jobStatus?.isMonitoring && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <small><strong>İş Durumu:</strong> İşleniyor...</small>
                  <small>{jobStatus.currentProgress.toFixed(1)}%</small>
                </div>
                <ProgressBar 
                  now={jobStatus.currentProgress} 
                  variant="success" 
                  animated
                />
                {jobStatus.lastMessage && (
                  <small className="text-muted">{jobStatus.lastMessage}</small>
                )}
              </div>
            )}
            
            {validationError && (
              <Alert variant="danger" className="mb-3">
                {validationError}
              </Alert>
            )}
            
            {uploadStatus?.error && (
              <Alert variant="danger" className="mb-3">
                {uploadStatus.error}
              </Alert>
            )}
            
            {uploadStatus?.success && (
              <Alert variant="success" className="mb-3">
                {t.uploadSuccess}
              </Alert>
            )}
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={!file || uploadStatus?.isUploading || jobStatus?.isMonitoring}
              >
                {uploadStatus?.isUploading ? t.uploading : 
                 jobStatus?.isMonitoring ? 'İşleniyor...' : t.upload}
              </Button>
              
              {filePreview.show && (
                <Button 
                  variant="outline-info" 
                  onClick={handleShowPreview}
                  disabled={uploadStatus?.isUploading}
                >
                  {t.preview}
                </Button>
              )}
            </div>
          </Form>

          <div className="mt-3">
            <h6>{t.dataFormat}</h6>
            <p className="small text-muted">
              {t.requiredColumns}
              <br />
              - {t.timeColumn}
              <br />
              - {t.inverterColumns}
            </p>
          </div>
          
          {historicalData && historicalData.length > 0 && (
            <div className="mt-3">
              <h6>{t.uploadedDataStats}</h6>
              <p className="small text-muted">
                {t.totalData} {historicalData.length} {t.records}
                <br />
                {t.dateRange} {historicalData.length > 0 ? `${historicalData[0].date} - ${historicalData[historicalData.length-1].date}` : ''}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Dosya Önizleme Modalı */}
      <Modal show={showPreviewModal} onHide={handleClosePreview} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t.filePreview}: {file?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6>{t.previewChart}</h6>
            {previewChart && (
              <div style={{ height: '250px' }}>
                <Line 
                  data={previewChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: t.hourlyData
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          <h6>{t.first5Rows}</h6>
          <div className="table-responsive" style={{ maxHeight: '300px' }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>INV/1</th>
                  <th>INV/2</th>
                  <th>INV/3</th>
                  <th>INV/4</th>
                  <th>INV/5</th>
                  <th>INV/6</th>
                  <th>INV/7</th>
                  <th>INV/8</th>
                </tr>
              </thead>
              <tbody>
                {filePreview.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.time}</td>
                    <td>{row.inv1}</td>
                    <td>{row.inv2}</td>
                    <td>{row.inv3}</td>
                    <td>{row.inv4}</td>
                    <td>{row.inv5}</td>
                    <td>{row.inv6}</td>
                    <td>{row.inv7}</td>
                    <td>{row.inv8}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePreview}>
            {t.close}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleClosePreview();
              handleUpload({ preventDefault: () => {} });
            }}
            disabled={uploadStatus?.isUploading}
          >
            {t.uploadThisData}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Bildirimi */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={5000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">✅ İşlem Tamamlandı</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Dosya başarıyla yüklendi ve işlendi! Modeller eğitildi.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default DataUploadWidget; 