import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export default function PriceDisplay({ product, usd, npr, size = 'md', className = '' }) {
  const { formatPrice } = useCurrency();
  const prices = usd !== undefined ? formatPrice(usd, npr) : formatPrice(product);

  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-2xl font-black',
  };
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span className={`font-mono ${sizeClass} ${className}`}>
      {prices.primary}
    </span>
  );
}
