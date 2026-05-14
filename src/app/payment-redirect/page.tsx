'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function PaymentRedirectInner() {
  const params = useSearchParams();
  const email = params.get('email');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!email) {
      setError('We could not find your email. Please return to the form and try again.');
      return;
    }

    let cancelled = false;
    fetch(`/api/get-payment-link?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          setError(data.error || 'We could not generate your payment link. Please try again.');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Network error. Please check your connection and retry.');
      });
    return () => {
      cancelled = true;
    };
  }, [email, retryCount]);

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            MAASIK
          </p>
          <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mt-1">
            Secure checkout · Step 2 of 2
          </p>
        </div>

        <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
          <CardContent className="px-8 py-10">
            {error ? (
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="h-6 w-6" aria-hidden />
                </div>
                <h1 className="font-display text-[26px] leading-tight text-ink mt-5">
                  Something held us up.
                </h1>
                <p className="font-body text-[14px] text-ink-soft mt-2 leading-relaxed">
                  {error}
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setError(null);
                      setRetryCount((c) => c + 1);
                    }}
                    className="bg-terracotta text-cream hover:bg-terracotta-deep shadow-cta"
                  >
                    Try again
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-ink-soft hover:text-ink"
                  >
                    <a href="/">Return home</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <Loader2
                    className="h-5 w-5 text-terracotta animate-spin"
                    aria-hidden
                  />
                  <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase">
                    Preparing your checkout
                  </p>
                </div>
                <h1 className="font-display text-[32px] leading-[1.05] text-ink mt-4">
                  Almost there,{' '}
                  <em className="italic">one quiet moment</em>.
                </h1>
                <p className="font-body text-[14px] text-ink-soft mt-3 leading-relaxed">
                  We are generating a secure Razorpay payment link tied to your
                  blueprint. You will be redirected automatically.
                </p>

                <div className="mt-7 space-y-2.5">
                  <Skeleton className="h-3 w-full bg-sand/60" />
                  <Skeleton className="h-3 w-4/5 bg-sand/60" />
                  <Skeleton className="h-3 w-2/3 bg-sand/60" />
                </div>

                <div className="mt-7 flex items-center gap-2 border-t border-sand-deep/40 pt-4">
                  <ShieldCheck
                    className="h-4 w-4 text-favor shrink-0"
                    aria-hidden
                  />
                  <p className="font-body text-[12px] text-ink-faded leading-snug">
                    256-bit encrypted via Razorpay. We never see your card
                    details.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center font-mono text-[9px] text-ink-faded tracking-widest2 uppercase mt-6">
          ₹99 first month · Cancel anytime
        </p>
      </div>
    </main>
  );
}

function PaymentRedirectFallback() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
          <CardContent className="px-8 py-10 space-y-3">
            <Skeleton className="h-4 w-32 bg-sand/60" />
            <Skeleton className="h-8 w-full bg-sand/60" />
            <Skeleton className="h-3 w-4/5 bg-sand/60" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function PaymentRedirect() {
  return (
    <Suspense fallback={<PaymentRedirectFallback />}>
      <PaymentRedirectInner />
    </Suspense>
  );
}
