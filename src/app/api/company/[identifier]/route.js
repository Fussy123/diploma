import { NextResponse } from 'next/server'
import { companyService } from '@/core/database/tables/company/company'
import { verify } from 'jsonwebtoken'

// GET /api/company/[identifier] - получение компании по ID
export async function GET(request, { params }) {
  try {
    const { identifier } = params
    const company = await companyService.getCompanyById(identifier)

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/company/[identifier] - обновление компании
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    const { identifier } = params
    const data = await request.json()

    // Получаем компанию для проверки владельца
    const existingCompany = await companyService.getCompanyById(identifier)
    
    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем компании
    if (existingCompany.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this company' },
        { status: 403 }
      )
    }

    const company = await companyService.upsertCompany(identifier, data)
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

// DELETE /api/company/[identifier] - удаление компании
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    const { identifier } = params

    // Получаем компанию для проверки владельца
    const existingCompany = await companyService.getCompanyById(identifier)
    
    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь является владельцем компании
    if (existingCompany.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this company' },
        { status: 403 }
      )
    }

    await companyService.deleteCompany(identifier)
    return NextResponse.json({ message: 'Company deleted successfully' })
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
