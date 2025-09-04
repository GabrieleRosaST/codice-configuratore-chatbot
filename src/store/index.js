import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';
import argomentiReducer from './argomentiSlice';
import calendarioReducer from './calendarioSlice';



export const store = configureStore({
    reducer: {
        form: formReducer,
        argomenti: argomentiReducer,
        calendario: calendarioReducer
    },
});

export default store;