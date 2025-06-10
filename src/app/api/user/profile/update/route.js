import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/core/database/client/prisma";

export async function PUT(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { name, phone, currentPassword, newPassword, confirmPassword } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Если пользователь хочет сменить пароль
    if (currentPassword && newPassword) {
      // Проверяем текущий пароль
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Неверный текущий пароль" },
          { status: 400 }
        );
      }

      // Проверяем, что новый пароль и подтверждение совпадают
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "Новые пароли не совпадают" },
          { status: 400 }
        );
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Обновляем пользователя с новым паролем
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone,
          password: hashedPassword
        }
      });
    } else {
      // Обновляем только имя и телефон
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone
        }
      });
    }

    return NextResponse.json({
      message: "Профиль успешно обновлен"
    });
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении профиля" },
      { status: 500 }
    );
  }
} 