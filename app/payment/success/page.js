// app/payment/success/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Componente que usa useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Obtener parámetros de MercadoPago
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const merchantOrder = searchParams.get('merchant_order_id');

    setPaymentData({
      paymentId,
      status,
      merchantOrder,
    });

    console.log('✅ Pago exitoso:', { paymentId, status, merchantOrder });
  }, [searchParams]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <div className='mb-6'>
          <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-10 h-10 text-green-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>
            🎉 ¡Pago Exitoso!
          </h1>
          <p className='text-gray-600'>
            Tu plan ha sido actualizado correctamente
          </p>
        </div>

        {paymentData && (
          <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-800 mb-2'>
              Detalles del pago:
            </h3>
            <div className='text-sm text-gray-600 space-y-1'>
              <p>
                <strong>ID:</strong> {paymentData.paymentId}
              </p>
              <p>
                <strong>Estado:</strong> {paymentData.status}
              </p>
              {paymentData.merchantOrder && (
                <p>
                  <strong>Orden:</strong> {paymentData.merchantOrder}
                </p>
              )}
            </div>
          </div>
        )}

        <div className='space-y-3'>
          <Link
            href='/dashboard'
            className='block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
          >
            Ver mi Dashboard
          </Link>

          <Link
            href='/'
            className='block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors'
          >
            Volver al inicio
          </Link>
        </div>

        <p className='text-xs text-gray-500 mt-6'>
          Recibirás un email de confirmación en unos minutos
        </p>
      </div>
    </div>
  );
}

// Loading fallback
function PaymentSuccessLoading() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
        <p className='text-gray-600'>Cargando información del pago...</p>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
