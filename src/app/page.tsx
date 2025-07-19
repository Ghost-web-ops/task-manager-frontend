"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// تعريف شكل بيانات اللوحة
interface Board {
  id: string;
  title: string;
}

export default function HomePage() {
   const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
console.log('User:', user, 'Token:', token, 'Loading:', loading , 'Router:', router, 'Boards:', boards, 'New Board Title:', newBoardTitle, 'Is Loading:', isLoading, 'Error:', error);
  useEffect(() => {
    // 1. انتظر حتى ينتهي التحقق من المصادقة
    if (loading) return; 

    // 2. الآن فقط تحقق مما إذا كان المستخدم موجودًا
    if (!user) {
      router.push('/login');
      return;
    }


const fetchBoards = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/boards`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch boards');
        const data = await res.json();
        setBoards(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // فقط قم بجلب البيانات إذا كان التوكن موجودًا
    if (token) {
      fetchBoards();
    }
  }, [user, token, router, loading]);

  const handleCreateBoard = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newBoardTitle }),
      });

      if (!res.ok) {
        throw new Error('Failed to create board');
      }

      const newBoard = await res.json();
      setBoards(prevBoards => [newBoard, ...prevBoards]); // إضافة اللوحة الجديدة للقائمة
      setNewBoardTitle(''); // تفريغ حقل الإدخال
    } catch (err) {
      console.error('Create board error:', err);
      setError('Could not create board.');
    }
  };

 if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container p-4 mx-auto md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-200">My Boards</h1>

      {/* نموذج إنشاء لوحة جديدة */}
      <form onSubmit={handleCreateBoard} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title..."
          className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Create
        </button>
      </form>
      
      {error && <p className="text-red-500">{error}</p>}
      
      {/* عرض اللوحات */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

        {boards.length > 0 ? (
          boards.map(board => (
              <Link href={`/board/${board.id}`} key={board.id}>
                <div className="p-4 bg-white border rounded-lg shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg dark:hover:bg-gray-700">
                  <h2 className="font-bold text-gray-800 dark:text-gray-200">{board.title}</h2>
                </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any boards yet. Create one!</p>
        )}
      </div>
    </div>
  );
}