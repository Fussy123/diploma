import { NextResponse } from 'next/server'
import { resumeService } from '@/core/database/tables/resume/resume'
import { verify } from 'jsonwebtoken'

// GET /api/resume/[identifier] - получение резюме по ID
export async function GET(request, { params }) {
  try {
    const { identifier } = params
    const resume = await resumeService.getResumeById(identifier)

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(resume)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/resume/[identifier] - обновление резюме
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    const { identifier } = params
    const data = await request.json()

    // Получаем резюме для проверки владельца
    const existingResume = await resumeService.getResumeById(identifier)
    
    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем резюме
    if (existingResume.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this resume' },
        { status: 403 }
      )
    }

    const resume = await resumeService.upsertResume(identifier, data)
    return NextResponse.json(resume)
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

// DELETE /api/resume/[identifier] - удаление резюме
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    const { identifier } = params

    // Получаем резюме для проверки владельца
    const existingResume = await resumeService.getResumeById(identifier)
    
    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем резюме
    if (existingResume.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this resume' },
        { status: 403 }
      )
    }

    await resumeService.deleteResume(identifier)
    return NextResponse.json({ message: 'Resume deleted successfully' })
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
