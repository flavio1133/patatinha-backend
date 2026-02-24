import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data?.data || response.data;
      // Validar: API deve retornar objeto com id ou email (não HTML)
      const isValid = userData && typeof userData === 'object' && !Array.isArray(userData) &&
        (userData.id != null || userData.email);
      if (!isValid || (typeof userData === 'string' && userData.trim().startsWith('<'))) {
        throw new Error('Resposta inválida da API');
      }
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Tentando fazer login com:', email);
      const response = await authAPI.login(email, password);
      
      console.log('📦 Resposta completa:', response);
      console.log('📦 response.data:', response.data);
      
      // A API retorna: { message, token, user }
      const token = response.data?.token;
      const user = response.data?.user;
      
      if (!token) {
        console.error('❌ Token não recebido na resposta:', response.data);
        return {
          success: false,
          error: 'Token não recebido do servidor. Verifique o console para mais detalhes.',
        };
      }
      
      console.log('✅ Token recebido:', token.substring(0, 20) + '...');
      console.log('✅ Usuário:', user);
      console.log('✅ Role:', user?.role);
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      return { success: true, user }; // Retornar user também para redirecionamento
    } catch (error) {
      // Log detalhado do erro para debug
      console.error('❌ Erro no login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao fazer login';
      
      if (error.response) {
        // Erro da API (4xx, 5xx)
        const apiError = error.response.data;
        const status = error.response.status;
        if (status === 404) {
          errorMessage = 'Serviço temporariamente indisponível. A API ainda não está configurada para produção.';
        } else if (status === 401) {
          errorMessage = 'E-mail ou senha incorretos';
        } else if (status === 400) {
          errorMessage = apiError?.error || 'Dados inválidos';
        } else if (status === 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        } else {
          errorMessage = apiError?.error || apiError?.message || `Erro ${status}`;
        }
      } else if (error.request) {
        // Requisição feita mas sem resposta (CORS, servidor offline, etc)
        errorMessage = 'Servidor não respondeu. Verifique sua conexão ou se o backend está online.';
      } else {
        // Erro ao configurar a requisição
        errorMessage = error.message || 'Erro ao configurar requisição';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data?.data || response.data;
      setUser(userData);
    } catch (_) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isMaster: user?.role === 'master',
        isManager: ['master', 'manager'].includes(user?.role),
        isSuperAdmin: user?.role === 'super_admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
