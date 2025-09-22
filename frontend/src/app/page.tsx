import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard as per next.config.js
  redirect('/dashboard');
}
