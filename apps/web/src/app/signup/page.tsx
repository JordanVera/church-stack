import { redirect } from 'next/navigation';
import z from 'zod';

/** Church signup lives at /onboard — keep /signup as a stable marketing URL. */
export default function SignupPage() {
  redirect('/onboard');
}
