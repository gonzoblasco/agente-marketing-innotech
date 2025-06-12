'use client';

import { useState, useEffect } from 'react';
import {
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
} from '../../lib/supabase';
import { invalidateAgentsCache } from '../../data/agents';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const agentsData = await getAllAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (agentData) => {
    try {
      const newAgent = await createAgent(agentData);
      if (newAgent) {
        setAgents([newAgent, ...agents]);
        setCreatingAgent(false);
        invalidateAgentsCache(); // ⭐ AGREGAR ESTA LÍNEA
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Error al crear agente');
    }
  };

  const handleUpdateAgent = async (agentId, updates) => {
    try {
      const updatedAgent = await updateAgent(agentId, updates);
      if (updatedAgent) {
        setAgents(
          agents.map((agent) => (agent.id === agentId ? updatedAgent : agent))
        );
        setEditingAgent(null);
        invalidateAgentsCache(); // ⭐ AGREGAR ESTA LÍNEA
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Error al actualizar agente');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('¿Estás seguro de que querés eliminar este agente?')) return;

    try {
      const success = await deleteAgent(agentId);
      if (success) {
        setAgents(agents.filter((agent) => agent.id !== agentId));
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error al eliminar agente');
    }
  };

  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      const updatedAgent = await toggleAgentStatus(agentId, !currentStatus);
      if (updatedAgent) {
        setAgents(
          agents.map((agent) => (agent.id === agentId ? updatedAgent : agent))
        );
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
      alert('Error al cambiar estado del agente');
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            Gestión de Agentes
          </h2>
          <p className='text-gray-600'>
            Creá, editá y gestioná agentes conversacionales
          </p>
        </div>
        <button
          onClick={() => setCreatingAgent(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          + Crear Agente
        </button>
      </div>

      {/* Búsqueda */}
      <div className='bg-white rounded-lg shadow-sm border p-4'>
        <input
          type='text'
          placeholder='Buscar agentes por nombre, título o descripción...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* Grid de agentes */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className='bg-white rounded-lg shadow-sm border overflow-hidden'
          >
            {/* Header con gradiente */}
            <div
              className={`bg-gradient-to-r ${agent.gradient} p-4 text-white relative`}
            >
              <div className='absolute top-2 right-2'>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    agent.is_active
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {agent.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className='flex items-center mb-2'>
                <span className='text-2xl mr-3'>{agent.emoji}</span>
                <div>
                  <h3 className='font-bold'>{agent.name}</h3>
                  <p className='text-sm opacity-90'>{agent.title}</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className='p-4'>
              <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                {agent.description}
              </p>

              <div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
                <span>ID: {agent.id}</span>
                <span>
                  {new Date(agent.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>

              {/* Acciones */}
              <div className='flex space-x-2'>
                <button
                  onClick={() => setEditingAgent(agent)}
                  className='flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors'
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggleStatus(agent.id, agent.is_active)}
                  className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                    agent.is_active
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {agent.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDeleteAgent(agent.id)}
                  className='bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors'
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {creatingAgent && (
        <AgentModal
          onSave={handleCreateAgent}
          onCancel={() => setCreatingAgent(false)}
          title='Crear Nuevo Agente'
        />
      )}

      {editingAgent && (
        <AgentModal
          agent={editingAgent}
          onSave={(data) => handleUpdateAgent(editingAgent.id, data)}
          onCancel={() => setEditingAgent(null)}
          title='Editar Agente'
        />
      )}
    </div>
  );
}

// Componente Modal para crear/editar agente
function AgentModal({ agent = null, onSave, onCancel, title }) {
  const [formData, setFormData] = useState({
    id: agent?.id || '',
    name: agent?.name || '',
    title: agent?.title || '',
    emoji: agent?.emoji || '🤖',
    description: agent?.description || '',
    color: agent?.color || 'blue',
    gradient: agent?.gradient || 'from-blue-500 to-blue-700',
    system_prompt: agent?.system_prompt || '',
    welcome_message: agent?.welcome_message || '',
    is_active: agent?.is_active ?? true,
  });

  const colorOptions = [
    { name: 'Azul', value: 'blue', gradient: 'from-blue-500 to-blue-700' },
    { name: 'Verde', value: 'green', gradient: 'from-green-500 to-green-700' },
    {
      name: 'Púrpura',
      value: 'purple',
      gradient: 'from-purple-500 to-purple-700',
    },
    { name: 'Rojo', value: 'red', gradient: 'from-red-500 to-red-700' },
    { name: 'Gris', value: 'gray', gradient: 'from-gray-500 to-gray-700' },
    {
      name: 'Amarillo',
      value: 'yellow',
      gradient: 'from-yellow-500 to-yellow-700',
    },
    {
      name: 'Indigo',
      value: 'indigo',
      gradient: 'from-indigo-500 to-indigo-700',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.id || !formData.name || !formData.system_prompt) {
      alert('Por favor completá todos los campos obligatorios');
      return;
    }

    onSave(formData);
  };

  const handleColorChange = (color) => {
    const selectedColor = colorOptions.find((c) => c.value === color);
    setFormData({
      ...formData,
      color: color,
      gradient: selectedColor.gradient,
    });
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <h3 className='text-xl font-semibold text-gray-800 mb-6'>{title}</h3>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Columna izquierda */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    ID del Agente *
                  </label>
                  <input
                    type='text'
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='ej: experto-finanzas'
                    disabled={!!agent} // No editable si es edición
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nombre *
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='ej: Experto en Finanzas'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Título
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='ej: Especialista en inversiones'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Emoji
                  </label>
                  <input
                    type='text'
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='ej: 💰'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Color
                  </label>
                  <div className='grid grid-cols-4 gap-2'>
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() => handleColorChange(color.value)}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          formData.color === color.value
                            ? 'border-gray-800'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div
                          className={`w-full h-8 rounded bg-gradient-to-r ${color.gradient}`}
                        ></div>
                        <div className='text-xs mt-1'>{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-sm text-gray-700'>Agente activo</span>
                  </label>
                </div>
              </div>

              {/* Columna derecha */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows='3'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Descripción breve del agente...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Mensaje de Bienvenida
                  </label>
                  <textarea
                    value={formData.welcome_message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        welcome_message: e.target.value,
                      })
                    }
                    rows='3'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Mensaje inicial que verá el usuario...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    System Prompt *
                  </label>
                  <textarea
                    value={formData.system_prompt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        system_prompt: e.target.value,
                      })
                    }
                    rows='12'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Instrucciones detalladas para el agente...'
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className='flex space-x-3 pt-6 border-t'>
              <button
                type='submit'
                className='flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                {agent ? 'Actualizar Agente' : 'Crear Agente'}
              </button>
              <button
                type='button'
                onClick={onCancel}
                className='flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium'
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
