import { useContext } from 'react';
import { TransitContext } from './transitContext.js';

export function useTransit() {
  const context = useContext(TransitContext);
  if (!context) throw new Error('useTransit must be used inside TransitProvider.');
  return context;
}
