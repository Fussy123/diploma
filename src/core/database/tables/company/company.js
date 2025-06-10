import prisma from '@/client/prisma'

export const companyService = {
  // Получение всех компаний
  async getAllCompanies() {
    return prisma.company.findMany({
      include: {
        user: true,
        vacancies: true
      }
    })
  },

  // Получение компании по ID
  async getCompanyById(id) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        user: true,
        vacancies: true
      }
    })
  },

  // Получение компаний пользователя
  async getCompaniesByUser(userId) {
    return prisma.company.findMany({
      where: { userId },
      include: {
        vacancies: true
      }
    })
  },

  // Создание компании
  async createCompany(data) {
    return prisma.company.create({
      data,
      include: {
        user: true
      }
    })
  },

  // Обновление компании
  async updateCompany(id, data) {
    return prisma.company.update({
      where: { id },
      data,
      include: {
        user: true
      }
    })
  },

  // Удаление компании
  async deleteCompany(id) {
    return prisma.company.delete({
      where: { id }
    })
  },

  // Поиск компаний по названию
  async searchCompaniesByName(name) {
    return prisma.company.findMany({
      where: {
        name: {
          contains: name
        }
      },
      include: {
        vacancies: true
      }
    })
  }
} 