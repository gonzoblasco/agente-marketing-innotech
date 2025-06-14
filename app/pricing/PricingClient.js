'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

// Componente LoadingButton
function LoadingButton({ loading, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${className} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center`}
    >
      {loading ? (
        <>
          <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Componente ErrorMessage
function ErrorMessage({ error, onRetry }) {
  const getErrorInfo = (error) => {
    if (error.includes('limit') || error.includes('límite')) {
      return {
        icon: '📊',
        title: 'Límite alcanzado',
        message:
          'Has usado todos tus mensajes del mes. ¡Actualiza tu plan para continuar!',
        buttonText: 'Ver Planes',
        buttonAction: () => window.location.reload(),
      };
    }

    if (error.includes('payment') || error.includes('pago')) {
      return {
        icon: '💳',
        title: 'Error de pago',
        message:
          'Hubo un problema procesando tu pago. Por favor, intentá nuevamente.',
        buttonText: 'Reintentar',
        buttonAction: onRetry,
      };
    }

    return {
      icon: '⚠️',
      title: 'Error inesperado',
      message: 'Algo salió mal. Nuestro equipo ya fue notificado.',
      buttonText: 'Reintentar',
      buttonAction: onRetry,
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className='bg-red-50 border border-red-200 rounded-lg p-4 my-4'>
      <div className='flex items-start'>
        <div className='text-2xl mr-3'>{errorInfo.icon}</div>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-red-800 mb-1'>
            {errorInfo.title}
          </h3>
          <p className='text-sm text-red-700 mb-3'>{errorInfo.message}</p>
          <LoadingButton
            loading={false}
            onClick={errorInfo.buttonAction}
            className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm'
          >
            {errorInfo.buttonText}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default function PricingClient() {
  const { user } = useUser();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

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
      setError(null);

      console.log(`💳 Iniciando upgrade a plan ${planId}`);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando pago');
      }

      const data = await response.json();
      console.log('✅ Preferencia creada:', data.preference_id);

      const successDiv = document.createElement('div');
      successDiv.className =
        'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      successDiv.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        Redirigiendo a MercadoPago...
      `;
      document.body.appendChild(successDiv);

      setTimeout(() => {
        const paymentUrl =
          process.env.NODE_ENV === 'production'
            ? data.init_point
            : data.sandbox_init_point;
        window.location.href = paymentUrl;
      }, 1500);
    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message);
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

      {error && <ErrorMessage error={error} onRetry={() => setError(null)} />}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
              plan.popular ? 'border-purple-500' : 'border-gray-200'
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
                    <span className='text-green-500 mr-3 mt-1 text-lg'>✓</span>
                    <span className='text-gray-700'>{feature}</span>
                  </li>
                ))}
              </ul>

              <LoadingButton
                loading={loading === plan.id}
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-4 px-6 rounded-xl font-semibold text-lg`}
              >
                {loading === plan.id ? (
                  <>
                    <i className='fas fa-spinner fa-spin mr-2'></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className='fas fa-credit-card mr-2'></i>
                    Actualizar a {plan.name}
                  </>
                )}
              </LoadingButton>

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
