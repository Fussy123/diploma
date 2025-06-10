"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateResumePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    experience: "",
    education: "",
    skills: "",
    about: "",
    salary: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary: form.salary ? Number(form.salary) : null
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка при создании резюме");
      }
      router.push("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Создать резюме</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Название резюме"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="Опыт работы"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="education"
          value={form.education}
          onChange={handleChange}
          placeholder="Образование"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="skills"
          value={form.skills}
          onChange={handleChange}
          placeholder="Навыки (через запятую)"
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          placeholder="О себе"
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="salary"
          type="number"
          value={form.salary}
          onChange={handleChange}
          placeholder="Желаемая зарплата (₽)"
          className="w-full border rounded px-3 py-2"
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Создание..." : "Создать резюме"}
        </button>
      </form>
    </div>
  );
} 