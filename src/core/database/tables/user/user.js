import prisma from '../../client/prisma'

export const userService = {
  // Получение пользователя по ID
  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
  },

  // Получение пользователя по email
  async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    })
  },

  // Получение всех пользователей
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
  },

  // Создание нового пользователя
  async createUser(data) {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: data.password,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
  },

  // Создание или обновление пользователя
  async upsertUser(email, data) {
    return prisma.user.upsert({
      where: { email },
      update: {
        name: data.name,
        role: data.role,
        password: data.password,
      },
      create: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: data.password,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
  },

  // Удаление пользователя
  async deleteUser(id) {
    return prisma.user.delete({
      where: { id },
    })
  },

  // Получение пользователей с их вакансиями
  async getUsersWithVacancies() {
    return prisma.user.findMany({
      include: {
        vacancies: true
      }
    })
  },

  // Получение пользователей с их резюме
  async getUsersWithResumes() {
    return prisma.user.findMany({
      include: {
        resumes: true
      }
    })
  }
}