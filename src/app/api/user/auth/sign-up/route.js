import { NextResponse } from 'next/server'
import { userService } from '@/core/database/tables/user/user'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    // Проверяем обязательные поля
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Проверяем валидность роли
    if (!['WORKER', 'EMPLOYER'].includes(role)) {
      return NextResponse.json(
        { error: 'Некорректная роль пользователя' },
        { status: 400 }
      )
    }

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      )
    }

    // Проверяем длину пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await userService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаем пользователя
    const user = await userService.upsertUser(email, {
      email,
      name,
      role,
      password: hashedPassword
    })

    if (!user) {
      throw new Error('Ошибка при создании пользователя')
    }

    // Создаем JWT токен
    const token = sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
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
    console.error('Error in sign-up:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
} 