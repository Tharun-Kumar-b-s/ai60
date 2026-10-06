import { createHash } from 'node:crypto';
import { getSql } from './db';

export type RegisterInput = {
  name: string; email: string; college: string; branch: string; gradYear: number;
  phone?: string | null; score: number; tier: string; refCode?: string | null;
  ip: string; source?: string;
};

export function hashIp(ip: string) {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT ?? 'dev-salt')).digest('hex').slice(0, 32);
}

const ERRORS: Record<string, { status: number; message: string }> = {
  EMAIL_EXISTS: { status: 409, message: 'This email is already registered.' },
  RATE_LIMITED: { status: 429, message: 'Too many registrations from this network. Try again later.' },
  INVALID_INPUT: { status: 400, message: 'Please check your details.' },
  NO_WORKSHOP: { status: 503, message: 'Registration is not open yet.' },
};

export async function registerStudent(i: RegisterInput) {
  const sql = getSql();
  try {
    const [row] = await sql`
      select * from register_student(
        ${i.name}, ${i.email}, ${i.college}, ${i.branch}, ${i.gradYear},
        ${i.phone ?? null}, ${i.score}, ${i.tier}, ${i.refCode ?? null},
        ${hashIp(i.ip)}, ${i.source ?? 'direct'}, ${Number(process.env.MAX_REGS_PER_IP_PER_HOUR ?? 10)})`;
    return {
      ok: true as const,
      referralCode: row.out_referral_code as string,
      dashboardToken: row.out_dashboard_token as string,
      referralApplied: row.out_referral_applied as boolean,
    };
  } catch (e: any) {
    const known = Object.keys(ERRORS).find((k) => String(e?.message).includes(k));
    if (known) return { ok: false as const, ...ERRORS[known] };
    console.error('registerStudent failed', e?.message);
    return { ok: false as const, status: 500, message: 'Something went wrong. Please retry.' };
  }
}
