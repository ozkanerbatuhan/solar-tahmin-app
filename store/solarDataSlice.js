import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  checkServerHealth, 
  fetchAllInverterPredictions, 
  fetchAllInverterMetrics,
  transformAPIDataToChartFormat,
  uploadTextFile,
  fetchJobStatus
} from '../utils/api';

// Sunucu durumu kontrolü
export const fetchServerHealth = createAsyncThunk(
  'solarData/fetchServerHealth',
  async (_, { rejectWithValue }) => {
    try {
      const healthData = await checkServerHealth();
      return healthData;
    } catch (error) {
      return rejectWithValue(error.message || 'Sunucu durumu alınamadı');
    }
  }
);

// Gerçek API'den inverter tahminlerini getir
export const fetchRealTimePredictions = createAsyncThunk(
  'solarData/fetchRealTimePredictions',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const now = new Date();
      const startTime = now.toISOString();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 saat sonra
      
      // Progress callback ile her inverter geldiğinde güncelle
      const onProgress = (inverterId, predictions) => {
        dispatch(updateInverterData({ inverterId, predictions }));
      };
      
      const allPredictions = await fetchAllInverterPredictions(startTime, endTime, 60, onProgress);
      const chartData = transformAPIDataToChartFormat(allPredictions);
      
      return chartData;
    } catch (error) {
      return rejectWithValue(error.message || 'Gerçek zamanlı veriler alınamadı');
    }
  }
);

// Inverter metriklerini getir
export const fetchInverterMetricsData = createAsyncThunk(
  'solarData/fetchInverterMetricsData',
  async (_, { rejectWithValue }) => {
    try {
      const allMetrics = await fetchAllInverterMetrics();
      return allMetrics;
    } catch (error) {
      return rejectWithValue(error.message || 'Inverter metrikleri alınamadı');
    }
  }
);

// Dosya yükleme
export const uploadDataFile = createAsyncThunk(
  'solarData/uploadDataFile',
  async ({ file, options }, { rejectWithValue, dispatch }) => {
    try {
      const result = await uploadTextFile(file, options);
      
      // Upload başarılı olduktan sonra job durumunu izlemeye başla
      if (result.job_id) {
        dispatch(startJobMonitoring(result.job_id));
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Dosya yüklenemedi');
    }
  }
);

// Job durumu kontrolü
export const checkJobStatus = createAsyncThunk(
  'solarData/checkJobStatus',
  async (_, { rejectWithValue }) => {
    try {
      const jobData = await fetchJobStatus(false, 20);
      return jobData;
    } catch (error) {
      return rejectWithValue(error.message || 'Job durumu alınamadı');
    }
  }
);

// Job izleme başlatma
export const startJobMonitoring = (jobId) => (dispatch) => {
  const interval = setInterval(async () => {
    try {
      const jobData = await fetchJobStatus(false, 20);
      dispatch(updateJobStatus(jobData));
      
      // Aktif job yoksa monitoring'i durdur
      if (jobData.active_jobs.total === 0) {
        clearInterval(interval);
        dispatch(jobCompleted());
      }
    } catch (error) {
      console.error('Job monitoring error:', error);
      clearInterval(interval);
    }
  }, 2000); // Her 2 saniyede bir kontrol et
  
  return interval;
};

// Tarih aralığı tahminleri için async thunk - API çağrısı yerine statik veri döndürür
export const fetchDateRangePredictions = createAsyncThunk(
  'solarData/fetchDateRangePredictions',
  async (params, { rejectWithValue }) => {
    try {
      // Eğer tek parametre geldiyse, startDate, endDate ve resolution ayıklanır
      let startDate, endDate, resolution;
      
      if (typeof params === 'object' && !Array.isArray(params)) {
        startDate = params.startDate;
        endDate = params.endDate;
        resolution = params.resolution || 'daily';
      } else if (arguments.length >= 2) {
        // Eski çağrı stili için geriye dönük uyumluluk
        startDate = arguments[0];
        endDate = arguments[1];
        resolution = arguments[2] || 'daily';
      } else {
        // İlk pozisyonel argüman olarak alınır, diğerleri varsayılan değerler kullanır
        startDate = params;
        endDate = new Date().toISOString().split('T')[0]; // Bugün
        resolution = 'daily';
      }
      
      // API çağrısı yerine statik veri
      // Gerçek API yanıtını simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms gecikme
      
      // Statik veriler
      const predictions = generateStaticPredictions(startDate, endDate, resolution);
      
      return {
        dateRange: {
          startDate,
          endDate,
          resolution
        },
        predictions
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Tahmin verileri alınamadı');
    }
  }
);

// Statik tahmin verileri oluşturan yardımcı fonksiyon
const generateStaticPredictions = (startDate, endDate, resolution) => {
  const predictions = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayMillis = 24 * 60 * 60 * 1000;
  
  // İki tarih arasındaki gün sayısını hesapla
  const daysDiff = Math.round((end - start) / dayMillis) + 1;
  
  if (resolution === 'hourly') {
    // Saatlik veri için
    for (let d = 0; d < daysDiff; d++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + d);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      for (let hour = 0; hour < 24; hour++) {
        predictions.push({
          date: dateStr,
          hour,
          prediction: Math.floor(Math.random() * 40) + 20, // 20-60 kWh
          actual: Math.random() > 0.2 ? Math.floor(Math.random() * 40) + 20 : null, // %80 oranında gerçek veri, %20 null
          temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
          irradiance: Math.floor(Math.random() * 600) + 200, // 200-800 W/m²
          efficiency: (Math.random() * 15 + 75).toFixed(1) // %75-90 verimlilik
        });
      }
    }
  } else if (resolution === 'daily') {
    // Günlük veri için
    for (let d = 0; d < daysDiff; d++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + d);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      predictions.push({
        date: dateStr,
        prediction: Math.floor(Math.random() * 400) + 300, // 300-700 kWh
        actual: Math.random() > 0.2 ? Math.floor(Math.random() * 400) + 300 : null,
        temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
        irradiance: Math.floor(Math.random() * 600) + 200, // 200-800 W/m²
        efficiency: (Math.random() * 15 + 75).toFixed(1) // %75-90 verimlilik
      });
    }
  } else if (resolution === 'weekly') {
    // Haftalık veri için
    const weeks = Math.ceil(daysDiff / 7);
    for (let w = 0; w < weeks; w++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + w * 7);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      predictions.push({
        date: dateStr,
        week: w + 1,
        prediction: Math.floor(Math.random() * 2000) + 1500, // 1500-3500 kWh
        actual: Math.random() > 0.3 ? Math.floor(Math.random() * 2000) + 1500 : null,
        efficiency: (Math.random() * 15 + 75).toFixed(1) // %75-90 verimlilik
      });
    }
  } else if (resolution === 'monthly') {
    // Aylık veri için
    const startMonth = start.getMonth();
    const endMonth = end.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
    const months = endMonth - startMonth + 1;
    
    for (let m = 0; m < months; m++) {
      const currentDate = new Date(start);
      currentDate.setMonth(start.getMonth() + m);
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
      
      predictions.push({
        date: dateStr,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        prediction: Math.floor(Math.random() * 8000) + 6000, // 6000-14000 kWh
        actual: Math.random() > 0.3 ? Math.floor(Math.random() * 8000) + 6000 : null,
        efficiency: (Math.random() * 15 + 75).toFixed(1) // %75-90 verimlilik
      });
    }
  }
  
  return predictions;
};

// Tek tarih için tahmin async thunk - API çağrısı yerine statik veri döndürür
export const fetchPrediction = createAsyncThunk(
  'solarData/fetchPrediction',
  async (date, { rejectWithValue }) => {
    try {
      // API çağrısı yerine statik veri
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms gecikme
      
      // Statik tahmin verisi
      const predictionData = generateStaticPredictionForDate(date);
      
      return {
        selectedDate: date,
        prediction: predictionData
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Tahmin verileri alınamadı');
    }
  }
);

// Belirli bir tarih için statik tahmin verisi oluşturan yardımcı fonksiyon
const generateStaticPredictionForDate = (date) => {
  const baseValue = Math.random() * 40 + 20; // 20-60 kWh
  const hourlyData = [];
  
  // Saatlik veriler
  for (let hour = 0; hour < 24; hour++) {
    let hourMultiplier = 1;
    
    // Gün içinde üretimin değişimini simüle et
    if (hour < 6) {
      hourMultiplier = 0.1; // Sabah erken saatlerde düşük üretim
    } else if (hour >= 6 && hour < 10) {
      hourMultiplier = 0.5 + (hour - 6) * 0.1; // Sabah artan üretim
    } else if (hour >= 10 && hour < 16) {
      hourMultiplier = 0.9 + (Math.random() * 0.2); // Öğlen en yüksek üretim
    } else if (hour >= 16 && hour < 20) {
      hourMultiplier = 0.8 - (hour - 16) * 0.2; // Akşam düşen üretim
    } else {
      hourMultiplier = 0.1; // Gece düşük üretim
    }
    
    // Rastgele biraz değişiklik ekle
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2 arası çarpan
    const prediction = baseValue * hourMultiplier * randomFactor;
    
    // Bir kısmı için gerçek değerler (bazıları null olabilir)
    const hasActual = hour < new Date().getHours() && Math.random() > 0.2;
    const actual = hasActual ? prediction * (0.8 + Math.random() * 0.4) : null;
    
    hourlyData.push({
      hour,
      prediction: Math.round(prediction * 10) / 10, // 1 ondalık basamak hassasiyetle yuvarla
      actual,
      temperature: Math.floor(Math.random() * 15) + 10 + (hour > 8 && hour < 18 ? 5 : 0), // Gündüz daha sıcak
      irradiance: Math.floor(
        Math.max(0, hourMultiplier * 1000 * randomFactor)
      ) // Güneş ışığı ile orantılı
    });
  }
  
  return {
    date,
    totalPrediction: hourlyData.reduce((sum, hour) => sum + hour.prediction, 0).toFixed(1),
    totalActual: hourlyData
      .filter(hour => hour.actual !== null)
      .reduce((sum, hour) => sum + hour.actual, 0).toFixed(1),
    efficiency: (Math.random() * 15 + 75).toFixed(1), // %75-90 verimlilik
    peakHour: 12 + Math.floor(Math.random() * 3), // 12-14 arası
    hourlyData
  };
};

// Üretim verisi yükleme thunk
export const uploadProductionData = createAsyncThunk(
  'solarData/uploadProductionData',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      // Gerçek API entegrasyonu yerine simülasyon
      // İlerleme bildirimi için
      for (let progress = 0; progress <= 100; progress += 10) {
        dispatch(updateUploadProgress(progress));
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms gecikme
      }
      
      // Simüle edilmiş başarılı yanıt
      // Gerçek uygulamada burada bir API çağrısı yapılır ve dosya yüklenir
      const mockData = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 gün öncesi
      
      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        for (let hour = 0; hour < 24; hour++) {
          mockData.push({
            date: dateStr,
            hour,
            production: Math.floor(Math.random() * 80) + 20, // 20-100 arası üretim
            temperature: Math.floor(Math.random() * 20) + 10, // 10-30°C
            irradiance: Math.floor(Math.random() * 800) + 200 // 200-1000 W/m²
          });
        }
      }
      
      // Yanıtı simüle et
      return mockData;
    } catch (error) {
      return rejectWithValue(error.message || 'Dosya yüklenemedi');
    }
  }
);

const calculateMetrics = (prediction) => {
  if (!prediction) return {};
  
  // Saatlik verileri topla
  const hourlyPredictions = prediction.hourlyData?.map(hour => hour.prediction) || [];
  const hourlyActuals = prediction.hourlyData?.map(hour => hour.actual).filter(val => val !== null) || [];
  
  // Günlük ortalama ve toplam hesapla
  const dailyTotalPrediction = hourlyPredictions.reduce((sum, val) => sum + val, 0);
  const dailyTotalActual = hourlyActuals.length > 0 ? hourlyActuals.reduce((sum, val) => sum + val, 0) : null;
  
  // Doğruluk oranı (gerçek değerler varsa)
  let accuracy = null;
  if (dailyTotalActual !== null && dailyTotalPrediction > 0) {
    const diff = Math.abs(dailyTotalPrediction - dailyTotalActual);
    accuracy = 100 - (diff / dailyTotalPrediction * 100);
    accuracy = Math.min(100, Math.max(0, accuracy)); // 0-100 arasında sınırla
  }
  
  // Aylık toplam üretim (30 günlük veri kullanarak tahmini)
  const monthlyProduction = dailyTotalPrediction * 7;
  
  // Verimlilik oranı (kurulu güce göre)
  const installedCapacity = 10; // kW (varsayılan değer)
  const dailyMaxPotential = installedCapacity * 24; // Teorik maksimum günlük üretim
  const efficiencyRate = (dailyTotalPrediction / dailyMaxPotential) * 100;
  
  return {
    dailyAverage: (dailyTotalPrediction / 24).toFixed(2),
    dailyTotal: dailyTotalPrediction.toFixed(2),
    monthlyProduction: monthlyProduction.toFixed(2),
    efficiencyRate: efficiencyRate.toFixed(2),
    accuracy: accuracy !== null ? accuracy.toFixed(2) : null
  };
};

const initialState = {
  selectedDate: new Date().toISOString().split('T')[0], // Bugünün tarihi
  dateRange: {
    startDate: new Date().toISOString().split('T')[0], // Bugünün tarihi
    endDate: new Date().toISOString().split('T')[0], // Bugünün tarihi 
    resolution: 'daily'
  },
  isLoading: false,
  isLoadingRange: false,
  isLoadingRealTime: false,
  isLoadingMetrics: false,
  prediction: null,
  predictionData: null, // API'den gelen gerçek zamanlı veriler
  dateRangePredictions: [],
  historicalData: [],
  inverterData: {}, // Her inverter'ın ayrı verileri
  metrics: {
    dailyAverage: "45.75",
    dailyTotal: "1098.00", 
    monthlyProduction: "32940.00", 
    efficiencyRate: "76.25",
    accuracy: "94.80"
  },
  inverterMetrics: {}, // API'den gelen inverter metrikleri
  serverHealth: {
    status: 'unknown',
    api_version: null,
    database: null,
    lastChecked: null
  },
  uploadStatus: {
    isUploading: false,
    progress: 0,
    success: false,
    error: null
  },
  jobStatus: {
    activeJobs: [],
    isMonitoring: false,
    currentProgress: 0,
    lastMessage: '',
    completed: false
  },
  error: null
};

const solarDataSlice = createSlice({
  name: 'solarData',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = {
        ...state.dateRange,
        ...action.payload
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    startLoadingRange: (state) => {
      state.isLoadingRange = true;
      state.error = null;
    },
    setHistoricalData: (state, action) => {
      state.historicalData = action.payload;
    },
    setPrediction: (state, action) => {
      state.prediction = action.payload;
      state.isLoading = false;
      // Metrikleri güncelle
      state.metrics = calculateMetrics(action.payload);
    },
    setDateRangePredictions: (state, action) => {
      state.dateRangePredictions = action.payload;
      state.isLoadingRange = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isLoadingRange = false;
    },
    resetUploadStatus: (state) => {
      state.uploadStatus = {
        isUploading: false,
        progress: 0,
        success: false,
        error: null
      };
    },
    updateUploadProgress: (state, action) => {
      state.uploadStatus.progress = action.payload;
    },
    updateInverterData: (state, action) => {
      const { inverterId, predictions } = action.payload;
      state.inverterData[inverterId] = predictions;
    },
    setServerHealth: (state, action) => {
      state.serverHealth = {
        ...action.payload,
        lastChecked: new Date().toISOString()
      };
    },
    updateJobStatus: (state, action) => {
      const { active_jobs } = action.payload;
      state.jobStatus.activeJobs = active_jobs.jobs;
      state.jobStatus.isMonitoring = active_jobs.total > 0;
      
      if (active_jobs.jobs.length > 0) {
        const currentJob = active_jobs.jobs[0];
        state.jobStatus.currentProgress = currentJob.progress || 0;
        state.jobStatus.lastMessage = currentJob.last_message || '';
      }
    },
    jobCompleted: (state) => {
      state.jobStatus.isMonitoring = false;
      state.jobStatus.completed = true;
      state.jobStatus.currentProgress = 100;
    },
    resetJobStatus: (state) => {
      state.jobStatus = {
        activeJobs: [],
        isMonitoring: false,
        currentProgress: 0,
        lastMessage: '',
        completed: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Tek tarih tahmini
      .addCase(fetchPrediction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrediction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDate = action.payload.selectedDate;
        state.prediction = action.payload.prediction;
        state.metrics = calculateMetrics(action.payload.prediction);
      })
      .addCase(fetchPrediction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Tahmin verileri alınamadı';
      })
      
      // Tarih aralığı tahminleri
      .addCase(fetchDateRangePredictions.pending, (state) => {
        state.isLoadingRange = true;
        state.error = null;
      })
      .addCase(fetchDateRangePredictions.fulfilled, (state, action) => {
        state.isLoadingRange = false;
        state.dateRange = action.payload.dateRange;
        state.dateRangePredictions = action.payload.predictions;
      })
      .addCase(fetchDateRangePredictions.rejected, (state, action) => {
        state.isLoadingRange = false;
        state.error = action.payload || 'Tarih aralığı tahminleri alınamadı';
      })
      
      // Dosya yükleme işlemleri
      .addCase(uploadProductionData.pending, (state) => {
        state.uploadStatus = {
          isUploading: true,
          progress: 0,
          success: false,
          error: null
        };
      })
      .addCase(uploadProductionData.fulfilled, (state, action) => {
        state.uploadStatus = {
          isUploading: false,
          progress: 100,
          success: true,
          error: null
        };
        state.historicalData = action.payload;
      })
      .addCase(uploadProductionData.rejected, (state, action) => {
        state.uploadStatus = {
          isUploading: false,
          progress: 0,
          success: false,
          error: action.payload
        };
      })
      
      // Sunucu durumu kontrolü
      .addCase(fetchServerHealth.fulfilled, (state, action) => {
        state.serverHealth = {
          ...action.payload,
          lastChecked: new Date().toISOString()
        };
      })
      .addCase(fetchServerHealth.rejected, (state, action) => {
        state.serverHealth = {
          status: 'error',
          api_version: null,
          database: null,
          lastChecked: new Date().toISOString()
        };
      })
      
      // Gerçek zamanlı tahminler
      .addCase(fetchRealTimePredictions.pending, (state) => {
        state.isLoadingRealTime = true;
        state.error = null;
      })
      .addCase(fetchRealTimePredictions.fulfilled, (state, action) => {
        state.isLoadingRealTime = false;
        state.predictionData = action.payload;
        // Metrikleri güncelle
        const dailyTotal = parseFloat(action.payload.dailyTotal);
        state.metrics = {
          ...state.metrics,
          dailyTotal: dailyTotal.toFixed(2),
          dailyAverage: (dailyTotal / 24).toFixed(2),
          monthlyProduction: (dailyTotal * 30).toFixed(2)
        };
      })
      .addCase(fetchRealTimePredictions.rejected, (state, action) => {
        state.isLoadingRealTime = false;
        state.error = action.payload || 'Gerçek zamanlı veriler alınamadı';
      })
      
      // Inverter metrikleri
      .addCase(fetchInverterMetricsData.pending, (state) => {
        state.isLoadingMetrics = true;
        state.error = null;
      })
      .addCase(fetchInverterMetricsData.fulfilled, (state, action) => {
        state.isLoadingMetrics = false;
        state.inverterMetrics = action.payload;
      })
      .addCase(fetchInverterMetricsData.rejected, (state, action) => {
        state.isLoadingMetrics = false;
        state.error = action.payload || 'Inverter metrikleri alınamadı';
      })
      
      // Dosya yükleme
      .addCase(uploadDataFile.pending, (state) => {
        state.uploadStatus = {
          isUploading: true,
          progress: 0,
          success: false,
          error: null
        };
      })
      .addCase(uploadDataFile.fulfilled, (state, action) => {
        state.uploadStatus.isUploading = false;
        state.uploadStatus.success = true;
        // Job monitoring başladı
        state.jobStatus.isMonitoring = true;
      })
      .addCase(uploadDataFile.rejected, (state, action) => {
        state.uploadStatus = {
          isUploading: false,
          progress: 0,
          success: false,
          error: action.payload
        };
      })
      
      // Job durumu kontrolü
      .addCase(checkJobStatus.fulfilled, (state, action) => {
        const { active_jobs } = action.payload;
        state.jobStatus.activeJobs = active_jobs.jobs;
        state.jobStatus.isMonitoring = active_jobs.total > 0;
      });
  }
});

export const { 
  setSelectedDate, 
  setDateRange,
  setPrediction, 
  setHistoricalData, 
  setDateRangePredictions,
  startLoading,
  startLoadingRange,
  setError,
  clearError,
  resetUploadStatus,
  updateUploadProgress,
  updateInverterData,
  setServerHealth,
  updateJobStatus,
  jobCompleted,
  resetJobStatus
} = solarDataSlice.actions;

export default solarDataSlice.reducer; 