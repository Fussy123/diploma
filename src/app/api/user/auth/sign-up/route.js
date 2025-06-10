import { NextResponse } from 'next/server'
import { userService } from '@/core/database/tables/user/user'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '@/core/database/client/prisma'
import { customAlphabet } from 'nanoid'

// Создаем функцию для генерации ID
const generateId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 21)

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Полученные данные:', body)
    const { email, password, name, role } = body

    // Проверяем обязательные поля
    if (!email || !password || !name || !role) {
      console.log('Отсутствуют обязательные поля:', { email, password, name, role })
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Проверяем валидность роли
    if (!['WORKER', 'EMPLOYER'].includes(role)) {
      console.log('Некорректная роль:', role)
      return NextResponse.json(
        { error: 'Некорректная роль пользователя' },
        { status: 400 }
      )
    }

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Некорректный email:', email)
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      )
    }

    // Проверяем длину пароля
    if (password.length < 6) {
      console.log('Слишком короткий пароль')
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      console.log('Пользователь уже существует:', email)
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Пароль захеширован')

    try {
      // Генерируем ID для пользователя
      const userId = generateId()
      console.log('Сгенерирован ID пользователя:', userId)

      console.log('Начинаем создание пользователя с данными:', {
        id: userId,
        email,
        name,
        role,
        passwordLength: hashedPassword.length
      })

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          id: userId,
          email,
          password: hashedPassword,
          name,
          role,
        },
      })

      console.log('Пользователь создан:', user)

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
        process.env.NEXTAUTH_SECRET || 'diploma-project-secret-key-2024-super-secure',
        { expiresIn: '1d' }
      )

      console.log('Токен создан')

      const response = NextResponse.json({
        message: 'Пользователь успешно зарегистрирован',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }, { status: 201 })

      // Устанавливаем cookie с токеном
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 часа
      })

      console.log('Ответ подготовлен')
      return response
    } catch (prismaError) {
      console.error('Ошибка Prisma при создании пользователя:', prismaError)
      console.error('Детали ошибки:', {
        name: prismaError.name,
        message: prismaError.message,
        code: prismaError.code,
        meta: prismaError.meta
      })
      return NextResponse.json(
        { error: 'Ошибка при создании пользователя в базе данных' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error)
    console.error('Детали ошибки:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Ошибка при регистрации пользователя' },
      { status: 500 }
    )
  }
} 