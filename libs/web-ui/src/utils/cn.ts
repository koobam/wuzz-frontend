import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins class names, and lets the later one win when two say the same thing (`px-4` then `px-6`). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
