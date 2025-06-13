'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PaymentPlans() {
  const { user } = useUser();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: 'pro',
      name: 'Plan Pro',
      price: 30000,
      priceFormatted: '$30.000',
      messages: '1.000 mensajes/mes',
      features: [
        'Acceso a todos los agentes',
        '1.000 mensajes por mes',
        'Sin publicidad',
        'Soporte por email',
      ],
      color: 'blue',
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      id: 'elite',
      name: 'Plan Elite',
      price: 60000,
      priceFormatted: '$60.000',
      messages: '2.000 mensajes/mes',
      features: [
        'Todo lo de Plan Pro',
        '2.000 mensajes por mes',
        'Agentes premium exclusivos',
        'Soporte prioritario',
        'Análisis personalizados',
      ],
      color: 'purple',
      gradient: 'from-purple-500 to-purple-700',
      popular: true,
    },
  ];

  const handleUpgrade = async (planId) => {
    if (!user) {
      alert('Necesitás iniciar sesión para actualizar tu plan');
      return;
    }

    try {
      setLoading(planId);

      console.log(`💳 Iniciando upgrade a plan ${planId}`);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando pago');
      }

      const data = await response.json();

      console.log('✅ Preferencia creada:', data.preference_id);

      // Redirigir a MercadoPago
      const paymentUrl =
        process.env.NODE_ENV === 'production'
          ? data.init_point
          : data.sandbox_init_point;

      console.log('🔄 Redirigiendo a:', paymentUrl);

      window.location.href = paymentUrl;
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className='max-w-6xl mx-auto px-4 py-12'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold text-gray-800 mb-4'>
          🚀 Actualizá tu Plan
        </h2>
        <p className='text-xl text-gray-600'>
          Desbloquea todo el potencial de InnoTech Solutions
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-xl border-2 overflow-hidden ${
              plan.popular ? 'border-purple-500 scale-105' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className='absolute top-0 left-0 right-0 bg-purple-500 text-white text-center py-2 font-semibold text-sm'>
                ⭐ MÁS POPULAR
              </div>
            )}

            <div
              className={`bg-gradient-to-r ${plan.gradient} p-6 text-white ${
                plan.popular ? 'pt-12' : ''
              }`}
            >
              <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
              <div className='mb-4'>
                <span className='text-4xl font-bold'>
                  {plan.priceFormatted}
                </span>
                <span className='text-lg opacity-80'> ARS/mes</span>
              </div>
              <p className='text-lg opacity-90'>{plan.messages}</p>
            </div>

            <div className='p-6'>
              <ul className='space-y-3 mb-8'>
                {plan.features.map((feature, index) => (
                  <li key={index} className='flex items-start'>
                    <span className='text-green-500 mr-3 mt-1'>✓</span>
                    <span className='text-gray-700'>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
                className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-all transform hover:scale-105`}
              >
                {loading === plan.id ? (
                  <div className='flex items-center justify-center'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                    Procesando...
                  </div>
                ) : (
                  `Actualizar a ${plan.name}`
                )}
              </button>

              <p className='text-xs text-gray-500 text-center mt-3'>
                💳 Pago procesado por MercadoPago
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='text-center mt-12 p-6 bg-gray-50 rounded-lg'>
        <h3 className='font-semibold text-gray-800 mb-2'>
          🔒 Pago 100% Seguro
        </h3>
        <p className='text-sm text-gray-600'>
          Procesado por MercadoPago • Podés cancelar cuando quieras •
          Facturación mensual
        </p>
      </div>
    </div>
  );
}
