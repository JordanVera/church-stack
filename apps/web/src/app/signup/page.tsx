import { redirect } from 'next/navigation';

/** Church signup lives at /onboard — keep /signup as a stable marketing URL. */
export default function SignupPage() {
  redirect('/onboard');
}
