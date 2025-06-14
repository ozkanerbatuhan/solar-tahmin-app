import { Card, Spinner, Nav, Tab } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInverterMetricsData } from "../../store/solarDataSlice";

const MetricsPanel = ({ metrics = {}, isLoading = false }) => {
  const dispatch = useDispatch();
  const { inverterMetrics, isLoadingMetrics } = useSelector(
    (state) => state.solarData
  );
  const [activeTab, setActiveTab] = useState("production");

  // Varsayılan değerler
  const defaultMetrics = {
    dailyAverage: "45.75",
    monthlyProduction: "000.00",
    efficiencyRate: "76.25",
    accuracy: "94.80",
  };

  // metrics objesi null veya undefined ise ya da içeriği eksikse varsayılan değerleri kullan
  const safeMetrics = {
    dailyAverage: metrics?.dailyAverage || defaultMetrics.dailyAverage,
    monthlyProduction:
      metrics?.monthlyProduction || defaultMetrics.monthlyProduction,
    efficiencyRate: metrics?.efficiencyRate || defaultMetrics.efficiencyRate,
    accuracy: metrics?.accuracy || defaultMetrics.accuracy,
  };

  useEffect(() => {
    // Component mount olduğunda inverter metriklerini getir
    dispatch(fetchInverterMetricsData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  const renderProductionMetrics = () => (
    <div className="d-grid gap-3">
      <div className="p-2 bg-light rounded">
        <h6 className="text-muted mb-1">Günlük Ortalama Üretim</h6>
        <div className="d-flex align-items-center">
          <h3 className="mb-0">{safeMetrics.dailyAverage}</h3>
          <span className="ms-2">kWh</span>
        </div>
      </div>

      <div className="p-2 bg-light rounded">
        <h6 className="text-muted mb-1">Haftalık Toplam Üretim</h6>
        <div className="d-flex align-items-center">
          <h3 className="mb-0">{safeMetrics.monthlyProduction}</h3>
          <span className="ms-2">kWh</span>
        </div>
      </div>

     {/*  <div className="p-2 bg-light rounded">
        <h6 className="text-muted mb-1">Verimlilik Oranı</h6>
        <div className="d-flex align-items-center">
          <h3 className="mb-0">{safeMetrics.efficiencyRate}</h3>
          <span className="ms-2">%</span>
        </div>
      </div>

      <div className="p-2 bg-light rounded">
        <h6 className="text-muted mb-1">Tahmin Doğruluğu</h6>
        <div className="d-flex align-items-center">
          <h3 className="mb-0">{safeMetrics.accuracy}</h3>
          <span className="ms-2">%</span>
        </div>
      </div> */}
    </div>
  );

  const renderInverterMetrics = () => {
    if (isLoadingMetrics) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </div>
      );
    }

    return (
      <div className="d-grid gap-2">
        {Object.entries(inverterMetrics).map(([inverterId, metrics]) => {
          if (!metrics?.metrics) return null;

          return (
            <div key={inverterId} className="p-2 bg-light rounded">
              <h6 className="text-primary mb-2">INV/{inverterId}</h6>
              <div className="row">
                <div className="col-6">
                  <small className="text-muted">R² Değeri</small>
                  <div className="fw-bold">
                    {(metrics.metrics.r2 * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted">MAE</small>
                  <div className="fw-bold">
                    {metrics.metrics.mae.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Performans Metrikleri</h5>
          <Nav
            variant="pills"
            className="bg-primary"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="production"
                className={
                  activeTab === "production"
                    ? "bg-white text-primary"
                    : "text-white"
                }
                size="sm"
              >
                Üretim
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="models"
                className={
                  activeTab === "models"
                    ? "bg-white text-primary"
                    : "text-white"
                }
                size="sm"
              >
                Model
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
      </Card.Header>
      <Card.Body>
        <Tab.Content>
          <Tab.Pane active={activeTab === "production"}>
            {renderProductionMetrics()}
          </Tab.Pane>
          <Tab.Pane active={activeTab === "models"}>
            {renderInverterMetrics()}
          </Tab.Pane>
        </Tab.Content>
      </Card.Body>
      <Card.Footer className="bg-white border-0">
        <small className="text-muted">
          Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
        </small>
      </Card.Footer>
    </Card>
  );
};

export default MetricsPanel;
