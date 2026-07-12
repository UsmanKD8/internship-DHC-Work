import React, { useRef } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

// Simple 6-box OTP input, auto-advances focus
export const OtpInput: React.FC<Props> = ({ length = 6, value, onChange }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const setDigit = (i: number, d: string) => {
    const clean = d.replace(/\D/g, '').slice(-1);
    const next = digits.slice();
    next[i] = clean || ' ';
    onChange(next.join('').trimEnd());
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          value={d.trim()}
          onChange={e => setDigit(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      ))}
    </div>
  );
};
