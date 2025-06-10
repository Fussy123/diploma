import { NextResponse } from 'next/server'
import { favoriteService } from '@/core/database/tables/favorite/favorite'
import { verify } from 'jsonwebtoken'

// GET /api/favorite - получение избранных элементов пользователя
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    const favorites = await favoriteService.getUserFavorites(decoded.userId)

    return NextResponse.json(favorites)
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

// POST /api/favorite - добавление элемента в избранное
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
    const { vacancyId, resumeId } = await request.json()

    // Проверяем, что передан хотя бы один ID
    if (!vacancyId && !resumeId) {
      return NextResponse.json(
        { error: 'Either vacancyId or resumeId must be provided' },
        { status: 400 }
      )
    }

    // Проверяем, что не переданы оба ID одновременно
    if (vacancyId && resumeId) {
      return NextResponse.json(
        { error: 'Cannot add both vacancy and resume to favorites at once' },
        { status: 400 }
      )
    }

    let favorite
    if (vacancyId) {
      favorite = await favoriteService.addVacancyToFavorites(decoded.userId, vacancyId)
    } else {
      favorite = await favoriteService.addResumeToFavorites(decoded.userId, resumeId)
    }

    return NextResponse.json(favorite)
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
