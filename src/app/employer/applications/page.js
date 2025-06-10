'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EmployerApplications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session?.user?.role !== 'EMPLOYER') {
      router.push('/main');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/application/employer');
      if (!response.ok) {
        throw new Error('Ошибка при получении откликов');
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/application/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса');
      }

      // Обновляем список откликов
      fetchApplications();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Отклики на вакансии</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Пока нет откликов на ваши вакансии
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {application.vacancy.title}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      От: {application.user.name || application.user.email}
                    </p>
                    <p className="text-gray-600">
                      Резюме: {application.resume.title}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusChange(application.id, e.target.value)}
                      className="border rounded px-3 py-1"
                    >
                      <option value="PENDING">На рассмотрении</option>
                      <option value="ACCEPTED">Принято</option>
                      <option value="REJECTED">Отклонено</option>
                    </select>
                  </div>
                </div>

                {application.message && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Сообщение кандидата:</h3>
                    <p className="text-gray-600">{application.message}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <a
                    href={`/resume/${application.resume.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Просмотреть резюме
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 