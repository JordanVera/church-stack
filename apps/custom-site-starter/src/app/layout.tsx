import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom church site',
  description: 'Church Stack Custom plan starter — shared API / DB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: '#f7f4ef' }}>
        {children}
      </body>
    </html>
  );
}
