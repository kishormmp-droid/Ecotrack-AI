import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCO2(kg: number): string {
  if (kg < 0.001) return "0 kg";
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(2)} kg`;
}

export function formatCO2Value(kg: number): string {
  return kg.toFixed(2);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(n);
}
