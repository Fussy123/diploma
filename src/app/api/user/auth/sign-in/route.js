import { NextResponse } from 'next/server'
import { userService } from '@/core/database/tables/user/user'
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

    const user = await userService.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // TODO: Добавить проверку пароля через bcrypt
    // const isValidPassword = await bcrypt.compare(password, user.password)
    // if (!isValidPassword) {
    //   return NextResponse.json(
    //     { error: 'Invalid password' },
    //     { status: 401 }
    //   )
    // }

    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
} 