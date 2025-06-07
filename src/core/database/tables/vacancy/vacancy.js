import prisma from '../../client/prisma'

export const vacancyService = {
  // Получение вакансии по ID
  async getVacancyById(id) {
    return prisma.vacancy.findUnique({
      where: { id },
      include: {
        company: true,
        user: true
      }
    })
  },

  // Получение всех вакансий
  async getAllVacancies() {
    return prisma.vacancy.findMany({
      include: {
        company: true,
        user: true
      }
    })
  },

  // Создание или обновление вакансии
  async upsertVacancy(id, data) {
    return prisma.vacancy.upsert({
      where: { id },
      update: data,
      create: data
    })
  },
  
  // Удаление вакансии
  async deleteVacancy(id) {
    return prisma.vacancy.delete({
      where: { id }
    })
  },

  // Получение вакансий по компании
  async getVacanciesByCompany(companyId) {
    return prisma.vacancy.findMany({
      where: { companyId },
      include: {
        company: true,
        user: true
      }
    })
  },

  // Получение вакансий по пользователю
  async getVacanciesByUser(userId) {
    return prisma.vacancy.findMany({
      where: { userId },
      include: {
        company: true,
        user: true
      }
    })
  }
} 