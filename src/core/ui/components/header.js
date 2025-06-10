'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/main" 
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Главная
            </Link>
            {status === 'authenticated' && (
              session?.user?.role === 'WORKER' ? (
                <Link 
                  href="/find-job" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Найти работу
                </Link>
              ) : session?.user?.role === 'EMPLOYER' && (
                <Link 
                  href="/post-job" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Предложить работу
                </Link>
              )
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {status === 'authenticated' ? (
              <>
                {/* <Link 
                  href="/create-resume" 
                  className="px-6 py-2 bg-black text-white rounded-[15%] hover:bg-gray-800 transition-colors"
                >
                  Создать резюме
                </Link> */}
                <Link 
                  href="/profile" 
                  className="px-6 py-2 bg-black text-white rounded-[15%] hover:bg-gray-800 transition-colors"
                >
                  Личный кабинет
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-800"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                {/* <Link 
                  href="/create-resume" 
                  className="px-6 py-2 bg-black text-white rounded-[15%] hover:bg-gray-800 transition-colors"
                >
                  Создать резюме
                </Link> */}
                <Link 
                  href="/" 
                  className="px-6 py-2 bg-black text-white rounded-[15%] hover:bg-gray-800 transition-colors"
                >
                  Войти
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 