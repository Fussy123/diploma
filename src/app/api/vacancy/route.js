import { NextResponse } from 'next/server'
import { vacancyService } from '@/core/database/tables/vacancy/vacancy'
import { verify } from 'jsonwebtoken'

// GET /api/vacancy - получение всех вакансий
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const userId = searchParams.get('userId')

    let vacancies
    if (companyId) {
      vacancies = await vacancyService.getVacanciesByCompany(companyId)
    } else if (userId) {
      vacancies = await vacancyService.getVacanciesByUser(userId)
    } else {
      vacancies = await vacancyService.getAllVacancies()
    }

    return NextResponse.json(vacancies)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/vacancy - создание новой вакансии
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    
    // Проверяем, что пользователь является работодателем
    if (decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Only employers can create vacancies' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Проверяем обязательные поля
    const requiredFields = ['title', 'description', 'companyId']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Добавляем userId из токена
    const vacancy = await vacancyService.upsertVacancy(null, {
      ...data,
      userId: decoded.userId
    })

    return NextResponse.json(vacancy)
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
