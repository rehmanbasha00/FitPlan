import { configureStore } from '@reduxjs/toolkit';
import tripReducer from './slices/tripSlice';
import calendarReducer from './slices/calendarSlice';
import messageReducer from './slices/messageSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      trips: tripReducer,
      calendar: calendarReducer,
      messages: messageReducer,
      ui: uiReducer,
      auth: authReducer
    }
  });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
