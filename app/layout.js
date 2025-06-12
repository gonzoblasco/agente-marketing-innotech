import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'InnoTech Solutions - Agentes Conversacionales',
    template: '%s | InnoTech Solutions',
  },
  description:
    'La primera plataforma que permite acceder a un catálogo de agentes de IA especializados para emprendedores y PyMEs latinos.',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#2563eb' },
      }}
      localization={{
        locale: 'es-ES',
      }}
    >
      <html lang='es'>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
