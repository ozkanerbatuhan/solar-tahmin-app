import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentWeather: null,
  forecast: [],
  isLoading: false,
  error: null
};

export const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setCurrentWeather: (state, action) => {
      state.currentWeather = action.payload;
      state.isLoading = false;
    },
    setForecast: (state, action) => {
      state.forecast = action.payload;
      state.isLoading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    }
  },
});

export const { 
  startLoading, 
  setCurrentWeather, 
  setForecast, 
  setError 
} = weatherSlice.actions;

// Örnek bir thunk - hava durumu verisi almak için
export const fetchWeatherData = (location = 'İstanbul') => async (dispatch) => {
  try {
    dispatch(startLoading());
    
    // Gerçek bir API çağrısı yapılacak, şimdilik rastgele veri oluşturuyoruz
    const mockCurrentWeather = {
      location,
      temperature: Math.floor(Math.random() * 25) + 5, // 5-30 arası
      condition: ['Güneşli', 'Parçalı Bulutlu', 'Bulutlu', 'Yağmurlu'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30, // 30-80 arası
      wind: Math.floor(Math.random() * 30) + 5, // 5-35 arası
      irradiance: Math.floor(Math.random() * 1000) + 200 // 200-1200 W/m² arası
    };
    
    const mockForecast = Array.from({length: 7}, (_, i) => ({
      day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', {weekday: 'long'}),
      temperature: {
        min: Math.floor(Math.random() * 10) + 5, // 5-15 arası
        max: Math.floor(Math.random() * 15) + 15 // 15-30 arası
      },
      condition: ['Güneşli', 'Parçalı Bulutlu', 'Bulutlu', 'Yağmurlu'][Math.floor(Math.random() * 4)],
      irradiance: Math.floor(Math.random() * 1000) + 200 // 200-1200 W/m² arası
    }));
    
    dispatch(setCurrentWeather(mockCurrentWeather));
    dispatch(setForecast(mockForecast));
  } catch (error) {
    dispatch(setError(error.toString()));
  }
};

export default weatherSlice.reducer; 