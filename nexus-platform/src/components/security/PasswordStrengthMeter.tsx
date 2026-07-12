import React from 'react';

// Simple scoring: length + variety of char classes
const getScore = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
};

const LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const COLORS = ['bg-error-500', 'bg-error-500', 'bg-warning-500', 'bg-secondary-500', 'bg-success-500'];

interface Props {
  password: string;
}

export const PasswordStrengthMeter: React.FC<Props> = ({ password }) => {
  const score = password ? getScore(password) : 0;

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? COLORS[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">{LABELS[score]}</p>
    </div>
  );
};
