import prisma from '@/lib/prisma'

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
  },

  // Создание вакансии
  async createVacancy(data) {
    return prisma.vacancy.create({
      data,
      include: {
        company: true,
        user: true
      }
    })
  },

  // Обновление вакансии
  async updateVacancy(id, data) {
    return prisma.vacancy.update({
      where: { id },
      data,
      include: {
        company: true,
        user: true
      }
    })
  },

  // Удаление вакансии
  async deleteVacancy(id) {
    return prisma.vacancy.delete({
      where: { id }
    })
  }
} 