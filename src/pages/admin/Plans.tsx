import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  CreditCard, Plus, Search, RefreshCw, Edit, Trash2, Check, X, Calendar, Star, Save, Clock, ArrowUpDown
} from 'lucide-react';
import { useAdminPlans, AdminPlan } from '../../hooks/useAdminPlans';
import { testPlansCreation, testSupabaseConnection } from '../../utils/testPlansCreation';

const Plans = () => {
  const { 
    plans, 
    loading, 
    error, 
    createPlan, 
    updatePlan, 
    deletePlan, 
    togglePlanStatus,
    fetchPlans,
    updateOrderPosition,
    // Estado de configuración
    isConfigured,
    isConfiguring,
    setupError,
    configureTable
  } = useAdminPlans();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingPlan, setEditingPlan] = useState<Partial<AdminPlan>>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    duration_days: 1,
    duration_hours: 24,
    features: [],
    benefits: [],
    is_active: true,
    is_popular: false,
    color: 'blue',
    paypal_link: ''
  });

  const [testingSystem, setTestingSystem] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const closeAllModals = () => {
    setActiveModal(null);
    setSelectedPlan(null);
    setEditingPlan({
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      duration_days: 1,
      duration_hours: 24,
      features: [],
      benefits: [],
      is_active: true,
      is_popular: false,
      color: 'blue',
      paypal_link: ''
    });
  };

  const handleAddPlan = () => {
    setEditingPlan({
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      duration_days: 1,
      duration_hours: 24,
      features: [],
      benefits: [],
      is_active: true,
      is_popular: false,
      color: 'blue',
      paypal_link: ''
    });
    setActiveModal('add');
  };

  const handleEditPlan = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    setEditingPlan(plan);
    setActiveModal('edit');
  };

  const handleDeletePlan = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    setActiveModal('delete');
  };

  const handleSavePlan = async () => {
    setIsSubmitting(true);
    
    try {
      // Preparar datos del plan
      const planData = { ...editingPlan };
      
      // Generar plan_key automáticamente si está vacío
      if (!planData.plan_key || planData.plan_key.trim() === '') {
        if (planData.name) {
          planData.plan_key = planData.name.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .substring(0, 50); // Limitar longitud
        } else {
          planData.plan_key = `plan_${Date.now()}`;
        }
      }
      
      if (activeModal === 'add') {
        await createPlan(planData);
        console.log('✅ Plan creado exitosamente');
        alert('Plan creado exitosamente');
      } else if (activeModal === 'edit' && selectedPlan) {
        await updatePlan(selectedPlan.id, planData);
        console.log('✅ Plan actualizado exitosamente');
        alert('Plan actualizado exitosamente');
      }
      
      closeAllModals();
    } catch (error) {
      console.error('❌ Error guardando plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;
    
    try {
      await deletePlan(selectedPlan.id);
      console.log('✅ Plan eliminado exitosamente');
      closeAllModals();
    } catch (error) {
      console.error('❌ Error eliminando plan:', error);
    }
  };

  const handleTestSystem = async () => {
    setTestingSystem(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Iniciando prueba del sistema de planes...');
      const result = await testPlansCreation();
      
      if (result.success) {
        setTestResult(`✅ ${result.message}`);
        console.log('✅ Prueba exitosa:', result.details);
      } else {
        setTestResult(`❌ ${result.message}`);
        console.error('❌ Prueba falló:', result.details);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTestResult(`❌ Error en prueba: ${errorMessage}`);
      console.error('❌ Error en prueba:', error);
    } finally {
      setTestingSystem(false);
      // Actualizar la lista de planes después de la prueba
      await fetchPlans();
    }
  };

  const handleTestConnection = async () => {
    setTestingSystem(true);
    setTestResult(null);
    
    try {
      console.log('🔌 Probando conexión con Supabase...');
      const result = await testSupabaseConnection();
      
      if (result.success) {
        setTestResult(`✅ ${result.message}`);
        console.log('✅ Conexión exitosa:', result.details);
      } else {
        setTestResult(`❌ ${result.message}`);
        console.error('❌ Error de conexión:', result.details);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTestResult(`❌ Error de conexión: ${errorMessage}`);
      console.error('❌ Error de conexión:', error);
    } finally {
      setTestingSystem(false);
    }
  };

  const filteredPlans = plans.filter((plan: AdminPlan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [ordering, setOrdering] = useState<Record<string, number>>({});

  const handleOrderBlur = async (plan: AdminPlan) => {
    const next = ordering[plan.id];
    if (typeof next !== 'number' || next <= 0) return;
    if (next === (plan.order_position ?? 0)) return;
    try {
      await updateOrderPosition(plan.id, next);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando planes...</span>
        </div>
      </div>
    );
  }

  // Componente de configuración automática
  const ConfigurationAlert = () => {
    if (isConfigured) return null;

    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">
                  {isConfiguring ? 'Configurando tabla de planes...' : 'Configuración requerida'}
                </h3>
                <p className="text-sm text-orange-600">
                  {isConfiguring 
                    ? 'Agregando columnas faltantes a la base de datos...' 
                    : 'La tabla de planes necesita configuración automática para funcionar correctamente.'
                  }
                </p>
                {setupError && (
                  <p className="text-sm text-red-600 mt-1">Error: {setupError}</p>
                )}
              </div>
            </div>
            {!isConfiguring && (
              <Button 
                onClick={configureTable}
                className="bg-orange-600 hover:bg-orange-700"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Configurar Ahora
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <ConfigurationAlert />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button onClick={fetchPlans} className="mt-2" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Alerta de configuración automática */}
      <ConfigurationAlert />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes de Suscripción</h1>
          <p className="text-gray-600">Gestiona los planes disponibles para los usuarios</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleTestConnection}
            variant="outline"
            size="sm"
            disabled={testingSystem}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {testingSystem ? 'Probando...' : 'Probar Conexión'}
          </Button>
          <Button 
            onClick={handleTestSystem}
            variant="outline"
            size="sm"
            disabled={testingSystem}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {testingSystem ? 'Probando...' : 'Probar Sistema'}
          </Button>
          <Button 
            onClick={handleAddPlan} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!isConfigured || isConfiguring}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isConfiguring ? 'Configurando...' : 'Agregar Plan'}
          </Button>
        </div>
      </div>

      {/* Resultado de pruebas */}
      {testResult && (
        <div className={`mb-4 p-3 rounded-lg ${
          testResult.includes('✅') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-medium">{testResult}</p>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={fetchPlans} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan: AdminPlan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <div className="flex gap-1">
                  {plan.is_active && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  )}
                  {plan.is_popular && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {plan.paypal_link && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      PayPal
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    ${plan.price} {plan.currency}
                  </span>
                  <div className="text-sm text-gray-500">
                    {plan.duration_days} día{plan.duration_days > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    min={1}
                    value={ordering[plan.id] ?? plan.order_position ?? ''}
                    onChange={(e) => setOrdering(prev => ({ ...prev, [plan.id]: parseInt(e.target.value) }))}
                    onBlur={() => handleOrderBlur(plan)}
                    placeholder="Posición"
                    className="w-24"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{plan.duration_days} días</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{plan.duration_hours} horas</span>
                  </div>
                </div>
                
                {plan.paypal_link && (
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <p className="text-blue-800 font-medium">PayPal configurado</p>
                    <p className="text-blue-600 truncate">{plan.paypal_link}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEditPlan(plan)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  onClick={() => togglePlanStatus(plan.id)}
                  variant="outline"
                  size="sm"
                  className={plan.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                >
                  {plan.is_active ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button
                  onClick={() => handleDeletePlan(plan)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron planes</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Plan Modal */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'add' ? 'Crear Nuevo Plan' : 'Editar Plan'}
              </h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <Input
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                    placeholder="Nombre del plan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clave del Plan *</label>
                  <Input
                    value={editingPlan.plan_key || ''}
                    onChange={(e) => setEditingPlan({...editingPlan, plan_key: e.target.value})}
                    placeholder="clave-del-plan"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                <textarea
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                  placeholder="Descripción del plan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Link de Pago PayPal (Opcional)
                  <span className="text-xs text-gray-500 ml-1">
                    Solo para planes nuevos - El usuario será redirigido a este link al hacer clic en "Comprar Plan"
                  </span>
                </label>
                <Input
                  value={editingPlan.paypal_link || ''}
                  onChange={(e) => setEditingPlan({...editingPlan, paypal_link: e.target.value})}
                  placeholder="https://paypal.me/tu-usuario/100"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: https://paypal.me/qrtourguide/100
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <Input
                    type="number"
                    value={editingPlan.price || 0}
                    onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio USD</label>
                  <Input
                    type="number"
                    value={editingPlan.price_usd || 0}
                    onChange={(e) => setEditingPlan({...editingPlan, price_usd: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
                  <Input
                    type="number"
                    value={editingPlan.discount_percentage || '0'}
                    onChange={(e) => setEditingPlan({...editingPlan, discount_percentage: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duración (días)</label>
                  <Input
                    type="number"
                    value={editingPlan.duration_days || 1}
                    onChange={(e) => setEditingPlan({...editingPlan, duration_days: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Créditos</label>
                  <Input
                    type="number"
                    value={editingPlan.credits || 0}
                    onChange={(e) => setEditingPlan({...editingPlan, credits: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.is_active ?? true}
                    onChange={(e) => setEditingPlan({...editingPlan, is_active: e.target.checked, active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Plan activo</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePlan} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : activeModal === 'edit' ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              <Button onClick={closeAllModals} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el plan "{selectedPlan.name}"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={closeAllModals} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
