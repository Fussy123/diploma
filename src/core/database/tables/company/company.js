import prisma from '../../client/prisma'

export const companyService = {
  // Получение компании по ID
  async getCompanyById(id) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        vacancies: true
      }
    })
  },

  // Получение всех компаний
  async getAllCompanies() {
    return prisma.company.findMany({
      include: {
        vacancies: true
      }
    })
  },

  // Создание или обновление компании
  async upsertCompany(id, data) {
    return prisma.company.upsert({
      where: { id },
      update: data,
      create: data
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