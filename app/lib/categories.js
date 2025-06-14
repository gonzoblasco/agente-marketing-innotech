// app/lib/categories.js
export const CATEGORIES = {
  Marketing: {
    color: '#3B82F6', // blue-500
    gradient: 'from-blue-500 to-blue-700',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300',
    icon: '🎯',
    description:
      'Estrategias de marketing digital, redes sociales y publicidad',
  },
  Productividad: {
    color: '#10B981', // green-500
    gradient: 'from-green-500 to-green-700',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    borderClass: 'border-green-300',
    icon: '⚡',
    description: 'Organización personal, gestión del tiempo y eficiencia',
  },
  Finanzas: {
    color: '#8B5CF6', // purple-500
    gradient: 'from-purple-500 to-purple-700',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-300',
    icon: '💰',
    description: 'Fundraising, inversiones y estrategias financieras',
  },
  Ventas: {
    color: '#EF4444', // red-500
    gradient: 'from-red-500 to-red-700',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    icon: '📈',
    description: 'Técnicas de venta, negociación y cierre de deals',
  },
  Legal: {
    color: '#6B7280', // gray-500
    gradient: 'from-gray-500 to-gray-700',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    borderClass: 'border-gray-300',
    icon: '⚖️',
    description: 'Aspectos legales, contratos y compliance',
  },
  Tecnología: {
    color: '#6366F1', // indigo-500
    gradient: 'from-indigo-500 to-indigo-700',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-800',
    borderClass: 'border-indigo-300',
    icon: '💻',
    description: 'Desarrollo, tech stack y soluciones tecnológicas',
  },
  'Recursos Humanos': {
    color: '#F59E0B', // yellow-500
    gradient: 'from-yellow-500 to-yellow-700',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-300',
    icon: '👥',
    description: 'Gestión de talento, cultura empresarial y liderazgo',
  },
  Creatividad: {
    color: '#EC4899', // pink-500
    gradient: 'from-pink-500 to-pink-700',
    bgClass: 'bg-pink-100',
    textClass: 'text-pink-800',
    borderClass: 'border-pink-300',
    icon: '🎨',
    description: 'Diseño gráfico, creación de contenido, branding y arte',
  },
  Profesionales: {
    color: '#F97316', // orange-500
    gradient: 'from-orange-500 to-orange-700',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-300',
    icon: '🔧',
    description:
      'Oficios especializados, servicios profesionales y consultoría técnica',
  },
  'Sin Categoría': {
    color: '#64748B', // slate-500
    gradient: 'from-slate-500 to-slate-700',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-800',
    borderClass: 'border-slate-300',
    icon: '🤖',
    description: 'Agentes especializados sin categoría específica',
  },
};

// Función para obtener los estilos de una categoría
export function getCategoryStyles(category) {
  // Buscar la categoría exacta primero
  if (CATEGORIES[category]) {
    return CATEGORIES[category];
  }

  // Buscar coincidencia parcial (case insensitive)
  const categoryKey = Object.keys(CATEGORIES).find(
    (key) => key.toLowerCase() === category.toLowerCase()
  );

  if (categoryKey) {
    return CATEGORIES[categoryKey];
  }

  // Fallback a 'Sin Categoría'
  console.warn(`Categoría no encontrada: "${category}". Usando fallback.`);
  return CATEGORIES['Sin Categoría'];
}

// Función para obtener todas las categorías disponibles
export function getAllCategories() {
  return Object.keys(CATEGORIES);
}

// Función para obtener el color automático basado en categoría
export function getColorFromCategory(category) {
  const styles = getCategoryStyles(category);
  return {
    color: styles.color,
    gradient: styles.gradient,
  };
}

// Debug function para testing
export function debugCategory(category) {
  console.log('🔍 Debug categoría:', {
    input: category,
    found: getCategoryStyles(category),
    available: Object.keys(CATEGORIES),
  });
}
