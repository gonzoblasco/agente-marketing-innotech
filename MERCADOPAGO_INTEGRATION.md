# 💳 Integración MercadoPago - InnoTech Solutions

## 🇦🇷 ¿Por qué MercadoPago para Argentina?

### Ventajas para el mercado argentino:

- ✅ **Líder local:** 90%+ de adoption en e-commerce argentino
- ✅ **Confianza del usuario:** Marca reconocida y confiable
- ✅ **Métodos de pago locales:** Tarjetas argentinas, Mercado Crédito
- ✅ **Pesos argentinos nativos:** Sin conversión de divisas
- ✅ **Menor fricción:** Los usuarios ya tienen cuentas
- ✅ **Soporte local:** Documentación y support en español
- ✅ **Compliance local:** Cumple regulaciones argentinas

### vs Stripe:

- ❌ Stripe requiere conversión USD → ARS
- ❌ Menos conocido por usuarios finales argentinos
- ❌ Más fricciones en el checkout
- ❌ Fees más altos para mercado local

## 💰 Estructura de Precios Actualizada

### Precios en Pesos Argentinos:

- **Plan Lite:** Gratuito - 3 agentes básicos, 100 mensajes/mes
- **Plan Pro:** $30.000 ARS/mes - Catálogo completo, 1000 mensajes/mes
- **Plan Elite:** $60.000 ARS/mes - Agentes premium, 2000 mensajes/mes

### Equivalencias aproximadas (tipo de cambio fluctuante):

- Plan Pro: ~$25 USD
- Plan Elite: ~$50 USD

## 🛠️ Implementación Técnica

### SDK MercadoPago:

```bash
npm install mercadopago
```

### Endpoints necesarios:

- `/api/payments/create-subscription` - Crear suscripción
- `/api/payments/webhook` - Webhooks de MercadoPago
- `/api/payments/cancel-subscription` - Cancelar suscripción

### Variables de entorno:

```env
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_PUBLIC_KEY=your_public_key
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
```

## 🎯 Implementación por Fases

### Fase 1 (Día 2): MVP Básico

- [ ] Pagos únicos (no recurrentes)
- [ ] Upgrade manual de plan
- [ ] Verificación de pagos via webhook

### Fase 2 (Futuro): Suscripciones

- [ ] Suscripciones recurrentes automáticas
- [ ] Manejo de renovaciones
- [ ] Downgrades/upgrades automáticos

## 🔐 Consideraciones de Seguridad

- Usar access tokens en server-side únicamente
- Validar webhooks con signatures
- Almacenar mínima información de pago
- Cumplir con PCI compliance básico

## 📊 Métricas a Trackear

- Tasa de conversión Free → Pro
- Churn rate por plan
- Revenue mensual recurrente (MRR)
- Costo de adquisición por usuario (CAC)

## 🚀 Ventaja Competitiva

Al usar MercadoPago estamos:

- Reduciendo fricción para usuarios argentinos
- Mostrando que entendemos el mercado local
- Facilitando la conversión de usuarios
- Construyendo confianza desde el pricing

Esta decisión refuerza nuestro posicionamiento como "la plataforma argentina para emprendedores argentinos".
