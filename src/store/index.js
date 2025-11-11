import { configureStore } from '@reduxjs/toolkit';
import fileSystemReducer from './fileSystemSlice';

const store = configureStore({
  reducer: {
    fileSystem: fileSystemReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;

