'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import client from '@/lib/apollo-client';
import ChiffrePage from '@/components/ChiffrePage';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, User, CheckCircle2, Loader2, ShieldAlert, ShieldCheck, Power, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GET_SYSTEM_STATUS = gql`
  query GetSystemStatus {
    getSystemStatus {
      is_blocked
    }
  }
`;

const TOGGLE_BLOCK = gql`
  mutation ToggleSystemBlock($isBlocked: Boolean!) {
    toggleSystemBlock(isBlocked: $isBlocked)
  }
`;

const HEARTBEAT = gql`
  mutation Heartbeat($username: String!) {
    heartbeat(username: $username)
  }
`;

export default function Home() {
  const [user, setUser] = useState<{ role: 'admin' | 'caissier', username?: string, full_name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { data: statusData, refetch: refetchStatus } = useQuery(GET_SYSTEM_STATUS);
  const [toggleBlock] = useMutation(TOGGLE_BLOCK);
  const [sendHeartbeat] = useMutation(HEARTBEAT);

  // Heartbeat Effect
  useEffect(() => {
    if (user?.username) {
      // Pulse immediately
      sendHeartbeat({ variables: { username: user.username } }).catch(console.error);

      // Setup interval (every 30s)
      const interval = setInterval(() => {
        sendHeartbeat({ variables: { username: user.username } }).catch(console.error);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?.username, sendHeartbeat]);

  // Check localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bb_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bb_user');
      }
    }
    setInitializing(false);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API delay for smoothness
    setTimeout(() => {
      // Mock validation matching the user's previous request context 
      if (username.toLowerCase() === 'admin' && password.length > 0) {
        const userData = { role: 'admin' as const, username: 'admin', full_name: 'Administrateur' };
        setUser(userData);
        localStorage.setItem('bb_user', JSON.stringify(userData));
      } else if (username.toLowerCase() === 'caissier' && password.length > 0) {
        const userData = { role: 'caissier' as const, username: 'caissier', full_name: 'Caissier' };
        setUser(userData);
        localStorage.setItem('bb_user', JSON.stringify(userData));
      } else {
        setError('Identifiants incorrects');
        setLoading(false);
        return;
      }
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setUsername('');
    setPassword('');
  };

  const handleToggleBlock = async () => {
    try {
      await toggleBlock({ variables: { isBlocked: !statusData?.getSystemStatus?.is_blocked } });
      refetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="relative w-20 h-20">
            <Image src="/logo.jpeg" alt="Loading" fill className="rounded-full object-cover opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  const isBlocked = statusData?.getSystemStatus?.is_blocked;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#fdfbf7]">
        {/* Decorative background elements */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05] animate-pulse"></div>
          <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.05]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(92,58,33,0.12)] overflow-hidden min-h-[600px] border border-[rgba(196,154,108,0.15)] relative"
        >
          {/* Admin Hidden Toggle (click logo area or special spot) */}
          <div className="absolute bottom-4 left-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={() => {
              const pass = prompt('Admin Bypass Password:');
              if (pass === 'admin123') handleToggleBlock();
            }} className="p-2 text-[#e6dace]"><Power size={12} /></button>
          </div>

          {/* Left Side - Visual/Brand */}
          <div className="hidden md:flex flex-col items-center justify-center relative p-12 bg-[#4a3426] text-white overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08] bg-[url('/logo.jpeg')] bg-cover bg-center grayscale mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="relative z-10 text-center space-y-8 max-w-sm">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-40 h-40 relative mx-auto rounded-[2.5rem] p-1 bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-2xl"
              >
                <Image src="/logo.jpeg" alt="Business Bey" fill className="rounded-[2.2rem] object-cover border-4 border-transparent" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tighter mb-2 uppercase italic">Business Bey</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-[1px] w-8 bg-white/30"></div>
                  <p className="text-[#c69f6e] uppercase tracking-[0.4em] text-[10px] font-black italic">Luxury Restaurant & Coffee</p>
                  <div className="h-[1px] w-8 bg-white/30"></div>
                </div>
              </div>
              <p className="text-white/60 font-medium italic text-sm leading-relaxed px-6">
                "Excellence et raffinement au service de notre clientèle."
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-20 relative bg-[#fffdfb]">
            <div className="mb-12 text-center md:text-left">
              <motion.h1
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-black text-[#4a3426] mb-3 tracking-tighter uppercase italic"
              >
                Bienvenue
              </motion.h1>
              <p className="text-[#8c8279] font-medium text-sm tracking-tight">Connectez-vous à votre espace de gestion.</p>
            </div>

            <AnimatePresence mode="wait">
              {isBlocked ? (
                <motion.div
                  key="blocked"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8 py-10 flex flex-col items-center justify-center text-center bg-[#fcfaf8] rounded-[2rem] border-2 border-dashed border-[#e6dace]"
                >
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                    <ShieldAlert size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#4a3426] uppercase tracking-tighter mb-2">Système Verrouillé</h3>
                    <p className="text-xs font-bold text-[#8c8279] max-w-[200px] mx-auto leading-relaxed uppercase tracking-widest opacity-60">
                      L'accès au formulaire est temporairement restreint.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] ml-1">Utilisateur</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c69f6e] transition-colors group-focus-within:text-[#4a3426]" size={18} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-16 rounded-2xl bg-[#fcfaf8] border border-[#e6dace] px-5 pl-14 text-sm font-black text-[#4a3426] outline-none focus:border-[#4a3426] focus:bg-white focus:shadow-[0_10px_30px_-10px_rgba(74,52,38,0.1)] transition-all placeholder:text-[#bba282]/40"
                        placeholder="Identifiant"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#bba282] uppercase tracking-[0.2em] ml-1">Mot de passe</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c69f6e] transition-colors group-focus-within:text-[#4a3426]" size={18} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-16 rounded-2xl bg-[#fcfaf8] border border-[#e6dace] px-5 pl-14 text-sm font-black text-[#4a3426] outline-none focus:border-[#4a3426] focus:bg-white focus:shadow-[0_10px_30px_-10px_rgba(74,52,38,0.1)] transition-all placeholder:text-[#bba282]/40"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-red-50 text-red-600 text-[10px] font-black rounded-xl flex items-center gap-3 border border-red-100 uppercase tracking-widest"
                    >
                      <AlertCircle size={16} />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-[#4a3426] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#4a3426]/30 hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:scale-100 transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Se connecter</span>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-12 text-center">
              <p className="text-[10px] font-black text-[#bba282] uppercase tracking-widest opacity-40 italic">© 2026 Expertise Bey. Tous droits réservés.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Quick Block Toggle for Admins while in app */}
      {user.role === 'admin' && (
        <button
          onClick={handleToggleBlock}
          className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-90 ${isBlocked ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-green-500 text-white shadow-green-500/40'}`}
          title={isBlocked ? "Déverrouiller le système" : "Verrouiller le système"}
        >
          {isBlocked ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
        </button>
      )}
      <ChiffrePage role={user.role} onLogout={handleLogout} />
    </div>
  );
}
