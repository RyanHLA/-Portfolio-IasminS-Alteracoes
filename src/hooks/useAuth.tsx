import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUserRole(session);
    });

    // 2. Escuta mudanças (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUserRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (session: Session | null) => {
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Verifica se o usuário tem a role 'admin' na tabela user_roles
    // (Você precisará adicionar seu usuário lá manualmente na primeira vez)
    const { data, error } = await supabase.rpc('has_role', { 
      _user_id: session.user.id, 
      _role: 'admin' 
    });
    
    // Se der erro ou retornar false, o usuário não é admin
    if (error || !data) {
      console.log("Usuário logado, mas sem permissão de admin.");
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
    
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin + '/auth' // Volta para página de Auth para checar permissão
      } 
    });
    if (error) console.error("Erro no login:", error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};