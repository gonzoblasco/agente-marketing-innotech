'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

// Componente LoadingButton con Font Awesome
function LoadingButton({ loading, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${className} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center`}
    >
      {loading ? (
        <>
          <i className='fas fa-spinner fa-spin mr-2'></i>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Componente ErrorMessage con Font Awesome
function ErrorMessage({ error, onRetry }) {
  const getErrorInfo = (error) => {
    if (error.includes('limit') || error.includes('límite')) {
      return {
        icon: 'fas fa-chart-line',
        title: 'Límite alcanzado',
        message:
          'Has usado todos tus mensajes del mes. ¡Actualiza tu plan para continuar!',
        buttonText: 'Ver Planes',
        buttonAction: () => window.location.reload(),
      };
    }

    if (error.includes('payment') || error.includes('pago')) {
      return {
        icon: 'fas fa-credit-card',
        title: 'Error de pago',
        message:
          'Hubo un problema procesando tu pago. Por favor, intentá nuevamente.',
        buttonText: 'Reintentar',
        buttonAction: onRetry,
      };
    }

    return {
      icon: 'fas fa-exclamation-triangle',
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
        <div className='text-2xl mr-3 text-red-500'>
          <i className={errorInfo.icon}></i>
        </div>
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
            <i className='fas fa-redo mr-2'></i>
            {errorInfo.buttonText}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

// Componente principal PaymentPlans
export default function PaymentPlans() {
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
      icon: 'fas fa-rocket',
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
      icon: 'fas fa-crown',
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

      // Mostrar feedback de éxito con Font Awesome
      const successDiv = document.createElement('div');
      successDiv.className =
        'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
      successDiv.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        Redirigiendo a MercadoPago...
      `;
      document.body.appendChild(successDiv);

      // Redirigir después de un breve delay
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
    <div className='min-h-screen bg-gray-50'>
      {/* Header navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <a
              href='/'
              className='text-blue-600 hover:text-blue-700 transition-colors flex items-center'
            >
              <i className='fas fa-arrow-left mr-2'></i>
              Volver a Galería
            </a>
            <h1 className='text-2xl font-bold text-gray-800'>
              <i className='fas fa-tags mr-2 text-blue-600'></i>
              Planes y Precios
            </h1>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-12'>
        {/* Header principal */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-800 mb-4'>
            <i className='fas fa-rocket mr-3 text-blue-600'></i>
            Actualizá tu Plan
          </h2>
          <p className='text-xl text-gray-600'>
            Desbloquea todo el potencial de InnoTech Solutions
          </p>
        </div>

        {/* Mostrar error si existe */}
        {error && <ErrorMessage error={error} onRetry={() => setError(null)} />}

        {/* Grid de planes */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-purple-500' : 'border-gray-200'
              }`}
            >
              {/* Badge "Más Popular" */}
              {plan.popular && (
                <div className='absolute top-0 left-0 right-0 bg-purple-500 text-white text-center py-2 font-semibold text-sm'>
                  <i className='fas fa-star mr-2'></i>
                  MÁS POPULAR
                </div>
              )}

              {/* Header del plan con gradiente */}
              <div
                className={`bg-gradient-to-r ${plan.gradient} p-6 text-white ${
                  plan.popular ? 'pt-12' : ''
                }`}
              >
                <div className='flex items-center justify-center mb-4'>
                  <i className={`${plan.icon} text-4xl`}></i>
                </div>
                <h3 className='text-2xl font-bold mb-2 text-center'>
                  {plan.name}
                </h3>
                <div className='text-center mb-4'>
                  <span className='text-4xl font-bold'>
                    {plan.priceFormatted}
                  </span>
                  <span className='text-lg opacity-80'> ARS/mes</span>
                </div>
                <p className='text-lg opacity-90 text-center'>
                  <i className='fas fa-comments mr-2'></i>
                  {plan.messages}
                </p>
              </div>

              {/* Contenido del plan */}
              <div className='p-6'>
                {/* Lista de características */}
                <ul className='space-y-3 mb-8'>
                  {plan.features.map((feature, index) => (
                    <li key={index} className='flex items-start'>
                      <span className='text-green-500 mr-3 mt-1'>
                        <i className='fas fa-check'></i>
                      </span>
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Botón de upgrade */}
                <LoadingButton
                  loading={loading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl`}
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

                {/* Footer del plan */}
                <p className='text-xs text-gray-500 text-center mt-3'>
                  <i className='fas fa-shield-alt mr-1'></i>
                  Pago procesado por MercadoPago
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer de seguridad */}
        <div className='text-center mt-12 p-6 bg-gray-50 rounded-lg'>
          <h3 className='font-semibold text-gray-800 mb-2'>
            <i className='fas fa-lock mr-2 text-green-600'></i>
            Pago 100% Seguro
          </h3>
          <div className='flex items-center justify-center space-x-6 text-sm text-gray-600'>
            <span>
              <i className='fas fa-credit-card mr-1'></i>
              Procesado por MercadoPago
            </span>
            <span>
              <i className='fas fa-times-circle mr-1'></i>
              Podés cancelar cuando quieras
            </span>
            <span>
              <i className='fas fa-calendar-alt mr-1'></i>
              Facturación mensual
            </span>
          </div>
        </div>

        {/* Sección de comparación */}
        <div className='mt-16'>
          <h3 className='text-2xl font-bold text-center text-gray-800 mb-8'>
            <i className='fas fa-balance-scale mr-3 text-blue-600'></i>
            ¿Qué plan te conviene?
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Plan Lite (Gratuito) */}
            <div className='bg-white p-6 rounded-lg border border-gray-200'>
              <div className='text-center mb-4'>
                <i className='fas fa-gift text-3xl text-gray-500 mb-2'></i>
                <h4 className='font-semibold text-gray-800'>Plan Lite</h4>
                <p className='text-green-600 font-bold'>GRATUITO</p>
              </div>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>3 agentes
                  básicos
                </li>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>100
                  mensajes/mes
                </li>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>Perfecto
                  para probar
                </li>
              </ul>
            </div>

            {/* Plan Pro */}
            <div className='bg-blue-50 p-6 rounded-lg border border-blue-200'>
              <div className='text-center mb-4'>
                <i className='fas fa-rocket text-3xl text-blue-600 mb-2'></i>
                <h4 className='font-semibold text-gray-800'>Plan Pro</h4>
                <p className='text-blue-600 font-bold'>Para emprendedores</p>
              </div>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>Todos los
                  agentes
                </li>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>1.000
                  mensajes/mes
                </li>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>Ideal para
                  PyMEs
                </li>
              </ul>
            </div>

            {/* Plan Elite */}
            <div className='bg-purple-50 p-6 rounded-lg border border-purple-200'>
              <div className='text-center mb-4'>
                <i className='fas fa-crown text-3xl text-purple-600 mb-2'></i>
                <h4 className='font-semibold text-gray-800'>Plan Elite</h4>
                <p className='text-purple-600 font-bold'>Para empresas</p>
              </div>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>Agentes
                  premium
                </li>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>2.000
                  mensajes/mes
                </li>
                <li>
                  <i className='fas fa-check text-green-500 mr-2'></i>Soporte
                  prioritario
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className='mt-16 bg-white p-6 rounded-lg shadow-sm'>
          <h3 className='text-xl font-bold text-center text-gray-800 mb-6'>
            <i className='fas fa-question-circle mr-2 text-blue-600'></i>
            Preguntas Frecuentes
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-semibold text-gray-800 mb-2'>
                <i className='fas fa-money-bill-wave mr-2 text-green-600'></i>
                ¿Puedo cambiar de plan?
              </h4>
              <p className='text-sm text-gray-600'>
                Sí, podés actualizar o degradar tu plan en cualquier momento
                desde tu dashboard.
              </p>
            </div>

            <div>
              <h4 className='font-semibold text-gray-800 mb-2'>
                <i className='fas fa-calendar-times mr-2 text-red-600'></i>
                ¿Puedo cancelar cuando quiera?
              </h4>
              <p className='text-sm text-gray-600'>
                Por supuesto. No hay permanencia mínima y podés cancelar desde
                tu cuenta.
              </p>
            </div>

            <div>
              <h4 className='font-semibold text-gray-800 mb-2'>
                <i className='fas fa-redo mr-2 text-blue-600'></i>
                ¿Los mensajes se renuevan?
              </h4>
              <p className='text-sm text-gray-600'>
                Sí, cada mes tu contador de mensajes se resetea automáticamente.
              </p>
            </div>

            <div>
              <h4 className='font-semibold text-gray-800 mb-2'>
                <i className='fas fa-headset mr-2 text-purple-600'></i>
                ¿Hay soporte técnico?
              </h4>
              <p className='text-sm text-gray-600'>
                Sí, todos los planes incluyen soporte por email. Elite tiene
                soporte prioritario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
