import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Wrench, DollarSign, Briefcase, Server, LogIn, UserPlus } from 'lucide-react';
import type { ChatCategory } from '@/types/chat';
import { cn } from '@/lib/utils';

const teams: { id: ChatCategory; label: string; icon: typeof Wrench }[] = [
  { id: 'suporte-tecnico', label: 'Suporte Técnico', icon: Wrench },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'comercial', label: 'Comercial', icon: Briefcase },
  { id: 'infra', label: 'Infraestrutura', icon: Server },
];

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<ChatCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister && !selectedTeam) {
      toast({ title: 'Erro', description: 'Selecione seu time.', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { error } = await signUp(email, password, selectedTeam!);
      if (error) {
        toast({ title: 'Erro no cadastro', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Cadastro realizado!', description: 'Verifique seu email para confirmar a conta.' });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Erro no login', description: error, variant: 'destructive' });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Fios Tecnologia</h1>
          </div>
          <p className="text-sm text-muted-foreground">Plataforma de atendimento inteligente</p>
        </div>

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {isRegister ? 'Criar conta' : 'Entrar'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            {isRegister && (
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Selecione seu time</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((team) => {
                    const Icon = team.icon;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelectedTeam(team.id)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border text-sm transition-all duration-200 text-left',
                          selectedTeam === team.id
                            ? 'border-primary/60 bg-primary/10 text-primary shadow-sm shadow-primary/10'
                            : 'border-border/50 bg-background/30 text-muted-foreground hover:border-border hover:bg-background/50'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{team.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Aguarde...</span>
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar conta
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setSelectedTeam(null); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isRegister ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
