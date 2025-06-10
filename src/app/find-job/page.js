'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function FindJob() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vacancies, setVacancies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    salary: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    // Дебаунс фильтров
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [filters]);

  useEffect(() => {
    fetchVacancies();
  }, [debouncedFilters]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(debouncedFilters).toString();
      const response = await fetch(`/api/vacancy?${queryParams}`);
      const data = await response.json();
      
      // Проверяем, что data это массив
      if (Array.isArray(data)) {
        setVacancies(data);
      } else if (data && typeof data === 'object') {
        // Если пришел объект с данными, преобразуем его в массив
        setVacancies([data]);
      } else {
        // Если данные некорректны, устанавливаем пустой массив
        setVacancies([]);
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = async (vacancyId) => {
    try {
      const response = await fetch('/api/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vacancyId,
          message: 'Заинтересован в вакансии'
        }),
      });

      if (response.ok) {
        alert('Заявка успешно отправлена!');
      } else {
        throw new Error('Failed to apply');
      }
    } catch (error) {
      alert('Ошибка при отправке заявки');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200  rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Поиск работы</h1>
        
        {/* Фильтры */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 text-black md:grid-cols-3 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Поиск по названию"
              value={filters.search}
              onChange={handleFilterChange}
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="number"
              name="salary"
              placeholder="Минимальная зарплата"
              value={filters.salary}
              onChange={handleFilterChange}
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="text"
              name="location"
              placeholder="Город"
              value={filters.location}
              onChange={handleFilterChange}
              className="border rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Список вакансий */}
        <div className="space-y-4">
          {vacancies && vacancies.length > 0 ? (
            vacancies.map((vacancy) => (
              <div key={vacancy.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{vacancy.title}</h2>
                    <p className="text-gray-600 mb-2">{vacancy.user?.name}</p>
                    <p className="text-gray-700 mb-4">{vacancy.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      {vacancy.salary && (
                        <span>Зарплата: {vacancy.salary} ₽</span>
                      )}
                      {vacancy.location && (
                        <span>Город: {vacancy.location}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(vacancy.id)}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Откликнуться
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Вакансии не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 