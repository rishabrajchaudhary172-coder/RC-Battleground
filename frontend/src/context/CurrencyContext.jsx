import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CurrencyContext = createContext(null);
const DEFAULT_RATE = 133.50;

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('rc_currency') || 'NPR');
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_RATE);

  useEffect(() => {
    localStorage.setItem('rc_currency', currency);
  }, [currency]);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setExchangeRate(d.exchange_rate || d.npr_per_usd || DEFAULT_RATE))
      .catch(() => {});
  }, []);

  const usdToNpr = useCallback((usd) => Math.round(parseFloat(usd || 0) * exchangeRate * 100) / 100, [exchangeRate]);
  const nprToUsd = useCallback((npr) => Math.round((parseFloat(npr || 0) / exchangeRate) * 100) / 100, [exchangeRate]);

  const formatPrice = useCallback((productOrUsd, nprOverride) => {
    const usd = typeof productOrUsd === 'object'
      ? parseFloat(productOrUsd.price_usd || productOrUsd.price || 0)
      : parseFloat(productOrUsd || 0);
    const npr = nprOverride ?? (typeof productOrUsd === 'object'
      ? parseFloat(productOrUsd.price_npr || usdToNpr(usd))
      : usdToNpr(usd));

    const nprFormatted = `Rs. ${npr.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return {
      primary: nprFormatted,
      secondary: '',
      nprFormatted,
      usd,
      npr,
    };
  }, [usdToNpr]);

  const toggleCurrency = () => setCurrency((c) => (c === 'USD' ? 'NPR' : 'USD'));

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency, exchangeRate, formatPrice, usdToNpr, nprToUsd }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
