import { NextResponse } from 'next/server'
import { resumeService } from '@/core/database/tables/resume/resume'
import { verify } from 'jsonwebtoken'

// GET /api/resume - получение всех резюме
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const skills = searchParams.get('skills')

    let resumes
    if (userId) {
      resumes = await resumeService.getUserResumes(userId)
    } else if (skills) {
      resumes = await resumeService.searchResumesBySkills(skills)
    } else {
      resumes = await resumeService.getAllResumes()
    }

    return NextResponse.json(resumes)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/resume - создание нового резюме
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    
    // Проверяем, что пользователь не является работодателем
    if (decoded.role === 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Employers cannot create resumes' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Проверяем обязательные поля
    const requiredFields = ['title', 'description', 'skills']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Добавляем userId из токена
    const resume = await resumeService.upsertResume(null, {
      ...data,
      userId: decoded.userId
    })

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
