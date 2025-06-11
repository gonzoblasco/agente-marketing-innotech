import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'InnoTech Solutions - Agentes Conversacionales',
    template: '%s | InnoTech Solutions',
  },
  description:
    'La primera plataforma que permite acceder a un catálogo de agentes de IA especializados para emprendedores y PyMEs latinos.',
  keywords:
    'agentes conversacionales, IA, emprendedores, PyMEs, Argentina, consultoría',
  authors: [{ name: 'Gonzalo Blasco', url: 'https://innotechsolutions.com' }],
  creator: 'Gonzalo Blasco',
  publisher: 'InnoTech Solutions',
  metadataBase: new URL('https://agente-marketing-innotech.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://agente-marketing-innotech.vercel.app',
    title: 'InnoTech Solutions - Netflix de Agentes Conversacionales',
    description:
      'Accedé a un catálogo de agentes de IA especializados para resolver problemas específicos de emprendedores y PyMEs latinos.',
    siteName: 'InnoTech Solutions',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InnoTech Solutions - Netflix de Agentes Conversacionales',
    description:
      'Accedé a un catálogo de agentes de IA especializados para resolver problemas específicos de emprendedores y PyMEs latinos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
