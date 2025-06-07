import { NextResponse } from 'next/server'
import { favoriteService } from '@/core/database/tables/favorite/favorite'
import { verify } from 'jsonwebtoken'

// DELETE /api/favorite/[identifier] - удаление элемента из избранного
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

    // Получаем избранное для проверки владельца
    const favorite = await favoriteService.getFavoriteById(identifier)
    
    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем избранного
    if (favorite.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this favorite' },
        { status: 403 }
      )
    }

    await favoriteService.deleteFavorite(identifier)
    return NextResponse.json({ message: 'Favorite deleted successfully' })
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
