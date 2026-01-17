'use client';

import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import client from '@/lib/apollo-client';
import ChiffrePage from '@/components/ChiffrePage';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, User, CheckCircle2, Loader2, ShieldAlert, ShieldCheck, Power, AlertCircle, Camera, Scan, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function FaceIDLoginModal({ user, onClose, onSuccess }: any) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanStep, setScanStep] = React.useState<'align' | 'depth' | 'auth'>('align');

  React.useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;

        // Step 1: Align
        setTimeout(() => {
          setScanStep('depth');
          // Step 2: Depth Analysis
          setTimeout(() => {
            setScanStep('auth');
            performScan();
          }, 1200);
        }, 1500);
      } catch (e) {
        alert('Caméra non disponible');
        onClose();
      }
    }
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const performScan = async () => {
    setStatus('scanning');

    setTimeout(async () => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context && user.face_data) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);

          // Basic pixel-based similarity logic
          try {
            const similarity = await simulateBiometricMatching(canvasRef.current, user.face_data);

            if (similarity > 0.75) {
              setStatus('success');
              setTimeout(() => {
                onSuccess();
              }, 800);
            } else {
              setStatus('error');
              setTimeout(() => {
                setStatus('idle');
                setScanStep('align');
                // Restart scan sequence
                setTimeout(() => {
                  setScanStep('depth');
                  setTimeout(() => {
                    setScanStep('auth');
                    performScan();
                  }, 1200);
                }, 1500);
              }, 2000);
            }
          } catch (err) {
            setStatus('error');
          }
        }
      }
    }, 2500);
  };

  const simulateBiometricMatching = async (currentCanvas: HTMLCanvasElement, savedData: string) => {
    return new Promise<number>((resolve) => {
      const img = new (window as any).Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(0);

        canvas.width = 50; // Small sample for speed
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data1 = ctx.getImageData(0, 0, 50, 50).data;

        const ctx2 = currentCanvas.getContext('2d');
        if (!ctx2) return resolve(0);
        ctx.drawImage(currentCanvas, 0, 0, 50, 50);
        const data2 = ctx.getImageData(0, 0, 50, 50).data;

        let diff = 0;
        for (let i = 0; i < data1.length; i += 4) {
          diff += Math.abs(data1[i] - data2[i]); // Comparing Red channel as sample
        }

        const similarity = 1 - (diff / (data1.length / 4 * 255));
        resolve(similarity);
      };
      img.onerror = () => resolve(0);
      img.src = savedData;
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-[#1a110a]/90">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-[rgba(196,154,108,0.2)]"
      >
        <div className="p-12 flex flex-col items-center">
          <div className="relative w-56 h-56 mb-10">
            {/* Pulsing Outer Ring */}
            <div className="absolute -inset-4 border border-[#c69f6e]/20 rounded-full animate-ping opacity-20" />

            {/* Scanner UI */}
            <div className="absolute inset-0 rounded-full border-[6px] border-[#fcfaf8] overflow-hidden bg-black shadow-2xl relative">
              <video ref={videoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover transition-all duration-1000 
                ${status === 'success' ? 'sepia-0 grayscale-0' : 'grayscale brightness-110 contrast-125'} 
                ${scanStep === 'depth' ? 'scale-110' : 'scale-100'}`}
              />
              {status === 'scanning' && (
                <motion.div
                  initial={{ top: '0%' }} animate={{ top: '100%' }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-[#c69f6e] shadow-[0_0_15px_#c69f6e] z-10"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <AnimatePresence>
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  className="absolute -right-2 -bottom-2 bg-green-500 text-white p-4 rounded-full shadow-2xl z-30"
                >
                  <CheckCircle2 size={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center space-y-4 w-full">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Scan size={18} className="text-[#c69f6e]" />
                <h3 className="text-xl font-black text-[#4a3426] uppercase italic tracking-tighter">
                  {status === 'success' ? 'Accès Autorisé' : 'Scan en cours'}
                </h3>
              </div>
              <p className="text-[#8c8279] font-black text-[10px] uppercase tracking-[0.2em] opacity-50">Expertise Bey Biometrics</p>
            </div>

            <div className="py-4 bg-[#fcfaf8] rounded-2xl border border-[#e6dace] border-dashed">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-4">
                  <span className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === 'align' ? 'bg-[#c69f6e] scale-125' : 'bg-green-500 opacity-30 shadow-none'}`} />
                  <span className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === 'depth' ? 'bg-[#c69f6e] scale-125' : scanStep === 'auth' ? 'bg-green-500 opacity-30' : 'bg-[#e6dace] opacity-30'}`} />
                  <span className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === 'auth' ? 'bg-[#c69f6e] scale-125' : 'bg-[#e6dace] opacity-30'}`} />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${status === 'error' ? 'text-red-500' : 'text-[#4a3426] animate-pulse'}`}>
                  {status === 'success' ? 'Identité confirmée' :
                    status === 'error' ? "Échec de l'Authentification" :
                      scanStep === 'align' ? 'Alignement du visage...' :
                        scanStep === 'depth' ? 'Analyse de profondeur...' :
                          'Authentification finale...'}
                </p>
              </div>
            </div>

            <p className="text-[9px] font-bold text-[#bba282] uppercase opacity-60">Session de {user.full_name}</p>
          </div>

          <button
            onClick={onClose}
            className="mt-10 px-6 py-3 bg-white border border-[#e6dace] rounded-xl text-[9px] font-black text-[#8c8279] uppercase tracking-[0.2em] hover:bg-[#4a3426] hover:text-white transition-all shadow-sm"
          >
            Utiliser le mot de passe
          </button>
        </div>
      </motion.div>
    </div>
  );
}

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

const RECORD_CONNECTION = gql`
  mutation RecordConnection($username: String!, $ipAddress: String, $deviceInfo: String, $browser: String) {
    recordConnection(username: $username, ipAddress: $ipAddress, deviceInfo: $deviceInfo, browser: $browser)
  }
`;

const DISCONNECT_USER = gql`
  mutation DisconnectUser($username: String!) {
    disconnectUser(username: $username)
  }
`;

export default function Home() {
  const [user, setUser] = useState<{ role: 'admin' | 'caissier', username?: string, full_name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { data: statusData, refetch: refetchStatus } = useQuery(GET_SYSTEM_STATUS, { pollInterval: 30000 });
  const [toggleBlock] = useMutation(TOGGLE_BLOCK);
  const [recordConnection] = useMutation(RECORD_CONNECTION);
  const [disconnectUser] = useMutation(DISCONNECT_USER);

  const [pendingUser, setPendingUser] = useState<any>(null);
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);

  // Check if system OR current user is blocked
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const isBlocked = statusData?.getSystemStatus?.is_blocked || isAccountBlocked;

  const [checkStatus] = useLazyQuery(gql`
    query CheckUserStatus {
      getUsers {
        username
        is_blocked_user
      }
    }
  `, { fetchPolicy: 'network-only' });

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    if (/iphone/i.test(ua)) return 'iPhone Mobile';
    if (/ipad/i.test(ua)) return 'iPad Tablet';
    if (/android/i.test(ua)) return 'Android Device';
    if (/windows/i.test(ua)) return 'Windows PC';
    if (/macintosh/i.test(ua)) return 'Apple Mac';
    if (/linux/i.test(ua)) return 'Linux System';
    return 'Web Browser Device';
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown Browser';
  };

  // Security check effect
  useEffect(() => {
    const checkSecurity = async () => {
      const stored = localStorage.getItem('bb_user');
      if (!stored) return;
      const userData = JSON.parse(stored);

      // Fetch current user status from DB
      const { data } = await checkStatus();
      if (!data?.getUsers) return;

      const dbUser = data.getUsers.find((u: any) => u.username.toLowerCase() === userData.username.toLowerCase());
      if (dbUser?.is_blocked_user) {
        setIsAccountBlocked(true);
        // If the user is blocked, log them out
        if (user && user.username === userData.username) {
          handleLogout();
        }
      } else {
        setIsAccountBlocked(false);
      }
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 45000);
    return () => clearInterval(interval);
  }, [user]); // Re-run if user state changes

  // Tab close disconnect
  useEffect(() => {
    const handleTabClose = () => {
      if (user?.username) {
        const query = `mutation { disconnectUser(username: "${user.username}") }`;
        const blob = new Blob([JSON.stringify({ query })], { type: 'application/json' });
        navigator.sendBeacon('/api/graphql', blob);
      }
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => window.removeEventListener('beforeunload', handleTabClose);
  }, [user]);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bb_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('bb_user');
      }
    }
    setInitializing(false);
  }, []);

  const [getUsersForAuth, { loading: queryLoading }] = useLazyQuery(gql`
    query GetUsersAuth {
      getUsers {
        id
        username
        password
        role
        full_name
        is_blocked_user
        has_face_id
        face_data
      }
    }
  `, { fetchPolicy: 'network-only' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await getUsersForAuth();

      if (!data?.getUsers) {
        throw new Error('No data');
      }

      const foundUser = data.getUsers.find(
        (u: any) => u.username?.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (foundUser) {
        if (foundUser.is_blocked_user) {
          setError('Votre compte est suspendu. Contactez l\'administrateur.');
          setIsAccountBlocked(true);
        } else if (foundUser.has_face_id) {
          setPendingUser(foundUser);
          setIsFaceLoginOpen(true);
        } else {
          finalizeLogin(foundUser);
        }
      } else {
        setError('Identifiants invalides');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const finalizeLogin = async (foundUser: any) => {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipRes ? await ipRes.json() : { ip: 'Unknown' };

      await recordConnection({
        variables: {
          username: foundUser.username,
          ipAddress: ipData.ip,
          deviceInfo: getDeviceInfo(),
          browser: getBrowserInfo()
        }
      });
    } catch (e) {
      console.error('Record connection error:', e);
    }

    const userData = {
      role: foundUser.role,
      username: foundUser.username,
      full_name: foundUser.full_name,
    };
    localStorage.setItem('bb_user', JSON.stringify(userData));
    setUser(userData);
    setIsAccountBlocked(false);
    setIsFaceLoginOpen(false);
    setPendingUser(null);
  };

  const handleLogout = async () => {
    if (user?.username) {
      try {
        await disconnectUser({ variables: { username: user.username } });
      } catch (e) { console.error('Logout error:', e); }
    }
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

  if (!user || isBlocked) {
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
          {/* Left Side - Visual/Brand (Always visible) */}
          <div className="hidden md:flex flex-col items-center justify-center relative p-12 bg-[#4a3426] text-white overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08] bg-[url('/logo.jpeg')] bg-cover bg-center grayscale mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="relative z-10 text-center space-y-8 max-w-sm">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-32 h-32 relative mx-auto rounded-[2rem] p-1 bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-2xl"
              >
                <Image src="/logo.jpeg" alt="Logo" fill className="rounded-[1.8rem] object-cover border-4 border-transparent" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-white">Expertise Bey</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-[1px] w-6 bg-white/30"></div>
                  <p className="text-[#c69f6e] uppercase tracking-[0.4em] text-[8px] font-black italic">Hardware & Stock Intelligence</p>
                  <div className="h-[1px] w-6 bg-white/30"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form OR Blocked Message */}
          <div className="p-8 md:p-14 flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              {isBlocked ? (
                <motion.div
                  key="blocked"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                      <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center shadow-xl border-2 border-red-50">
                        <ShieldAlert size={48} className="text-red-500" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h1 className="text-3xl font-black text-[#4a3426] tracking-tighter uppercase italic mb-3">Système Verrouillé</h1>
                    <p className="text-[#8c8279] font-bold text-[10px] uppercase tracking-[0.2em] max-w-[240px] leading-relaxed mx-auto opacity-60">
                      {isAccountBlocked ? "Votre compte a été suspendu par l'administration." : "L'accès au système est temporairement restreint."}
                    </p>
                  </div>

                  {/* Hidden bypass button for admins */}
                  <button
                    onClick={() => setIsBlockConfirmOpen(true)}
                    className="p-3 rounded-full hover:bg-gray-50 opacity-0 hover:opacity-100 transition-all mx-auto block"
                  >
                    <Power size={12} className="text-gray-200" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="text-center md:text-left mb-10">
                    <h2 className="text-3xl font-black text-[#4a3426] tracking-tighter uppercase italic leading-tight">Bienvenue</h2>
                    <p className="text-[#bba282] font-bold text-[10px] uppercase tracking-widest mt-2 opacity-60">Identification requise</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-5">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-[#bba282] group-focus-within:text-[#4a3426] transition-colors">
                          <User size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full h-16 rounded-2xl bg-[#fcfaf8] border border-[#e6dace] px-5 pl-14 text-sm font-black text-[#4a3426] outline-none focus:border-[#4a3426] focus:bg-white transition-all placeholder:text-[#bba282]/40"
                          placeholder="IDENTIFIANT"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-[#bba282] group-focus-within:text-[#4a3426] transition-colors">
                          <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-16 rounded-2xl bg-[#fcfaf8] border border-[#e6dace] px-5 pl-14 text-sm font-black text-[#4a3426] outline-none focus:border-[#4a3426] focus:bg-white transition-all placeholder:text-[#bba282]/40"
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
                      disabled={loading || queryLoading}
                      className="w-full h-16 bg-[#4a3426] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#4a3426]/30 hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:scale-100 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {loading || queryLoading ? <Loader2 className="animate-spin" size={20} /> : <span>Se connecter</span>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 text-center md:text-left">
              <p className="text-[9px] font-black text-[#bba282] uppercase tracking-widest opacity-40 italic">© 2026 Expertise Bey. Toutes les sessions sont tracées.</p>
            </div>
          </div>
        </motion.div>

        {/* Face ID Login Modal */}
        <AnimatePresence>
          {isFaceLoginOpen && pendingUser && (
            <FaceIDLoginModal
              user={pendingUser}
              onClose={() => {
                setIsFaceLoginOpen(false);
                setPendingUser(null);
              }}
              onSuccess={() => finalizeLogin(pendingUser)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Quick Block Toggle for Admins while in app */}
      {user.role === 'admin' && (
        <button
          onClick={() => setIsBlockConfirmOpen(true)}
          className={`fixed bottom-28 lg:bottom-10 right-6 z-[100] p-3.5 lg:p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-90 ${isBlocked ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-green-500 text-white shadow-green-500/40'}`}
          title={isBlocked ? "Déverrouiller le système" : "Verrouiller le système"}
        >
          {isBlocked ? <ShieldAlert size={22} className="lg:w-6 lg:h-6" /> : <ShieldCheck size={22} className="lg:w-6 lg:h-6" />}
        </button>
      )}

      {/* Block/Unblock Confirmation Modal */}
      <AnimatePresence>
        {isBlockConfirmOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-md bg-black/20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center border border-[#e6dace]"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isBlocked ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {isBlocked ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
              </div>

              <h3 className="text-xl font-black text-[#4a3426] uppercase italic tracking-tighter mb-4">
                {isBlocked ? "Déverrouiller le système ?" : "Verrouiller le système ?"}
              </h3>

              <p className="text-[10px] font-bold text-[#8c8279] uppercase tracking-widest leading-relaxed mb-8 opacity-60">
                {isBlocked
                  ? "Cela rétablira l'accès complet pour tous les caissiers."
                  : "Cela bloquera instantanément l'accès pour tous les utilisateurs."}
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setIsBlockConfirmOpen(false)}
                  className="flex-1 h-14 bg-[#fcfaf8] text-[#8c8279] font-black uppercase text-[10px] tracking-widest rounded-2xl border border-[#e6dace]"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleToggleBlock();
                    setIsBlockConfirmOpen(false);
                  }}
                  className={`flex-1 h-14 font-black uppercase text-[10px] tracking-widest rounded-2xl text-white shadow-lg ${isBlocked ? 'bg-green-600 shadow-green-600/20' : 'bg-red-600 shadow-red-600/20'}`}
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ChiffrePage role={user.role} onLogout={handleLogout} />
    </div>
  );
}


