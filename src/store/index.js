import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';

export const store = configureStore({
    reducer: {
        form: formReducer, // Collega la fetta di stato al nome "form"
    },
});