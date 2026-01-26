import { auth as betterAuth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function auth() {
  return await betterAuth.api.getSession({
    headers: await headers(),
  });
}
