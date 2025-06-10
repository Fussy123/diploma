import { NextResponse } from 'next/server'
import { vacancyService } from '@/core/database/tables/vacancy/vacancy'
import { verify } from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// GET /api/vacancy - получение всех вакансий
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

    let vacancies;
    if (companyId) {
      vacancies = await vacancyService.getVacanciesByCompany(companyId);
    } else if (userId) {
      vacancies = await vacancyService.getVacanciesByUser(userId);
    } else {
      vacancies = await vacancyService.getAllVacancies();
    }

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка вакансий' },
      { status: 500 }
    );
  }
}

// POST /api/vacancy - создание новой вакансии
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, salary, location, requirements, companyId } = data

    if (!title || !description || !companyId) {
      return NextResponse.json(
        { error: 'Название, описание и компания обязательны' },
        { status: 400 }
      )
    }

    const vacancy = await vacancyService.createVacancy({
      title,
      description,
      salary: salary ? parseInt(salary) : null,
      location,
      requirements,
      companyId,
      userId: session.user.id
    })

    return NextResponse.json(vacancy)
  } catch (error) {
    console.error('Error creating vacancy:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании вакансии' },
      { status: 500 }
    )
  }
}
