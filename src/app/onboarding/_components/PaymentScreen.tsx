'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { OnboardingDraft } from '../_lib/validation';
import { validateAll } from '../_lib/validation';
import RazorpayScript from './RazorpayScript';

interface PaymentScreenProps {
  answers: OnboardingDraft;
  onAnswer: (field: string, value: unknown) => void;
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
    };
  }
}

export default function PaymentScreen({ answers, onAnswer, onPaymentSuccess }: PaymentScreenProps) {
  const [email, setEmail] = useState<string>((answers.email as string | null) ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResume, setShowResume] = useState(false);
  // Keep email in sync if user edited it earlier.
  const initialEmailHydrated = useRef(false);
  useEffect(() => {
    if (initialEmailHydrated.current) return;
    initialEmailHydrated.current = true;
    if (answers.email && typeof answers.email === 'string') setEmail(answers.email);
  }, [answers.email]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handlePay() {
    setError(null);
    setShowResume(false);

    // Push the latest email back into the draft before submitting.
    if (email !== answers.email) onAnswer('email', email);

    // Validate the whole payload server-style before posting.
    const draftWithEmail = { ...answers, email } as OnboardingDraft;
    const result = validateAll(draftWithEmail);
    if (!result.ok) {
      const firstField = Object.keys(result.errors)[0];
      const firstMsg = result.errors[firstField];
      setError(
        firstMsg
          ? `${firstMsg} Please go back and fill in any missing fields.`
          : 'Some answers look incomplete. Please review the previous steps.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.payload,
          primary_goal_other: draftWithEmail.primary_goal_other ?? null,
          gender_other: draftWithEmail.gender_other ?? null,
          medical_conditions_other: draftWithEmail.medical_conditions_other ?? null,
          allergies_other: draftWithEmail.allergies_other ?? null,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        details?: string;
        issues?: { path: string; message: string }[];
        order_id?: string;
        amount?: number;
        currency?: string;
        key_id?: string;
        user_id?: string;
        // Backward-compat: hosted Payment Link URL if server has not yet been switched to Orders.
        payment_url?: string;
      };

      if (!res.ok || !body?.ok) {
        const detail = body?.details
          ? ` (${body.details})`
          : body?.issues?.length
            ? ` (${body.issues[0].path}: ${body.issues[0].message})`
            : '';
        setError(`${body?.error || `Something went wrong (${res.status}).`}${detail}`);
        setSubmitting(false);
        return;
      }

      if (body.order_id && body.key_id && body.amount && body.currency) {
        await openRazorpay({
          orderId: body.order_id,
          keyId: body.key_id,
          amount: body.amount,
          currency: body.currency,
          email,
          name: (answers.full_name as string | null) ?? '',
          onSuccess: () => onPaymentSuccess(),
          onDismiss: () => {
            setSubmitting(false);
            setShowResume(true);
          },
        });
        return;
      }

      if (body.payment_url) {
        // Legacy fallback path: hosted Payment Link redirect.
        window.location.href = body.payment_url;
        return;
      }

      setError('Could not initialise payment. Please try again in a moment.');
      setSubmitting(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <RazorpayScript />

      {submitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(250, 243, 231, 0.94)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 60,
            padding: 24,
            textAlign: 'center',
          }}
          aria-live="polite"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '1.5px solid #C84B31',
              marginBottom: 28,
            }}
            aria-hidden
          />
          <p style={{ fontSize: 16, color: '#4a3f31', margin: 0, marginBottom: 6 }}>
            Saving your responses.
          </p>
          <p style={{ fontSize: 14, color: '#8a7d6a', margin: 0 }}>
            Preparing your secure checkout.
          </p>
        </motion.div>
      )}

      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 560,
          margin: '0 auto',
          padding: '120px 24px 80px',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8a7d6a',
            marginBottom: 20,
          }}
        >
          Your first month
        </p>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(26px, 4.2vw, 34px)',
            lineHeight: 1.2,
            color: '#2D2A26',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            marginBottom: 28,
          }}
        >
          Your first blueprint.
        </h1>

        <div
          style={{
            border: '1px solid rgba(217, 201, 167, 0.6)',
            borderRadius: 14,
            padding: '22px 22px 24px',
            background: 'rgba(253, 248, 238, 0.7)',
            marginBottom: 28,
          }}
        >
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: '#4a3f31',
              marginBottom: 6,
            }}
          >
            Monthly nutrition blueprint, calibrated to your Rhythm Profile.
          </p>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: '#4a3f31',
              marginBottom: 18,
            }}
          >
            Delivered on the first day of each Vedic month.
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 16,
                color: '#8a7d6a',
                textDecoration: 'line-through',
              }}
            >
              ₹299/month
            </span>
            <span
              className="font-display"
              style={{
                fontSize: 32,
                color: '#2D2A26',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              ₹99
            </span>
            <span style={{ fontSize: 14, color: '#4a3f31' }}>for your first month</span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: '#8a7d6a',
              marginTop: 10,
            }}
          >
            ₹299/month from month two onward. Cancel anytime.
          </p>
        </div>

        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#8a7d6a',
            marginBottom: 8,
          }}
        >
          Email for delivery
        </label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          style={{
            width: '100%',
            height: 56,
            padding: '0 18px',
            borderRadius: 12,
            border: '1.5px solid #d9c9a7',
            background: '#fdf8ee',
            color: '#2D2A26',
            fontSize: 16,
            fontFamily: 'inherit',
            outline: 'none',
            marginBottom: 18,
          }}
        />

        {error && (
          <p
            role="alert"
            style={{
              padding: '12px 14px',
              border: '1px solid rgba(107, 42, 26, 0.4)',
              background: '#fbf0ec',
              color: '#6b2a1a',
              fontSize: 14,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={!validEmail || submitting}
          style={{
            width: '100%',
            background: !validEmail || submitting ? 'rgba(200, 75, 49, 0.45)' : '#C84B31',
            color: '#FAF3E7',
            padding: '16px 24px',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.02em',
            border: 'none',
            cursor: !validEmail || submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: !validEmail || submitting ? 'none' : '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
            transition: 'background 180ms ease, box-shadow 180ms ease',
          }}
        >
          {submitting ? 'Opening payment...' : showResume ? 'Resume payment' : 'Pay ₹99 with Razorpay'}
        </button>

        <p
          style={{
            marginTop: 14,
            fontSize: 12,
            color: '#8a7d6a',
            textAlign: 'center',
          }}
        >
          Secure payment by Razorpay. We never store your card details.
        </p>

        <p
          style={{
            marginTop: 40,
            fontSize: 12,
            color: '#8a7d6a',
            lineHeight: 1.55,
            textAlign: 'center',
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          MAASIK provides educational lifestyle guidance grounded in traditional Indian nutrition systems. It is not medical advice and is not a substitute for consultation with a qualified healthcare provider.
        </p>
      </div>
    </div>
  );
}

interface OpenRazorpayArgs {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  email: string;
  name: string;
  onSuccess: () => void;
  onDismiss: () => void;
}

async function openRazorpay(args: OpenRazorpayArgs) {
  // Wait for Razorpay script if it has not finished loading yet.
  const start = Date.now();
  while (typeof window.Razorpay === 'undefined') {
    if (Date.now() - start > 8000) {
      throw new Error('Razorpay did not load in time.');
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  const RazorpayCtor = window.Razorpay!;
  const rz = new RazorpayCtor({
    key: args.keyId,
    order_id: args.orderId,
    amount: args.amount,
    currency: args.currency,
    name: 'MAASIK',
    description: 'First month blueprint',
    prefill: {
      email: args.email,
      name: args.name,
    },
    theme: { color: '#C84B31' },
    handler: () => args.onSuccess(),
    modal: { ondismiss: () => args.onDismiss() },
  });
  rz.open();
}
