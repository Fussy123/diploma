import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Только работодатели могут просматривать отклики' },
        { status: 403 }
      );
    }

    // Получаем все вакансии работодателя
    const vacancies = await prisma.vacancy.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const vacancyIds = vacancies.map(v => v.id);

    // Получаем все отклики на эти вакансии
    const applications = await prisma.application.findMany({
      where: {
        vacancyId: { in: vacancyIds }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        vacancy: {
          select: {
            id: true,
            title: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении откликов' },
      { status: 500 }
    );
  }
} 