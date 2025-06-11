# 🚀 InnoTech Solutions - Netflix de Agentes Conversacionales

**La primera plataforma que permite acceder a un catálogo de agentes de IA especializados para resolver problemas específicos de emprendedores y PyMEs latinos.**

## 🎯 Propuesta de Valor

Una plataforma SaaS donde accedés a **agentes conversacionales especializados**:

- **Catálogo de expertos virtuales** - Elegís el agente ideal para tu necesidad
- **Conversaciones especializadas** - Cada agente tiene contexto y personalidad única
- **Continuidad de sesión** - Exportá el contexto para retomar conversaciones
- **Especialización profunda** - Cada agente domina su área como un experto real

## 🤖 Agentes Disponibles (MVP)

### 🎯 Consultor de Marketing Digital

- **Especialidad:** PyMEs argentinas
- **Expertise:** Redes sociales, Google/Facebook Ads, email marketing, WhatsApp Business
- **Personalidad:** Práctico, directo, empático con limitaciones de presupuesto

### ⚡ Mentor de Productividad

- **Especialidad:** Emprendedores overwhelmed
- **Expertise:** Gestión del tiempo, sistemas de organización, anti-procrastinación
- **Personalidad:** Comprensivo pero firme, orientado a soluciones prácticas

### 💰 Estratega de Fundraising

- **Especialidad:** Levantamiento de capital en LATAM
- **Expertise:** Pitch decks, valuaciones, término sheets, networking con inversores
- **Personalidad:** Estratégico, analítico, conoce el ecosistema regional

### 🎯 Coach de Ventas B2B

- **Especialidad:** Mercado enterprise argentino
- **Expertise:** Prospección, negociación, cierre de deals, CRM
- **Personalidad:** Orientado a resultados, entiende la cultura empresarial local

### ⚖️ Asesor Legal para Startups

- **Especialidad:** Derecho empresarial argentino
- **Expertise:** Sociedades, contratos, propiedad intelectual, compliance
- **Personalidad:** Preciso pero comprensible, traduce legalese a lenguaje simple

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **AI API:** Claude Sonnet 4 (Anthropic)
- **Deployment:** Vercel
- **Markdown:** marked.js para renderizado de respuestas

### Estructura del Proyecto

```
app/
├── api/
│   └── chat/
│       └── route.js           # API endpoint multi-agente
├── chat/
│   └── [agentId]/
│       └── page.js            # Páginas dinámicas por agente
├── components/
│   ├── AgentGallery.js        # Galería principal de agentes
│   ├── AgentHeader.js         # Header específico por agente
│   ├── ChatInterface.js       # Interfaz de chat universal
│   └── FormattedMessage.js    # Renderizador de markdown
├── data/
│   └── agents.js              # Configuración de todos los agentes
├── globals.css                # Estilos globales + markdown
├── layout.js                  # Layout y metadata global
└── page.js                    # Página principal (galería)
```

### Configuración de Agentes

Cada agente se define en `app/data/agents.js` con:

- **Identificación:** ID único, nombre, título, emoji
- **Branding:** Colores y gradientes específicos
- **Personalidad:** System prompt detallado
- **UX:** Mensaje de bienvenida personalizado

## 🚀 Guía de Desarrollo

### Instalación

```bash
# Clonar repositorio
git clone [tu-repo-url]
cd agente-marketing-innotech

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Agregar tu CLAUDE_API_KEY en .env.local

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

```env
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### URLs del MVP

- **Galería:** `/`
- **Marketing:** `/chat/marketing-digital`
- **Productividad:** `/chat/mentor-productividad`
- **Fundraising:** `/chat/estratega-fundraising`
- **Ventas:** `/chat/coach-ventas`
- **Legal:** `/chat/asesor-legal`

## 📊 Estado Actual del Proyecto

### ✅ Completado (Día 1)

- [x] Arquitectura multi-agente funcionando
- [x] 5 agentes especializados con personalidades únicas
- [x] Galería visual para selección de agentes
- [x] Routing dinámico `/chat/[agentId]`
- [x] API integrada con Claude Sonnet 4
- [x] Renderizado de markdown en respuestas
- [x] UI responsive con branding por agente
- [x] SEO optimizado para cada página
- [x] Deploy en producción (Vercel)

### 🎯 Próximo (Día 2)

- [ ] Sistema de usuarios y autenticación
- [ ] Persistencia de conversaciones en base de datos
- [ ] Contador de mensajes por usuario
- [ ] Sistema de planes y monetización con MercadoPago
- [ ] Exportar/importar contexto de conversaciones
- [ ] Dashboard de usuario
- [ ] Métricas y analytics

### 🔮 Futuro (Días 3+)

- [ ] Más agentes especializados
- [ ] Integración completa con MercadoPago (suscripciones recurrentes)
- [ ] API pública para terceros
- [ ] Mobile app (React Native)
- [ ] Agentes con memoria a largo plazo
- [ ] Integración con herramientas empresariales

## 🛠️ Cómo Agregar un Nuevo Agente

1. **Agregar configuración en `app/data/agents.js`:**

```javascript
'nuevo-agente': {
  id: 'nuevo-agente',
  name: 'Nombre del Agente',
  title: 'Especialidad breve',
  emoji: '🎨',
  description: 'Descripción de qué hace el agente...',
  color: 'indigo',
  gradient: 'from-indigo-500 to-indigo-700',
  systemPrompt: `Prompt detallado del agente...`,
  welcomeMessage: 'Mensaje de bienvenida...'
}
```

2. **El agente estará automáticamente disponible en:**
   - Galería principal: card visual
   - URL: `/chat/nuevo-agente`
   - API: endpoint `/api/chat` con `agentId: 'nuevo-agente'`

## 🎨 Personalización de UI

### Colores por Agente

- **Marketing:** Azul (`blue`, `from-blue-500 to-blue-700`)
- **Productividad:** Verde (`green`, `from-green-500 to-green-700`)
- **Fundraising:** Púrpura (`purple`, `from-purple-500 to-purple-700`)
- **Ventas:** Rojo (`red`, `from-red-500 to-red-700`)
- **Legal:** Gris (`gray`, `from-gray-500 to-gray-700`)

### Responsive Design

- **Mobile:** 1 columna en galería
- **Tablet:** 2 columnas en galería
- **Desktop:** 3 columnas en galería

## 🔧 Troubleshooting

### Error: API Key no funciona

```bash
# Verificar que la variable esté configurada
echo $CLAUDE_API_KEY

# En Vercel, verificar Environment Variables
# Settings → Environment Variables → CLAUDE_API_KEY
```

### Error: Agente no encontrado

- Verificar que el `agentId` en la URL coincida con las keys en `AGENTS`
- URLs válidas: `/chat/marketing-digital`, `/chat/mentor-productividad`, etc.

### Error: Markdown no se renderiza

- Verificar que `marked` esté instalado: `npm install marked`
- Verificar import en `FormattedMessage.js`

## 📈 Métricas de Desarrollo (Día 1)

- **Tiempo total:** ~4 horas
- **Archivos creados:** 8
- **Agentes funcionales:** 5
- **Lines of code:** ~800
- **Funcionalidades core:** 100% completadas

## 🌟 Demo en Vivo

**URL:** https://agente-marketing-innotech.vercel.app

Probá cada agente con preguntas específicas:

- Marketing: _"Tengo una panadería, ¿cómo empiezo con redes sociales?"_
- Productividad: _"Me siento overwhelmed con mil tareas"_
- Fundraising: _"Quiero levantar mi primera ronda de 100k USD"_
- Ventas: _"¿Cómo prospecto empresas grandes por LinkedIn?"_
- Legal: _"¿Qué tipo de sociedad me conviene para mi startup?"_

## 🤝 Contribución

Este es un MVP en desarrollo activo. Para contribuir:

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

Proyecto privado - InnoTech Solutions © 2025

## 👨‍💻 Autor

**Gonzalo Blasco** - Fundador de InnoTech Solutions  
Emprendedor y consultor en IA aplicada, Buenos Aires, Argentina.

---

_Documentación actualizada: Día 1 completado - Día 2 por comenzar_
