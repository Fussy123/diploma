import prisma from '../../client/prisma'

export const applicationService = {
  // Получение заявки по ID
  async getApplicationById(id) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        resume: true,
        vacancy: true,
        user: true
      }
    })
  },

  // Получение всех заявок
  async getAllApplications() {
    return prisma.application.findMany({
      include: {
        resume: true,
        vacancy: true,
        user: true
      }
    })
  },

  // Создание или обновление заявки
  async upsertApplication(id, data) {
    return prisma.application.upsert({
      where: { id },
      update: data,
      create: data
    })
  },

  // Удаление заявки
  async deleteApplication(id) {
    return prisma.application.delete({
      where: { id }
    })
  },

  // Получение заявок по пользователю
  async getApplicationsByUser(userId) {
    return prisma.application.findMany({
      where: { userId },
      include: {
        resume: true,
        vacancy: true,
        user: true
      }
    })
  },

  // Получение заявок по вакансии
  async getApplicationsByVacancy(vacancyId) {
    return prisma.application.findMany({
      where: { vacancyId },
      include: {
        resume: true,
        vacancy: true,
        user: true
      }
    })
  }
} 