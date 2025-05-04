// src/hooks.ts
import { useDispatch as reduxUseDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';


// Typed useSelector hook
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Typed useDispatch hook
export const useDispatch = () => reduxUseDispatch<AppDispatch>();
