import { Meeting, AvailabilitySlot } from '../types';

// Mock meetings store (in-memory, persisted to localStorage)
const KEY = 'nexus_meetings';
const SLOTS_KEY = 'nexus_availability';

export const loadMeetings = (): Meeting[] => {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const seed: Meeting[] = [
    { id: 'm1', title: 'Intro Call', withUserId: 'i1', date: new Date().toISOString().slice(0, 10), time: '14:00', status: 'confirmed', requestedBy: 'e1' },
  ];
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
};

export const saveMeetings = (meetings: Meeting[]) => {
  localStorage.setItem(KEY, JSON.stringify(meetings));
};

export const loadAvailability = (): AvailabilitySlot[] => {
  const raw = localStorage.getItem(SLOTS_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveAvailability = (slots: AvailabilitySlot[]) => {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
};
