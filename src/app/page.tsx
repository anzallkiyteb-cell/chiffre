'use client';

import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import client from '@/lib/apollo-client';
import ChiffrePage from '@/components/ChiffrePage';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, User, CheckCircle2, Loader2, ShieldAlert, ShieldCheck, Power, AlertCircle, Camera, Scan, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';

// Load face-api models once
let modelsLoaded = false;
const loadModels = async () => {
  if (modelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]);
    modelsLoaded = true;
  } catch (err) {
    console.error('Failed to load face-api models:', err);
  }
};

function FaceIDLoginModal({ user, onClose, onSuccess }: any) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'scanning' | 'success' | 'error' | 'locked'>('idle');
  const [scanStep, setScanStep] = React.useState<'align' | 'depth' | 'auth'>('align');
  const [failCount, setFailCount] = React.useState(0);
  const [statusText, setStatusText] = React.useState('');

  React.useEffect(() => {
    async function init() {
      setStatus('loading');
      setStatusText('Chargement du modèle IA...');

      // Load face-api models
      await loadModels();

      // Start camera
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await new Promise(resolve => {
            if (videoRef.current) videoRef.current.onloadedmetadata = resolve;
          });
        }

        setStatus('idle');
        setStatusText('');

        // Start scan sequence
        setScanStep('align');
        setTimeout(() => {
          setScanStep('depth');
          setTimeout(() => {
            setScanStep('auth');
            performScan();
          }, 800);
        }, 800);
      } catch (e) {
        alert('Caméra non disponible');
        onClose();
      }
    }
    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const performScan = async () => {
    setStatus('scanning');
    setStatusText('Détection du visage...');

    try {
      if (!videoRef.current || !user.face_data) {
        throw new Error('Video or face data not available');
      }

      // Detect face in current video frame
      const currentDetection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!currentDetection) {
        setStatusText('Aucun visage détecté');
        handleScanFailure();
        return;
      }

      setStatusText('Comparaison biométrique...');

      // Get saved face descriptor
      const savedDescriptor = await getSavedFaceDescriptor(user.face_data);

      if (!savedDescriptor) {
        setStatusText('Erreur: données sauvegardées invalides');
        handleScanFailure();
        return;
      }

      // Compare face descriptors using Euclidean distance
      const distance = faceapi.euclideanDistance(currentDetection.descriptor, savedDescriptor);

      // Distance < 0.6 means same person (lower = more similar)
      // iPhone uses ~0.6, we use 0.5 for better security
      const threshold = 0.5;

      if (distance < threshold) {
        setStatus('success');
        setStatusText('Identité confirmée');
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setStatusText(`Visage non reconnu`);
        handleScanFailure();
      }
    } catch (err) {
      console.error('Face scan error:', err);
      setStatusText('Erreur de scan');
      handleScanFailure();
    }
  };

  const handleScanFailure = () => {
    const newCount = failCount + 1;
    setFailCount(newCount);

    if (newCount >= 3) {
      setStatus('locked');
      localStorage.setItem(`lock_${user.username}`, Date.now().toString());
    } else {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setScanStep('align');
        setTimeout(() => {
          setScanStep('depth');
          setTimeout(() => {
            setScanStep('auth');
            performScan();
          }, 800);
        }, 800);
      }, 1500);
    }
  };

  // Extract face descriptor from saved base64 image
  const getSavedFaceDescriptor = async (base64Data: string): Promise<Float32Array | null> => {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            resolve(detection.descriptor);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.error('Error extracting saved face:', err);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = base64Data;
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
              {(status === 'scanning' || status === 'loading') && (
                <motion.div
                  initial={{ top: '0%' }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-[#c69f6e] shadow-[0_0_15px_#c69f6e] z-10"
                />
              )}
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                  <Loader2 className="w-12 h-12 text-[#c69f6e] animate-spin" />
                </div>
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
                  {status === 'loading' ? 'Initialisation...' :
                    status === 'success' ? 'Accès Autorisé' :
                    status === 'error' ? 'Échec' :
                    status === 'locked' ? 'Bloqué' : 'Scan IA'}
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
                <p className={`text-[10px] font-black uppercase tracking-widest ${status === 'error' || status === 'locked' ? 'text-red-500' : 'text-[#4a3426] animate-pulse'}`}>
                  {status === 'loading' ? statusText || 'Chargement...' :
                    status === 'success' ? 'Identité confirmée' :
                    status === 'locked' ? 'ACCÈS REFUSÉ - COMPTE BLOQUÉ' :
                      status === 'error' ? `Échec - Tentative ${failCount}/3` :
                        status === 'scanning' ? statusText || 'Analyse en cours...' :
                          scanStep === 'align' ? 'Alignement du visage...' :
                            scanStep === 'depth' ? 'Analyse IA...' :
                              'Reconnaissance faciale...'}
                </p>
              </div>
            </div>

            <p className="text-[9px] font-bold text-[#bba282] uppercase opacity-60">Session de {user.full_name}</p>
          </div>

          <button
            onClick={onClose}
            className="mt-10 px-6 py-3 bg-red-50 border border-red-100 rounded-xl text-[9px] font-black text-red-600 uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Annuler la connexion
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
  const [lastUser, setLastUser] = useState<any>(null);
  const [error, setError] = useState('');

  const { data: statusData, loading: statusLoading, refetch: refetchStatus } = useQuery(GET_SYSTEM_STATUS, { pollInterval: 30000 });
  const [recordConnection] = useMutation(RECORD_CONNECTION);
  const [disconnectUser] = useMutation(DISCONNECT_USER);

  const [pendingUser, setPendingUser] = useState<any>(null);
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Check if system OR current user is blocked
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const isBlocked = statusData?.getSystemStatus?.is_blocked || isAccountBlocked;

  const [checkStatus] = useLazyQuery(gql`
    query CheckUserStatus {
      getUsers {
        username
        is_blocked_user
        last_active
      }
    }
  `, { fetchPolicy: 'network-only' });

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;

    // Android Detection (Model extraction)
    if (/android/i.test(ua)) {
      const match = ua.match(/Android\s+[^;]+;\s+([^);]+)/i);
      if (match && match[1]) {
        const model = match[1].trim();
        if (!/mobile|tablet/i.test(model)) return `Android (${model})`;
      }
      return 'Android Device';
    }

    // iOS Detection
    if (/iphone/i.test(ua)) return 'Apple iPhone';
    if (/ipad/i.test(ua)) return 'Apple iPad';

    // Macintosh Detection
    if (/macintosh/i.test(ua)) {
      const match = ua.match(/OS X\s+([^);]+)/i);
      if (match && match[1]) return `Mac OS (${match[1].replace(/_/g, '.')})`;
      return 'Apple Mac';
    }

    // Windows Detection
    if (/windows/i.test(ua)) {
      if (/nt 10.0/i.test(ua)) return 'Windows 10/11';
      if (/nt 6.3/i.test(ua)) return 'Windows 8.1';
      if (/nt 6.2/i.test(ua)) return 'Windows 8';
      if (/nt 6.1/i.test(ua)) return 'Windows 7';
      return 'Windows PC';
    }

    if (/linux/i.test(ua)) return 'Linux System';
    return 'Poste de travail';
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

      // Forced logout if blocked OR if an admin manually cleared the session (last_active is null)
      if (dbUser?.is_blocked_user || (dbUser && dbUser.last_active === null)) {
        console.log("Session invalid or blocked. Forced logout.");
        setIsAccountBlocked(!!dbUser?.is_blocked_user);
        handleLogout();
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

    // Check for last user for quick reconnect
    const last = localStorage.getItem('bb_last_user');
    if (last) {
      try {
        setLastUser(JSON.parse(last));
      } catch (e) {
        localStorage.removeItem('bb_last_user');
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
        // Enforce Face ID lockout check
        const isLocallyLocked = localStorage.getItem(`lock_${foundUser.username}`);
        if (isLocallyLocked) {
          setError('ACCÈS REFUSÉ : Trop de tentatives Face ID échouées.');
          return;
        }

        if (foundUser.is_blocked_user) {
          setError('Votre compte est suspendu. Contactez l\'administrateur.');
          setIsAccountBlocked(true);
        } else if (foundUser.has_face_id || foundUser.face_data) {
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

  const handleFacialReconnect = async () => {
    if (!lastUser) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await getUsersForAuth();
      if (!data?.getUsers) throw new Error('No data');

      const foundUser = data.getUsers.find(
        (u: any) => u.username?.toLowerCase() === lastUser.username.toLowerCase()
      );

      if (foundUser) {
        // Enforce Face ID lockout check
        const isLocallyLocked = localStorage.getItem(`lock_${foundUser.username}`);
        if (isLocallyLocked) {
          setError('ACCÈS REFUSÉ : Trop de tentatives Face ID échouées.');
          return;
        }

        if (foundUser.is_blocked_user) {
          setError('Votre compte est suspendu. Contactez l\'administrateur.');
          setIsAccountBlocked(true);
        } else if (foundUser.has_face_id || foundUser.face_data) {
          setPendingUser(foundUser);
          setIsFaceLoginOpen(true);
        } else {
          setError('Veuillez vous connecter avec votre mot de passe.');
        }
      }
    } catch (err) {
      setError('Erreur de reconnexion');
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
    localStorage.setItem('bb_last_user', JSON.stringify({
      username: foundUser.username,
      full_name: foundUser.full_name,
      has_face_id: foundUser.has_face_id || !!foundUser.face_data
    }));
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

  if (initializing || statusLoading) {
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
          className={`w-full max-w-[1000px] grid grid-cols-1 ${!isBlocked || showAdminLogin ? 'md:grid-cols-2' : ''} bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(92,58,33,0.12)] overflow-hidden min-h-[600px] border border-[rgba(196,154,108,0.15)] relative`}
        >
          {/* Left Side - Visual/Brand (Visible only when NOT blocked or when admin login is requested) */}
          {/* Left Side - Visual/Brand (Always active, becomes full screen when blocked) */}
          <div className={`${(!isBlocked || showAdminLogin) ? 'hidden md:flex' : 'flex'} flex-col items-center justify-center relative p-12 bg-[#4a3426] text-white overflow-hidden h-full min-h-[600px] transition-all duration-500`}>
            <div className="absolute inset-0 opacity-[0.08] bg-[url('/logo.jpeg')] bg-cover bg-center grayscale mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="relative z-10 text-center space-y-8 max-w-sm">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-32 h-32 relative mx-auto rounded-[2rem] p-1 bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-2xl cursor-pointer"
                onDoubleClick={() => {
                  if (isBlocked && !showAdminLogin) setShowAdminLogin(true);
                }}
              >
                <Image src="/logo.jpeg" alt="Logo" fill className="rounded-[1.8rem] object-cover border-4 border-transparent" />
              </motion.div>

              {/* Show text ONLY if NOT blocked (or if admin login active) */}
              {(!isBlocked || showAdminLogin) && (
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-white">Expertise Bey</h2>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-[1px] w-6 bg-white/30"></div>
                    <p className="text-[#c69f6e] uppercase tracking-[0.4em] text-[8px] font-black italic">Hardware & Stock Intelligence</p>
                    <div className="h-[1px] w-6 bg-white/30"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form (Only visible when NOT blocked or unlocked) */}
          {(!isBlocked || showAdminLogin) && (
            <div className="p-8 md:p-14 flex flex-col justify-center relative">
              <AnimatePresence mode="wait">
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

                    {lastUser && lastUser.has_face_id && (
                      <div className="relative pt-8 mt-2">
                        <div className="absolute top-8 left-0 right-0 flex items-center justify-center">
                          <span className="bg-white px-4 text-[9px] font-black text-[#bba282] uppercase tracking-[0.2em] opacity-40">OU</span>
                        </div>
                        <div className="border-t border-[#e6dace] opacity-30 pt-8">
                          <button
                            type="button"
                            onClick={handleFacialReconnect}
                            disabled={loading || queryLoading}
                            className="w-full h-16 border-2 border-[#4a3426] text-[#4a3426] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#4a3426] hover:text-white transition-all flex items-center justify-center gap-3 group"
                          >
                            <Scan size={18} className="group-hover:scale-110 transition-transform" />
                            <span>Reconnexion Faciale ({lastUser.username})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </motion.div>
              </AnimatePresence>

            </div>
          )}
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
      <ChiffrePage role={user.role} onLogout={handleLogout} />
    </div>
  );
}


