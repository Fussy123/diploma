import { NextResponse } from 'next/server'
import { applicationService } from '@/core/database/tables/application/application'
import { verify } from 'jsonwebtoken'

// GET /api/application/[identifier] - получение заявки по ID
export async function GET(request, { params }) {
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
    const application = await applicationService.getApplicationById(identifier)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Проверяем права доступа
    const isOwner = application.userId === decoded.userId
    const isVacancyOwner = application.vacancy.userId === decoded.userId

    if (!isOwner && !isVacancyOwner && decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'You do not have permission to view this application' },
        { status: 403 }
      )
    }

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

// PUT /api/application/[identifier] - обновление статуса заявки
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
    const { status } = await request.json()

    // Получаем заявку для проверки прав
    const application = await applicationService.getApplicationById(identifier)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем вакансии
    if (application.vacancy.userId !== decoded.userId && decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'You do not have permission to update this application' },
        { status: 403 }
      )
    }

    // Проверяем валидность статуса
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: PENDING, ACCEPTED, REJECTED' },
        { status: 400 }
      )
    }

    const updatedApplication = await applicationService.upsertApplication(identifier, {
      status
    })

    return NextResponse.json(updatedApplication)
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

// DELETE /api/application/[identifier] - удаление заявки
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

    // Получаем заявку для проверки прав
    const application = await applicationService.getApplicationById(identifier)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем заявки или вакансии
    const isOwner = application.userId === decoded.userId
    const isVacancyOwner = application.vacancy.userId === decoded.userId

    if (!isOwner && !isVacancyOwner && decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this application' },
        { status: 403 }
      )
    }

    await applicationService.deleteApplication(identifier)
    return NextResponse.json({ message: 'Application deleted successfully' })
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
