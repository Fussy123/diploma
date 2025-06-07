import { NextResponse } from 'next/server'
import { companyService } from '@/core/database/tables/company/company'
import { verify } from 'jsonwebtoken'

// GET /api/company - получение всех компаний
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    let companies
    if (name) {
      companies = await companyService.searchCompaniesByName(name)
    } else {
      companies = await companyService.getAllCompanies()
    }

    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/company - создание новой компании
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET)
    
    // Проверяем, что пользователь является работодателем
    if (decoded.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'Only employers can create companies' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Проверяем обязательные поля
    const requiredFields = ['name', 'description']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Добавляем userId из токена
    const company = await companyService.upsertCompany(null, {
      ...data,
      userId: decoded.userId
    })

    return NextResponse.json(company)
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
