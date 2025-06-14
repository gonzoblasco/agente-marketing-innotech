import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://agente-marketing-innotech.vercel.app'),
  title: {
    default: 'InnoTech Solutions - Netflix de Agentes Conversacionales',
    template: '%s | InnoTech Solutions',
  },
  description:
    'La primera plataforma que permite acceder a un catálogo de agentes de IA especializados para emprendedores y PyMEs latinos. Consultorías expertas instantáneas.',
  keywords: [
    'agentes de IA',
    'inteligencia artificial',
    'emprendedores Argentina',
    'PyMEs',
    'consultorías',
    'chatbots especializados',
    'marketing digital Argentina',
    'ventas B2B',
    'asesoría financiera',
    'consultoría legal',
    'automatización empresarial',
    'startup Argentina',
  ],
  authors: [{ name: 'Gonzalo Blasco' }],
  creator: 'Gonzalo Blasco',
  publisher: 'InnoTech Solutions',
  openGraph: {
    title: 'InnoTech Solutions - Netflix de Agentes Conversacionales',
    description:
      'Accedé a un catálogo de agentes de IA especializados. Cada agente es un experto en su área: marketing, ventas, finanzas, legal y más para PyMEs argentinas.',
    url: 'https://agente-marketing-innotech.vercel.app',
    siteName: 'InnoTech Solutions',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InnoTech Solutions - Agentes Conversacionales Especializados para PyMEs',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InnoTech Solutions - Netflix de Agentes Conversacionales',
    description:
      'Agentes de IA especializados para emprendedores y PyMEs argentinas. Consultorías expertas instantáneas.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://agente-marketing-innotech.vercel.app',
  },
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
      <html lang='es-AR'>
        <head>
          {/* Favicon mejorado */}
          <link rel='icon' href='/favicon.ico' />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/apple-touch-icon.png'
          />

          {/* PWA */}
          <link rel='manifest' href='/manifest.json' />
          <meta name='theme-color' content='#3B82F6' />

          {/* Geo-targeting Argentina */}
          <meta name='geo.region' content='AR-C' />
          <meta name='geo.placename' content='Buenos Aires' />

          {/* Performance hints */}
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://api.anthropic.com' />
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
