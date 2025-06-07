'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900">
              Главная
            </Link>
            <Link href="/main" className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900">
              Main
            </Link>
          </div>
          
          <div className="flex items-center">
            {status === 'authenticated' ? (
              <>
                <Link href="/profile" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                  Личный кабинет
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-red-600 hover:text-red-800"
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 