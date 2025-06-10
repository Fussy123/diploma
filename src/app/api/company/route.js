import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

// GET /api/company - получение всех компаний
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении списка компаний' },
      { status: 500 }
    )
  }
}

// POST /api/company - создание новой компании
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Только работодатели могут создавать компании' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { name, description, website, location } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Название компании обязательно' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        website,
        location,
        userId: session.user.id
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании компании' },
      { status: 500 }
    )
  }
}
