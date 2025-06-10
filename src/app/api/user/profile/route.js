import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/core/database/client/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    return NextResponse.json(
      { error: "Ошибка при получении профиля" },
      { status: 500 }
    );
  }
} 