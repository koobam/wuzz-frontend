import type { ReactNode } from 'react';

export const Td = ({ children, className = '' }: { children?: ReactNode; className?: string }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
