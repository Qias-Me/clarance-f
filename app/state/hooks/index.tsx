// src/hooks.ts
import { useDispatch as reduxUseDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';


// Typed useSelector hook
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Typed useDispatch hook
export const useDispatch = () => reduxUseDispatch<AppDispatch>();
