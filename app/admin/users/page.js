'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUser } from '../../lib/supabase';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const updatedUser = await updateUser(userId, updates);
      if (updatedUser) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, ...updates } : user
          )
        );
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Gestión de Usuarios
          </h2>
          <p className='text-gray-600'>
            Administrá planes, límites y permisos de usuarios
          </p>
        </div>
        <div className='text-sm text-gray-500'>
          {users.length} usuarios totales
        </div>
      </div>

      {/* Búsqueda */}
      <div className='bg-white rounded-lg shadow-sm border p-4'>
        <input
          type='text'
          placeholder='Buscar usuarios por email o nombre...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* Lista de usuarios */}
      <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Usuario
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Plan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Uso
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Registro
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredUsers.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        <div className='h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center'>
                          <span className='text-white font-medium text-sm'>
                            {user.first_name?.[0] || user.email?.[0] || '?'}
                          </span>
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.first_name} {user.last_name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.plan === 'elite'
                          ? 'bg-purple-100 text-purple-800'
                          : user.plan === 'pro'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.plan?.toUpperCase() || 'LITE'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    <div className='flex items-center'>
                      <div className='flex-1'>
                        <div className='text-sm'>
                          {user.messages_used || 0} /{' '}
                          {user.messages_limit || 100}
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                          <div
                            className={`h-2 rounded-full ${
                              user.messages_used / user.messages_limit > 0.8
                                ? 'bg-red-500'
                                : user.messages_used / user.messages_limit > 0.6
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                (user.messages_used / user.messages_limit) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(user.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => setEditingUser(user)}
                      className='text-blue-600 hover:text-blue-900 mr-4'
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

// Componente Modal para editar usuario
function EditUserModal({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    plan: user.plan || 'lite',
    messages_limit: user.messages_limit || 100,
    messages_used: user.messages_used || 0,
    role: user.role || 'user',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  const planLimits = {
    lite: 100,
    pro: 1000,
    elite: 2000,
  };

  const handlePlanChange = (newPlan) => {
    setFormData({
      ...formData,
      plan: newPlan,
      messages_limit: planLimits[newPlan],
    });
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Editar Usuario: {user.first_name} {user.last_name}
        </h3>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Plan */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Plan
            </label>
            <select
              value={formData.plan}
              onChange={(e) => handlePlanChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='lite'>Lite (100 mensajes)</option>
              <option value='pro'>Pro (1000 mensajes)</option>
              <option value='elite'>Elite (2000 mensajes)</option>
            </select>
          </div>

          {/* Límite personalizado */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Límite de Mensajes
            </label>
            <input
              type='number'
              value={formData.messages_limit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  messages_limit: parseInt(e.target.value),
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              min='0'
            />
          </div>

          {/* Mensajes usados */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Mensajes Usados
            </label>
            <input
              type='number'
              value={formData.messages_used}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  messages_used: parseInt(e.target.value),
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              min='0'
            />
          </div>

          {/* Rol */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='user'>Usuario</option>
              <option value='admin'>Administrador</option>
            </select>
          </div>

          {/* Botones */}
          <div className='flex space-x-3 pt-4'>
            <button
              type='submit'
              className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Guardar Cambios
            </button>
            <button
              type='button'
              onClick={onCancel}
              className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors'
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
