import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;  // 5 min budget for the whole batch

export async function GET(req: NextRequest) {
  try {
    // Verify Vercel cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Find users due today
    const { data: usersDue, error } = await supabase
      .from('maasik_v_users_due_today')
      .select('*');

    if (error) {
      console.error('View query failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!usersDue || usersDue.length === 0) {
      return NextResponse.json({ ok: true, due_count: 0, message: 'No users due today' });
    }

    // Fire generation for each user (parallel, but capped to avoid Doppio rate limits)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maasik.neorishi.io';
    const results: any[] = [];

    // V1.1: add retry-with-backoff for failed users in the batch.
    // Process in batches of 5
    for (let i = 0; i < usersDue.length; i += 5) {
      const batch = usersDue.slice(i, i + 5);
      const batchResults = await Promise.allSettled(
        batch.map(async (u: any) => {
          const res = await fetch(`${baseUrl}/api/generate-report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.CRON_SECRET || '',
            },
            body: JSON.stringify({ user_id: u.user_id }),
          });
          const data = await res.json();
          return { user_id: u.user_id, status: res.status, data };
        })
      );
      results.push(...batchResults.map((r, idx) => {
        if (r.status === 'fulfilled') return r.value;
        return { user_id: batch[idx].user_id, error: (r as PromiseRejectedResult).reason };
      }));
    }

    return NextResponse.json({
      ok: true,
      due_count: usersDue.length,
      results,
    });

  } catch (err: any) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
