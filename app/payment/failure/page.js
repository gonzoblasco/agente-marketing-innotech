// app/payment/failure/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const merchantOrder = searchParams.get('merchant_order_id');

    setPaymentData({
      paymentId,
      status,
      merchantOrder,
    });

    console.log('❌ Pago fallido:', { paymentId, status, merchantOrder });
  }, [searchParams]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <div className='mb-6'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-10 h-10 text-red-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>
            ❌ Pago No Procesado
          </h1>
          <p className='text-gray-600'>
            Hubo un problema con tu pago. No te preocupes, no se realizó ningún
            cargo.
          </p>
        </div>

        {paymentData && paymentData.status && (
          <div className='bg-red-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-800 mb-2'>Detalles:</h3>
            <div className='text-sm text-gray-600 space-y-1'>
              <p>
                <strong>Estado:</strong> {paymentData.status}
              </p>
              {paymentData.paymentId && (
                <p>
                  <strong>ID:</strong> {paymentData.paymentId}
                </p>
              )}
            </div>
          </div>
        )}

        <div className='mb-6'>
          <h3 className='font-semibold text-gray-800 mb-2'>
            ¿Qué podés hacer?
          </h3>
          <ul className='text-sm text-gray-600 text-left space-y-1'>
            <li>• Verificar los datos de tu tarjeta</li>
            <li>• Asegurate de tener fondos suficientes</li>
            <li>• Intentar con otro método de pago</li>
            <li>• Contactar a tu banco si persiste</li>
          </ul>
        </div>

        <div className='space-y-3'>
          <Link
            href='/pricing'
            className='block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
          >
            Intentar nuevamente
          </Link>

          <Link
            href='/'
            className='block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors'
          >
            Volver al inicio
          </Link>
        </div>

        <p className='text-xs text-gray-500 mt-6'>
          Si necesitás ayuda, contactanos a soporte@innotech.com
        </p>
      </div>
    </div>
  );
}
