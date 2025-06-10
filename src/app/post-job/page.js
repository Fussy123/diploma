'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PostJob() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    requirements: '',
    companyId: ''
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    website: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session?.user?.role !== 'EMPLOYER') {
      router.push('/main');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/company');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при создании компании');
      }

      const newCompany = await response.json();
      setCompanies(prev => [...prev, newCompany]);
      setFormData(prev => ({ ...prev, companyId: newCompany.id }));
      setShowCompanyForm(false);
      setCompanyData({
        name: '',
        description: '',
        website: '',
        location: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/vacancy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при создании вакансии');
      }

      alert('Вакансия успешно создана!');
      router.push('/main');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Разместить вакансию</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-black bg-white">
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
              Компания
            </label>
            <div className="flex gap-2">
              <select
                id="companyId"
                name="companyId"
                required
                value={formData.companyId}
                onChange={handleChange}
                className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Выберите компанию</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCompanyForm(!showCompanyForm)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {showCompanyForm ? 'Отмена' : 'Новая компания'}
              </button>
            </div>
          </div>

          {showCompanyForm && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h2 className="text-lg font-semibold">Новая компания</h2>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Название компании
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="name"
                  required
                  value={companyData.name}
                  onChange={handleCompanyChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание компании
                </label>
                <textarea
                  id="companyDescription"
                  name="description"
                  value={companyData.description}
                  onChange={handleCompanyChange}
                  rows="3"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  id="companyWebsite"
                  name="website"
                  value={companyData.website}
                  onChange={handleCompanyChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="companyLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Город
                </label>
                <input
                  type="text"
                  id="companyLocation"
                  name="location"
                  value={companyData.location}
                  onChange={handleCompanyChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleCompanySubmit}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Создать компанию
              </button>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название вакансии
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Например: Frontend Developer"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание вакансии
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Опишите обязанности и условия работы"
            />
          </div>

          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
              Зарплата
            </label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Например: 150000"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Город
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Например: Москва"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Требования
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Опишите требования к кандидату"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Разместить вакансию'}
          </button>
        </form>
      </div>
    </div>
  );
} 