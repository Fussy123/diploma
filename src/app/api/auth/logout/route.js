import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    // Здесь можно добавить дополнительную логику очистки сессии
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
} 