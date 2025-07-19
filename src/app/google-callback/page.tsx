import { Suspense } from 'react';
import CallbackClient from './CallbackClient';

export default function GoogleCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Suspense fallback={<p>Loading...</p>}>
        <CallbackClient />
      </Suspense>
    </div>
  );
}