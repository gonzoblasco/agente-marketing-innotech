// app/lib/categories.js
export const CATEGORIES = {
  Marketing: {
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300',
    icon: '🎯',
    description:
      'Estrategias de marketing digital, redes sociales y publicidad',
  },
  Productividad: {
    color: 'green',
    gradient: 'from-green-500 to-green-700',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    borderClass: 'border-green-300',
    icon: '⚡',
    description: 'Organización personal, gestión del tiempo y eficiencia',
  },
  Finanzas: {
    color: 'purple',
    gradient: 'from-purple-500 to-purple-700',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-300',
    icon: '💰',
    description: 'Fundraising, inversiones y estrategias financieras',
  },
  Ventas: {
    color: 'red',
    gradient: 'from-red-500 to-red-700',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    icon: '📈',
    description: 'Técnicas de venta, negociación y cierre de deals',
  },
  Legal: {
    color: 'gray',
    gradient: 'from-gray-500 to-gray-700',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    borderClass: 'border-gray-300',
    icon: '⚖️',
    description: 'Aspectos legales, contratos y compliance',
  },
  Tecnología: {
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-700',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-800',
    borderClass: 'border-indigo-300',
    icon: '💻',
    description: 'Desarrollo, tech stack y soluciones tecnológicas',
  },
  'Recursos Humanos': {
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-700',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-300',
    icon: '👥',
    description: 'Gestión de talento, cultura empresarial y liderazgo',
  },
  Creatividad: {
    color: 'pink',
    gradient: 'from-pink-500 to-pink-700',
    bgClass: 'bg-pink-100',
    textClass: 'text-pink-800',
    borderClass: 'border-pink-300',
    icon: '🎨',
    description: 'Diseño gráfico, creación de contenido, branding y arte',
  },
  Profesionales: {
    color: 'orange',
    gradient: 'from-orange-500 to-orange-700',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-300',
    icon: '🔧',
    description:
      'Oficios especializados, servicios profesionales y consultoría técnica',
  },
  'Sin Categoría': {
    color: 'slate',
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
  const cat = CATEGORIES[category] || CATEGORIES['Sin Categoría'];
  return cat;
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
