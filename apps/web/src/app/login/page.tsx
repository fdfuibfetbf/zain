'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login is dedicated to the user panel. Redirect to the panel login page.
 */
export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/panel/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--foreground-muted)]">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
