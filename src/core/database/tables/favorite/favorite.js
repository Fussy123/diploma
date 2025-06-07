import prisma from '../../client/prisma'

export const favoriteService = {
  // Получение избранного по ID
  async getFavoriteById(id) {
    return prisma.favorite.findUnique({
      where: { id },
      include: {
        user: true,
        resume: true,
        vacancy: true
      }
    })
  },

  // Получение всех избранных элементов пользователя
  async getUserFavorites(userId) {
    return prisma.favorite.findMany({
      where: { userId },
      include: {
        user: true,
        resume: true,
        vacancy: true
      }
    })
  },

  // Создание или обновление избранного
  async upsertFavorite(id, data) {
    return prisma.favorite.upsert({
      where: { id },
      update: data,
      create: data
    })
  },

  // Удаление избранного
  async deleteFavorite(id) {
    return prisma.favorite.delete({
      where: { id }
    })
  },

  // Добавление вакансии в избранное
  async addVacancyToFavorites(userId, vacancyId) {
    return prisma.favorite.create({
      data: {
        userId,
        vacancyId
      }
    })
  },

  // Добавление резюме в избранное
  async addResumeToFavorites(userId, resumeId) {
    return prisma.favorite.create({
      data: {
        userId,
        resumeId
      }
    })
  }
} 