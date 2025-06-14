import { configureStore } from '@reduxjs/toolkit';
import solarDataReducer from './solarDataSlice';
import weatherReducer from './weatherSlice';

export const store = configureStore({
  reducer: {
    solarData: solarDataReducer,
    weather: weatherReducer,
  },
}); 