// app/payment/pending/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentPending() {
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

    console.log('⏳ Pago pendiente:', { paymentId, status, merchantOrder });
  }, [searchParams]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <div className='mb-6'>
          <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-10 h-10 text-yellow-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>
            ⏳ Pago Pendiente
          </h1>
          <p className='text-gray-600'>
            Tu pago está siendo procesado. Te notificaremos cuando esté
            confirmado.
          </p>
        </div>

        {paymentData && paymentData.paymentId && (
          <div className='bg-yellow-50 rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-gray-800 mb-2'>Detalles:</h3>
            <div className='text-sm text-gray-600 space-y-1'>
              <p>
                <strong>ID:</strong> {paymentData.paymentId}
              </p>
              <p>
                <strong>Estado:</strong> {paymentData.status}
              </p>
            </div>
          </div>
        )}

        <div className='mb-6'>
          <p className='text-sm text-gray-600'>
            Los pagos pueden tardar hasta 24 horas en procesarse, dependiendo
            del método de pago utilizado.
          </p>
        </div>

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
          Recibirás un email cuando el pago sea confirmado
        </p>
      </div>
    </div>
  );
}
