'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Notification from './Notification';

export default function VacancyCard({ vacancy, onApply }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isApplied, setIsApplied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => {
    if (session) {
      fetch('/api/resume')
        .then(res => res.json())
        .then(data => {
          setResumes(data);
          if (data.length === 1) setSelectedResumeId(data[0].id);
        });
    }
  }, [session]);

  const handleApply = async () => {
    if (!session) {
      router.push('/');
      return;
    }
    if (!selectedResumeId) {
      setNotificationMessage('Выберите резюме для отклика');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }
    try {
      const response = await fetch('/api/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vacancyId: vacancy.id,
          resumeId: selectedResumeId,
          message: 'Хочу работать у вас!'
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Ошибка при отправке отклика');
      }
      setIsApplied(true);
      setNotificationMessage('Отклик успешно отправлен!');
      setNotificationType('success');
      setShowNotification(true);
      if (onApply) {
        onApply();
      }
    } catch (error) {
      setNotificationMessage(error.message);
      setNotificationType('error');
      setShowNotification(true);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2 text-black">{vacancy.title}</h2>
      <p className="text-black mb-2">{vacancy.company?.name}</p>
      <p className="text-black mb-4">{vacancy.location}</p>
      <p className="text-black mb-4">{vacancy.description}</p>
      
      {vacancy.salary && (
        <p className="text-green-600 font-medium mb-4">
          {vacancy.salary.toLocaleString()} ₽
        </p>
      )}

      {resumes.length > 1 && (
        <select
          className="mb-4 block border rounded px-2 py-1"
          value={selectedResumeId}
          onChange={e => setSelectedResumeId(e.target.value)}
        >
          <option value="">Выберите резюме</option>
          {resumes.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push(`/vacancy/${vacancy.id}`)}
          className="text-blue-600 hover:text-blue-800"
        >
          Подробнее
        </button>

        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`px-4 py-2 rounded-lg ${
            isApplied
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isApplied ? 'Отклик отправлен' : 'Откликнуться'}
        </button>
      </div>

      {showNotification && (
        <Notification
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
} 