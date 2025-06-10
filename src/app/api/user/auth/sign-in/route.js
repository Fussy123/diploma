import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/core/database/client/prisma'
import { sign } from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET || 'diploma-project-secret-key-2024-super-secure',
      { expiresIn: '1d' }
    )

    const response = NextResponse.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Устанавливаем cookie с токеном
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 часа
    })

    return response
  } catch (error) {
    console.error('Ошибка при входе:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе в систему' },
      { status: 500 }
    )
  }
} 