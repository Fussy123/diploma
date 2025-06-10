"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || ""
        }));
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Ошибка при загрузке профиля");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Профиль успешно обновлен");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Ошибка при обновлении профиля");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-lg text-gray-600">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Профиль
      </h1>
      
      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+7 (___) ___-__-__"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Изменить пароль
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Текущий пароль
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Новый пароль
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Подтвердите новый пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Сохранить изменения
        </button>
      </form>
    </div>
  );
} 