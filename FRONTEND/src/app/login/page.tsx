'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShieldCheck, ArrowRight, Sparkles, LogIn } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import { googleAuthBackend } from '@/lib/api';

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: (notification?: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '';

  const handleGoogleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response || !response.credential) {
        toast.error('Google authentication failed. No token received.');
        return;
      }

      try {
        setLoading(true);
        const data = await googleAuthBackend(response.credential);
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('token', data.token);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          toast.success(`Welcome back, ${String(data.user?.name || 'Developer')}!`);
          router.push('/dashboard');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google authentication failed.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const initGsi = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId || 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleGoogleCredentialResponse,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'filled_dark',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
          logo_alignment: 'left',
        });
      }
      setGsiLoaded(true);
    } catch (err) {
      console.warn('GSI init warning:', err);
    }
  }, [clientId, handleGoogleCredentialResponse]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        initGsi();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initGsi]);

  const handleCustomButtonClick = () => {
    if (!clientId) {
      toast.error('Google Client ID is missing in environment variables.');
      return;
    }
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In service is loading. Please try again.');
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGsi}
      />
      <div className="relative min-h-screen bg-[#070709] text-white flex flex-col justify-between font-sans selection:bg-cyan-500/20 selection:text-cyan-300 overflow-x-hidden">
        <ParticleBackground />
        <Navbar />

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-2xl bg-[#0f0f14]/80 border border-white/10 p-8 shadow-2xl backdrop-blur-xl hover:border-white/15 transition-all duration-300">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 shadow-lg backdrop-blur-md">
                <LogIn className="w-8 h-8 text-cyan-400" />
              </div>

              <div className="mt-4 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>x402 Unified Identity</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome to x402
                </h1>
                <p className="text-sm text-gray-400">
                  Authenticate with Google to access your developer portal & budget controls.
                </p>
              </div>

              <div className="mt-8 space-y-6">
                <div className="flex justify-center flex-col items-center min-h-[44px]">
                  <div ref={googleButtonRef} className="flex justify-center w-full" />
                  {!gsiLoaded && (
                    <button
                      onClick={handleCustomButtonClick}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
                    </button>
                  )}
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative px-3 bg-[#0f0f14] text-xs text-gray-500 uppercase tracking-wider">
                    Secured by JWT & OAuth 2.0
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-400 leading-relaxed">
                      Your identity token is verified server-side with Google OIDC endpoints, issuing a 7-day signed JWT for backend access.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <span>Skip to Dashboard preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
