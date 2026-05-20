'use client';

export default function ConfirmationScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 60px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>
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
          Confirmed
        </p>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(28px, 4.6vw, 38px)',
            lineHeight: 1.18,
            color: '#2D2A26',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            marginBottom: 24,
          }}
        >
          Your Rhythm Profile is set.
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: '#4a3f31',
            marginBottom: 28,
            maxWidth: 480,
          }}
        >
          Your first blueprint is being prepared right now. It will arrive in your inbox{' '}
          <strong style={{ color: '#2D2A26', fontWeight: 600 }}>within the next 30 to 60 minutes</strong>.
          Look out for an email from hello@neorishi.io. If it does not show up, check your spam
          folder, then reply to the welcome note and I will send it directly.
        </p>

        <div
          style={{
            border: '1px solid rgba(217, 201, 167, 0.6)',
            borderRadius: 14,
            padding: '20px 22px',
            background: 'rgba(253, 248, 238, 0.7)',
            marginBottom: 36,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8a7d6a',
            }}
          >
            Arriving
          </span>
          <span
            className="font-display"
            style={{
              fontSize: 22,
              color: '#2D2A26',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            Within 30-60 minutes
          </span>
        </div>

        <a
          href="https://maasik.neorishi.io"
          style={{
            display: 'inline-block',
            fontSize: 14,
            color: '#8a7d6a',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
            fontFamily: 'inherit',
          }}
        >
          Back to MAASIK home
        </a>
      </div>
    </div>
  );
}
