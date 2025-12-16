'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await apiFetch<{ user: { role: string } }>('/auth/me');
        if (result.user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/panel');
        }
      } catch {
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-3">
            <svg className="w-6 h-6 text-white animate-pulse" viewBox="0 0 76 65" fill="currentColor">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <p className="text-xs text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
