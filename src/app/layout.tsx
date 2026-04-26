import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'CCK-Hub Admin',
  description: 'CCK-Hub — Document Management & Workflow System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#F6F6F6]">
        <I18nProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
