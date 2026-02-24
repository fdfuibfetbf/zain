'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Registration is dedicated to the user panel. Redirect to the panel registration page.
 */
export default function RegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/panel/register');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--foreground-muted)]">Redirecting to create account...</p>
      </div>
    </div>
  );
}
