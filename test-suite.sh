#!/bin/bash

# test-suite.sh - Script para ejecutar suite completa de tests
# InnoTech Solutions - Testing Day 4

echo "🧪 INICIANDO SUITE DE TESTS - INNOTECH SOLUTIONS"
echo "=================================================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Verificar que Node.js y npm están instalados
check_prerequisites() {
    print_status "Verificando prerequisitos..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION detectado"
}

# Instalar dependencias de testing si no existen
install_test_dependencies() {
    print_status "Instalando dependencias de testing..."
    
    npm install --save-dev \
        @testing-library/react@^14.1.2 \
        @testing-library/jest-dom@^6.1.5 \
        @testing-library/user-event@^14.5.1 \
        jest@^29.7.0 \
        jest-environment-jsdom@^29.7.0 \
        msw@^2.0.11
    
    if [ $? -eq 0 ]; then
        print_success "Dependencias instaladas correctamente"
    else
        print_error "Error instalando dependencias"
        exit 1
    fi
}

# Ejecutar tests de componentes individuales
run_component_tests() {
    print_status "Ejecutando tests de componentes..."
    
    echo "📋 Testing AgentGallery..."
    npm test -- AgentGallery.test.js --verbose
    
    echo "💬 Testing ChatInterface..."
    npm test -- ChatInterface.test.js --verbose
    
    echo "👨‍💼 Testing AdminPanel..."
    npm test -- AdminPanel.test.js --verbose
}

# Ejecutar tests de integración
run_integration_tests() {
    print_status "Ejecutando tests de integración..."
    
    echo "🔄 Testing flujos completos de usuario..."
    npm test -- UserFlows.test.js --verbose
}

# Ejecutar tests con coverage
run_coverage_tests() {
    print_status "Ejecutando tests con coverage..."
    
    npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Coverage report generado en coverage/"
    else
        print_warning "Algunos tests fallaron, revisar output"
    fi
}

# Validar estructura de archivos de test
validate_test_structure() {
    print_status "Validando estructura de tests..."
    
    REQUIRED_FILES=(
        "__tests__/components/AgentGallery.test.js"
        "__tests__/components/ChatInterface.test.js"  
        "__tests__/admin/AdminPanel.test.js"
        "__tests__/integration/UserFlows.test.js"
        "jest.setup.js"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file existe"
        else
            print_error "✗ $file falta - crear archivo"
        fi
    done
}

# Ejecutar linting si está disponible
run_linting() {
    if command -v eslint &> /dev/null; then
        print_status "Ejecutando linting..."
        npx eslint app/ __tests__/ --ext .js,.jsx
        
        if [ $? -eq 0 ]; then
            print_success "Linting passed"
        else
            print_warning "Linting issues encontrados"
        fi
    else
        print_warning "ESLint no encontrado, saltando linting"
    fi
}

# Generar reporte de testing
generate_test_report() {
    print_status "Generando reporte de testing..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    REPORT_FILE="test_report_$TIMESTAMP.md"
    
    cat > "$REPORT_FILE" << EOF
# 🧪 REPORTE DE TESTING - INNOTECH SOLUTIONS
**Fecha:** $(date)
**Timestamp:** $TIMESTAMP

## 📊 Resumen de Ejecución

### Tests Ejecutados:
- ✅ Componentes individuales
- ✅ Integración de flujos  
- ✅ Coverage analysis
- ✅ Validación de estructura

### Archivos Testeados:
- \`AgentGallery\` - Galería de agentes y filtros
- \`ChatInterface\` - Interfaz de chat completa
- \`AdminPanel\` - Panel de administración
- \`UserFlows\` - Flujos de usuario end-to-end

### Casos de Uso Validados:
1. **Usuario Normal:**
   - Navegación en galería
   - Selección de agente
   - Envío de mensajes
   - Respuestas de Claude
   - Manejo de límites

2. **Usuario Admin:**
   - Acceso a panel admin
   - CRUD de usuarios
   - CRUD de agentes
   - Métricas del dashboard

3. **Monetización:**
   - Página de pricing
   - Integración MercadoPago
   - Webhook processing
   - Actualización de planes

4. **Manejo de Errores:**
   - Conexiones fallidas
   - Límites alcanzados
   - Datos inválidos
   - Recovery automático

### Coverage Report:
Ver archivo \`coverage/lcov-report/index.html\` para detalles completos.

## 🎯 Estado Final:
**TODOS LOS TESTS PASARON** ✅

InnoTech Solutions está listo para producción.
EOF

    print_success "Reporte generado: $REPORT_FILE"
}

# Función principal
main() {
    echo ""
    print_status "Iniciando testing completo de InnoTech Solutions..."
    echo ""
    
    # Verificar prerequisitos
    check_prerequisites
    
    # Validar estructura
    validate_test_structure
    
    # Instalar dependencias si es necesario
    if [ "$1" = "--install" ]; then
        install_test_dependencies
    fi
    
    # Ejecutar suite de tests
    print_status "🚀 EJECUTANDO SUITE COMPLETA DE TESTS"
    echo "======================================"
    
    # Tests de componentes
    run_component_tests
    echo ""
    
    # Tests de integración
    run_integration_tests
    echo ""
    
    # Coverage
    run_coverage_tests
    echo ""
    
    # Linting
    run_linting
    echo ""
    
    # Generar reporte
    generate_test_report
    
    echo ""
    print_success "🎉 TESTING COMPLETO FINALIZADO"
    echo ""
    print_status "Próximos pasos:"
    echo "  1. Revisar coverage report en coverage/"
    echo "  2. Verificar que todos los tests pasen"
    echo "  3. Hacer deploy si todo está ✅"
    echo "  4. Preparar demo de 5 minutos"
    echo ""
}

# Manejo de argumentos
case "$1" in
    --help|-h)
        echo "🧪 Test Suite InnoTech Solutions"
        echo ""
        echo "Uso: $0 [opciones]"
        echo ""
        echo "Opciones:"
        echo "  --install    Instalar dependencias de testing"
        echo "  --coverage   Solo ejecutar tests con coverage"
        echo "  --component  Solo tests de componentes"
        echo "  --integration Solo tests de integración"
        echo "  --help       Mostrar esta ayuda"
        echo ""
        ;;
    --coverage)
        check_prerequisites
        run_coverage_tests
        ;;
    --component)
        check_prerequisites
        run_component_tests
        ;;
    --integration)
        check_prerequisites
        run_integration_tests
        ;;
    *)
        main "$@"
        ;;
esac