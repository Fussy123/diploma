import { NextResponse } from 'next/server'
import { vacancyService } from '@/core/database/tables/vacancy/vacancy'
import { verify } from 'jsonwebtoken'

// GET /api/vacancy/[identifier] - получение вакансии по ID
export async function GET(request, { params }) {
  try {
    const { identifier } = params
    const vacancy = await vacancyService.getVacancyById(identifier)

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(vacancy)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/vacancy/[identifier] - обновление вакансии
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    const { identifier } = params
    const data = await request.json()

    // Получаем вакансию для проверки владельца
    const existingVacancy = await vacancyService.getVacancyById(identifier)
    
    if (!existingVacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем вакансии или работодателем
    if (existingVacancy.userId !== decoded.userId && decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'You do not have permission to update this vacancy' },
        { status: 403 }
      )
    }

    const vacancy = await vacancyService.upsertVacancy(identifier, data)
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

// DELETE /api/vacancy/[identifier] - удаление вакансии
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    const { identifier } = params

    // Получаем вакансию для проверки владельца
    const existingVacancy = await vacancyService.getVacancyById(identifier)
    
    if (!existingVacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем вакансии или работодателем
    if (existingVacancy.userId !== decoded.userId && decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this vacancy' },
        { status: 403 }
      )
    }

    await vacancyService.deleteVacancy(identifier)
    return NextResponse.json({ message: 'Vacancy deleted successfully' })
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
