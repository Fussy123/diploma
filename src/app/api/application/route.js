import { NextResponse } from 'next/server'
import { applicationService } from '@/core/database/tables/application/application'
import { verify } from 'jsonwebtoken'

// GET /api/application - получение всех заявок
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    const { searchParams } = new URL(request.url)
    const vacancyId = searchParams.get('vacancyId')

    let applications
    if (vacancyId) {
      // Проверяем, что пользователь является владельцем вакансии
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId }
      })

      if (!vacancy) {
        return NextResponse.json(
          { error: 'Vacancy not found' },
          { status: 404 }
        )
      }

      if (vacancy.userId !== decoded.userId && decoded.role !== 'EMPLOYER') {
        return NextResponse.json(
          { error: 'You do not have permission to view these applications' },
          { status: 403 }
        )
      }

      applications = await applicationService.getApplicationsByVacancy(vacancyId)
    } else {
      // Если нет vacancyId, возвращаем заявки пользователя
      applications = await applicationService.getApplicationsByUser(decoded.userId)
    }

    return NextResponse.json(applications)
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

// POST /api/application - создание новой заявки
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
    
    // Проверяем, что пользователь не является работодателем
    if (decoded.role === 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Employers cannot create applications' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Проверяем обязательные поля
    const requiredFields = ['vacancyId', 'resumeId']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Проверяем, что резюме принадлежит пользователю
    const resume = await prisma.resume.findUnique({
      where: { id: data.resumeId }
    })

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    if (resume.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only use your own resume' },
        { status: 403 }
      )
    }

    // Проверяем, что вакансия существует
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: data.vacancyId }
    })

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      )
    }

    // Добавляем userId из токена
    const application = await applicationService.upsertApplication(null, {
      ...data,
      userId: decoded.userId,
      status: 'PENDING' // Начальный статус заявки
    })

    return NextResponse.json(application)
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
