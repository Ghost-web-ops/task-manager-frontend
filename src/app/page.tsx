"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Save, X } from 'lucide-react';


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
  
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    if (loading) return; 
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchBoards = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/boards`, { // ✅ استخدام المتغير الصحيح
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

    if (loading) {
      return; // انتظر انتهاء التحقق من المصادقة
    }
    if (!user) {
      router.push('/login'); // إذا لا يوجد مستخدم، اذهب لصفحة الدخول
    } else {
      fetchBoards(); // إذا كان هناك مستخدم، اجلب البيانات
    }
  }, [user, token, loading, router, apiBaseUrl]);
  const handleCreateBoard = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !token) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/boards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title: newBoardTitle }),
        });
        if (!res.ok) throw new Error('Failed to create board');
        const newBoard = await res.json();
        setBoards(prevBoards => [newBoard, ...prevBoards]);
        setNewBoardTitle('');
    } catch (err) {
        console.error('Create board error:', err);
        setError('Could not create board.');
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board and all its contents?')) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/boards/${boardId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete board');
        setBoards(prev => prev.filter(board => board.id !== boardId));
    } catch (err) {
        setError('Could not delete board.');
        console.error(err);
    }
  };

  const handleUpdateBoard = async (boardId: string) => {
    if (!editingTitle.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: editingTitle }),
      });
      if (!res.ok) throw new Error('Failed to update board');
      const updatedBoard = await res.json();
      setBoards(prev => prev.map(b => b.id === boardId ? updatedBoard : b));
      setEditingBoardId(null);
    } catch (err) {
      setError('Could not update board.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (editingBoardId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingBoardId]);

  if (loading || isLoading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  }
  
  if (!user) {
    return null;
  }
  
  return (
   <div className="container p-4 mx-auto md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-200">My Boards</h1>
      
      {/* The form to create a new board */}
      <form onSubmit={handleCreateBoard} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title..."
          className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Create
        </button>
      </form>
      
      {error && <p className="my-4 text-red-500">{error}</p>}
      
      {/* Grid of boards with updated edit UI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {boards.map(board => (
          <div key={board.id} className="relative p-4 bg-white border rounded-lg shadow group dark:bg-gray-800 dark:border-gray-700">
            {editingBoardId === board.id ? (
              <div className="flex flex-col gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateBoard(board.id)}
                  className="w-full text-lg font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none dark:text-gray-200"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingBoardId(null)} className="p-1 text-sm text-gray-600 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"><X size={16} /> Cancel</button>
                  <button onClick={() => handleUpdateBoard(board.id)} className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"><Save size={16} /> Save</button>
                </div>
              </div>
            ) : (
              <div>
                <Link href={`/board/${board.id}`} className="block w-full h-full min-h-[40px]">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{board.title}</h2>
                </Link>
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 sm:opacity-100">
                  <button 
                    onClick={() => { setEditingBoardId(board.id); setEditingTitle(board.title); }} 
                    className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600"
                    aria-label="Edit board"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteBoard(board.id)} 
                    className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-600"
                    aria-label="Delete board"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
        
        {!isLoading && boards.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            You don&apos;t have any boards yet. Create one to get started!
          </p>
        )}
      </div>
        ))}
      </div>
    </div>
  );
}