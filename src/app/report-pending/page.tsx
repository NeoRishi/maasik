'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, BookOpen, Gift, Loader2, Mail, Sparkles, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;
const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/D5SPmDOCsVqJZ7ISV9icAm';

type Status =
  | { status: 'pending' | 'generating' | 'unknown' }
  | { status: 'sent' | 'delivered' | 'opened'; pdf_url: string | null; vedic_month: string; edition_number: number }
  | { status: 'failed' };

type ViewState = 'waiting' | 'ready' | 'failed' | 'timeout';

function ReportPendingInner() {
  const params = useSearchParams();
  const paymentId = params.get('payment_id');

  const [view, setView] = useState<ViewState>('waiting');
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setView('failed');
      return;
    }

    const start = Date.now();
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/report-status?payment_id=${encodeURIComponent(paymentId!)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data: Status = await res.json();
        if (cancelled) return;
        setStatus(data);

        if (data.status === 'sent' || data.status === 'delivered' || data.status === 'opened') {
          setView('ready');
          return;
        }
        if (data.status === 'failed') {
          setView('failed');
          return;
        }
        if (Date.now() - start > POLL_TIMEOUT_MS) {
          setView('timeout');
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  if (view === 'ready' && status && 'pdf_url' in status) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">MAASIK</p>
            <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mt-1">
              Your blueprint is ready
            </p>
          </div>
          <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
            <CardContent className="px-8 py-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-favor/10 text-favor">
                <BookOpen className="h-6 w-6" aria-hidden />
              </div>
              <h1 className="font-display text-[28px] leading-tight text-ink mt-5">
                Your <em className="italic">{status.vedic_month}</em> blueprint is ready.
              </h1>
              <p className="font-body text-[14px] text-ink-soft mt-3 leading-relaxed">
                Edition {status.edition_number}. A copy has also been sent to your inbox.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {status.pdf_url ? (
                  <Button
                    asChild
                    className="bg-terracotta text-cream hover:bg-terracotta-deep shadow-cta"
                  >
                    <a href={status.pdf_url} target="_blank" rel="noopener noreferrer">
                      Open your blueprint
                    </a>
                  </Button>
                ) : (
                  <p className="font-body text-[12px] text-ink-faded">
                    PDF link is being finalised. Check your inbox in the next few minutes.
                  </p>
                )}
                <Button variant="ghost" asChild className="text-ink-soft hover:text-ink">
                  <a href="/">Back to home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (view === 'failed' || view === 'timeout') {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
            <CardContent className="px-8 py-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" aria-hidden />
              </div>
              <h1 className="font-display text-[24px] leading-tight text-ink mt-5">
                We hit a snag.
              </h1>
              <p className="font-body text-[14px] text-ink-soft mt-3 leading-relaxed">
                Your payment went through; the blueprint generation is taking longer than usual.
                Our team has been alerted and you will hear from us within the hour at the email
                you signed up with.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild className="bg-terracotta text-cream hover:bg-terracotta-deep shadow-cta">
                  <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
                    Reach us on WhatsApp
                  </a>
                </Button>
                <Button variant="ghost" asChild className="text-ink-soft hover:text-ink">
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
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">MAASIK</p>
          <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mt-1">
            Your blueprint is being prepared
          </p>
        </div>
        <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
          <CardContent className="px-8 py-10 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            </div>
            <h1 className="font-display text-[26px] leading-tight text-ink mt-5">
              Calibrating your <em className="italic">monthly</em> blueprint.
            </h1>
            <p className="font-body text-[14px] text-ink-soft mt-3 leading-relaxed">
              This page will update on its own. Typically 4 to 7 minutes; up to 30 minutes during
              first-edition runs. You can leave this tab open or come back later.
            </p>
            <div className="mt-6 flex items-start gap-2 border-t border-sand-deep/40 pt-4 text-left">
              <Mail className="h-4 w-4 text-favor shrink-0 mt-0.5" aria-hidden />
              <p className="font-body text-[12px] text-ink-faded leading-snug">
                A copy will also land in your inbox once it is ready. Check spam if you do not see
                it within an hour.
              </p>
            </div>

            <div className="mt-6 rounded-md border border-terracotta/30 bg-cream px-5 py-5 text-left">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-terracotta" aria-hidden />
                <p className="font-mono text-[10px] text-terracotta tracking-widest2 uppercase">
                  Meanwhile · Join the NeoRishi Tribe
                </p>
              </div>
              <p className="font-display text-[20px] leading-tight text-ink mt-3">
                While you wait, step into the <em className="italic">inner circle</em>.
              </p>
              <ul className="mt-3 space-y-2 font-body text-[13px] text-ink-soft leading-relaxed">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-terracotta shrink-0 mt-0.5" aria-hidden />
                  Stay updated with the latest from NeoRishi
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="h-4 w-4 text-terracotta shrink-0 mt-0.5" aria-hidden />
                  Early access to upcoming NeoRishi products in beta
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ReportPendingFallback() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="border-sand-deep/60 bg-cream-warm shadow-report">
        <CardContent className="px-8 py-10">
          <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase">
            Loading…
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function ReportPending() {
  return (
    <Suspense fallback={<ReportPendingFallback />}>
      <ReportPendingInner />
    </Suspense>
  );
}
