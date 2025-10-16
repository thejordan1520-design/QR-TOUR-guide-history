import { supabase } from '../lib/supabase';

export interface UserInfo {
  display_name: string;
  email: string;
}

export interface UserMap {
  [userId: string]: UserInfo;
}

/**
 * Resuelve nombres de usuario desde IDs
 * Prioridad: display_name -> email (sin @) -> "Usuario XXXX"
 */
export const resolveUserNames = async (userIds: string[]): Promise<UserMap> => {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  console.log('🔍 Resolviendo nombres para usuarios:', userIds);
  
  let usersMap: UserMap = {};
  
  try {
    // 1. Intentar obtener usuarios de la tabla users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, email, full_name')
      .in('id', userIds);

    console.log('🔍 Consulta tabla users:', { usersData, usersError });

    if (!usersError && usersData) {
      usersMap = usersData.reduce((acc: UserMap, user: any) => {
        const displayName = user.display_name || 
                           user.full_name || 
                           user.email?.split('@')[0] || 
                           'Usuario';
        
        acc[user.id] = {
          display_name: displayName,
          email: user.email
        };
        return acc;
      }, {} as UserMap);
      
      console.log('🔍 UsersMap desde tabla users:', usersMap);
    }

    // 2. Para usuarios no encontrados, generar nombres genéricos
    for (const userId of userIds) {
      const userIdStr: string = String(userId);
      if (!usersMap[userIdStr]) {
        usersMap[userIdStr] = {
          display_name: `Usuario ${userIdStr.slice(-4)}`, // Últimos 4 caracteres del ID
          email: null
        };
      }
    }

    console.log('🔍 UsersMap final:', usersMap);
    return usersMap;

  } catch (error) {
    console.error('❌ Error resolviendo nombres de usuario:', error);
    
    // Fallback: generar nombres genéricos para todos
    const fallbackMap: UserMap = {};
    for (const userId of userIds) {
      const userIdStr: string = String(userId);
      fallbackMap[userIdStr] = {
        display_name: `Usuario ${userIdStr.slice(-4)}`,
        email: null
      };
    }
    
    return fallbackMap;
  }
};

/**
 * Obtiene el nombre de usuario para un ID específico
 */
export const getUserName = async (userId: string): Promise<string> => {
  const usersMap = await resolveUserNames([userId]);
  return usersMap[userId]?.display_name || `Usuario ${String(userId).slice(-4)}`;
};

