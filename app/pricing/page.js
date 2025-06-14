import PricingClient from './PricingClient'; // Importa el nuevo componente cliente

// page.js ahora es un Server Component y puede exportar metadata
export const metadata = {
  title: 'Precios - Planes para Emprendedores y PyMEs Argentinas',
  description:
    'Elegí el plan perfecto para tu negocio. Plan Lite gratuito, Plan Pro $30.000/mes, Plan Elite $60.000/mes. Agentes especializados para hacer crecer tu PyME.',
  openGraph: {
    title: 'Precios InnoTech Solutions - Planes para PyMEs Argentinas',
    description:
      'Plan Lite gratuito con 100 mensajes, Plan Pro $30.000/mes con 1000 mensajes, Plan Elite $60.000/mes con agentes premium.',
    images: ['/og-pricing.png'],
  },
  keywords: [
    'precios agentes IA',
    'planes PyMEs Argentina',
    'consultorías IA precio',
    'suscripción agentes conversacionales',
    'MercadoPago Argentina',
  ],
};

export default function PricingPage() {
  // Renderiza el componente cliente que contiene la lógica interactiva
  return <PricingClient />;
}
