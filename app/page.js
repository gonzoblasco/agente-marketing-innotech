import AgentGallery from './components/AgentGallery';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = {
  title: 'InnoTech Solutions - Netflix de Agentes Conversacionales para PyMEs',
  description:
    'Accedé a un catálogo de agentes de IA especializados para PyMEs, emprendedores y profesionales independientes argentinos.',
  openGraph: {
    title: 'InnoTech Solutions - Agentes de IA para PyMEs Argentinas',
    description:
      'Consultorías expertas instantáneas con agentes especializados en marketing, ventas, finanzas y legal para emprendedores argentinos.',
    images: ['/og-home.png'],
  },
};

export default function Home() {
  // Structured Data para Google
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'InnoTech Solutions',
    description:
      'La primera plataforma que permite acceder a un catálogo de agentes de IA especializados para emprendedores y PyMEs latinos.',
    url: 'https://agente-marketing-innotech.vercel.app',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    softwareVersion: '1.0',
    datePublished: '2024-12-01',
    author: {
      '@type': 'Person',
      name: 'Gonzalo Blasco',
      jobTitle: 'Founder & CEO',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Plan Lite',
        price: '0',
        priceCurrency: 'ARS',
        description: 'Acceso a 3 agentes básicos, 100 mensajes por mes',
      },
      {
        '@type': 'Offer',
        name: 'Plan Pro',
        price: '30000',
        priceCurrency: 'ARS',
        description: 'Catálogo completo de agentes, 1000 mensajes por mes',
      },
      {
        '@type': 'Offer',
        name: 'Plan Elite',
        price: '60000',
        priceCurrency: 'ARS',
        description:
          'Catálogo completo + agentes premium, 2000 mensajes por mes',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '47',
    },
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es InnoTech Solutions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'InnoTech Solutions es la primera plataforma que permite acceder a un catálogo de agentes de IA especializados, como un Netflix de consultorías expertas para emprendedores y PyMEs latinos.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo se diferencia de ChatGPT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mientras ChatGPT es generalista, nuestros agentes son especialistas con contexto específico de cada industria y conocimiento profundo del mercado argentino.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta usar la plataforma?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Plan Lite gratuito con 100 mensajes/mes, Plan Pro $30.000 ARS/mes con 1000 mensajes, Plan Elite $60.000 ARS/mes con 2000 mensajes y agentes premium.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'InnoTech Solutions',
            description:
              'Netflix de Agentes Conversacionales para PyMEs argentinas',
          }),
        }}
      />

      <main className='min-h-screen bg-gray-50'>
        {/* Header CORREGIDO - sin botones de auth duplicados */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-6xl mx-auto px-4 py-4 flex justify-between items-center'>
            <Link
              href='/'
              className='text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors'
            >
              🚀 InnoTech Solutions
            </Link>

            {/* REMOVED AUTH BUTTONS - Ya están manejados en AgentGallery */}
          </div>
        </div>

        <AgentGallery />
      </main>
    </>
  );
}
