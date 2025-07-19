"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
export const dynamic = 'force-dynamic';
export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // إذا وجدنا التوكن في الرابط، قم بحفظه
      login(token);
      // ثم قم بتوجيه المستخدم إلى الصفحة الرئيسية
      router.push('/');
    } else {
      // إذا لم يوجد توكن، هناك مشكلة، أعده لصفحة الدخول
      router.push('/login');
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Authenticating, please wait...</p>
    </div>
  );
}