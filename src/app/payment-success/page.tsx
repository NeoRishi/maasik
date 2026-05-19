'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Gift,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/D5SPmDOCsVqJZ7ISV9icAm';

function PaymentSuccessInner() {
  const params = useSearchParams();
  const status = params.get('razorpay_payment_link_status');
  const paymentId = params.get('razorpay_payment_id');
  const isPaid = status === 'paid' && Boolean(paymentId);

  if (!isPaid) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
              MAASIK
            </p>
            <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mt-1">
              Payment status
            </p>
          </div>

          <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
            <CardContent className="px-8 py-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" aria-hidden />
              </div>
              <h1 className="font-display text-[26px] leading-tight text-ink mt-5">
                Payment didn’t go through.
              </h1>
              <p className="font-body text-[14px] text-ink-soft mt-2 leading-relaxed">
                Razorpay reported the link as{' '}
                <em className="italic">{status || 'incomplete'}</em>. No charge
                was made. You can try again from the onboarding form.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  asChild
                  className="bg-terracotta text-cream hover:bg-terracotta-deep shadow-cta"
                >
                  <a href="/onboarding">Return to onboarding</a>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="text-ink-soft hover:text-ink"
                >
                  <a href="/">Back to home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            MAASIK
          </p>
          <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mt-1">
            Welcome · You’re in
          </p>
        </div>

        <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
          <CardContent className="px-8 py-10">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-favor" aria-hidden />
              <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase">
                Payment received
              </p>
            </div>
            <h1 className="font-display text-[32px] leading-[1.05] text-ink mt-4">
              Namaste. Your <em className="italic">blueprint</em> is being prepared.
            </h1>
            <p className="font-body text-[14px] text-ink-soft mt-3 leading-relaxed">
              Your first-month payment is confirmed. We’re generating your
              personalised Vedic nutrition blueprint right now. It will arrive in
              your inbox within the next 30 to 60 minutes.
            </p>

            <div className="mt-7 rounded-md border border-terracotta/30 bg-cream px-5 py-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-terracotta" aria-hidden />
                <p className="font-mono text-[10px] text-terracotta tracking-widest2 uppercase">
                  One last step · Join the NeoRishi Tribe
                </p>
              </div>
              <p className="font-display text-[20px] leading-tight text-ink mt-3">
                The <em className="italic">inner circle</em> for paid members.
              </p>
              <ul className="mt-3 space-y-2 font-body text-[13px] text-ink-soft leading-relaxed">
                <li className="flex items-start gap-2">
                  <Gift className="h-4 w-4 text-terracotta shrink-0 mt-0.5" aria-hidden />
                  Bonus gifts dropped only to community members
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-terracotta shrink-0 mt-0.5" aria-hidden />
                  Beta access to future features before anyone else
                </li>
              </ul>
              <Button
                asChild
                className="mt-5 w-full bg-terracotta text-cream hover:bg-terracotta-deep shadow-cta"
              >
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join the WhatsApp community →
                </a>
              </Button>
              <p className="font-mono text-[9px] text-ink-faded tracking-widest2 uppercase text-center mt-3">
                Free · For paid members only
              </p>
            </div>

            <div className="mt-6 flex items-start gap-2 border-t border-sand-deep/40 pt-4">
              <Mail className="h-4 w-4 text-favor shrink-0 mt-0.5" aria-hidden />
              <p className="font-body text-[12px] text-ink-faded leading-snug">
                Watch your inbox (and spam folder, just in case) over the next
                30-60 minutes for an email from MAASIK by NeoRishi with your
                blueprint attached.
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-favor shrink-0" aria-hidden />
              <p className="font-body text-[12px] text-ink-faded leading-snug">
                Payment ref · <span className="font-mono">{paymentId}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            asChild
            className="text-ink-soft hover:text-ink"
          >
            <a href="/">Back to home</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

function PaymentSuccessFallback() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
          <CardContent className="px-8 py-10">
            <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase">
              Loading…
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
