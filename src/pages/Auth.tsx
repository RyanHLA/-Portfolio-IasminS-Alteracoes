import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { isAdmin, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Se já for admin, manda pro painel
    if (!loading && isAdmin) {
      navigate('/admin');
    }
    // Opcional: Se estiver logado mas NÃO for admin, mostrar aviso
    // (Você pode implementar isso checando se existe session mas isAdmin é false)
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo/Header */}
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Área Administrativa
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso exclusivo para gerenciamento
          </p>
        </div>

        {/* Google Button */}
        <div className="space-y-4">
          <Button
            onClick={() => signInWithGoogle()}
            className="w-full h-12 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 relative"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              className="w-5 h-5 absolute left-4" 
              alt="Google" 
            />
            Entrar com Google
          </Button>
        </div>

        {/* Footer Link */}
        <div>
          <a
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-amber-600"
          >
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;