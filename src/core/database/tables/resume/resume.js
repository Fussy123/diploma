import prisma from '../../client/prisma'

export const resumeService = {
  // Получение резюме по ID
  async getResumeById(id) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        user: true,
        applications: true
      }
    })
  },

  // Получение всех резюме
  async getAllResumes() {
    return prisma.resume.findMany({
      include: {
        user: true,
        applications: true
      }
    })
  },

  // Создание или обновление резюме
  async upsertResume(id, data) {
    return prisma.resume.upsert({
      where: { id },
      update: data,
      create: data
    })
  },

  // Удаление резюме
  async deleteResume(id) {
    return prisma.resume.delete({
      where: { id }
    })
  },

  // Получение резюме пользователя
  async getUserResumes(userId) {
    return prisma.resume.findMany({
      where: { userId },
      include: {
        user: true,
        applications: true
      }
    })
  },

  // Поиск резюме по навыкам
  async searchResumesBySkills(skills) {
    return prisma.resume.findMany({
      where: {
        skills: {
          contains: skills
        }
      },
      include: {
        user: true,
        applications: true
      }
    })
  }
} 