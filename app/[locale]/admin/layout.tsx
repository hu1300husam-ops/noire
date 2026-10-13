import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin';

export const metadata: Metadata = {
  title: {
    default: 'Command Center',
    template: '%s // Command Center',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
