import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Clock, Plus, Check, X as XIcon, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { useAuth } from '../../context/AuthContext';
import { loadMeetings, saveMeetings, loadAvailability, saveAvailability } from '../../data/meetings';
import { Meeting, AvailabilitySlot } from '../../types';
import { findUserById } from '../../data/users';
import toast from 'react-hot-toast';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [requestTitle, setRequestTitle] = useState('');

  useEffect(() => {
    setMeetings(loadMeetings());
    setSlots(loadAvailability());
  }, []);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const meetingsToday = meetings.filter(m => m.date === dateKey);
  const slotsToday = slots.filter(s => s.date === dateKey);

  const addSlot = () => {
    const updated = [...slots, { date: dateKey, time: newSlotTime }];
    setSlots(updated);
    saveAvailability(updated);
    toast.success('Availability slot added');
  };

  const removeSlot = (time: string) => {
    const updated = slots.filter(s => !(s.date === dateKey && s.time === time));
    setSlots(updated);
    saveAvailability(updated);
  };

  const requestMeeting = (time: string) => {
    if (!user) return;
    const meeting: Meeting = {
      id: `m${Date.now()}`,
      title: requestTitle || 'Meeting Request',
      withUserId: user.id,
      date: dateKey,
      time,
      status: 'pending',
      requestedBy: user.id,
    };
    const updated = [...meetings, meeting];
    setMeetings(updated);
    saveMeetings(updated);
    setRequestTitle('');
    toast.success('Meeting request sent');
  };

  const updateStatus = (id: string, status: Meeting['status']) => {
    const updated = meetings.map(m => (m.id === id ? { ...m, status } : m));
    setMeetings(updated);
    saveMeetings(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scheduling Calendar</h1>
        <p className="text-gray-600">Manage availability and meeting requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardBody>
            <MonthCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              markedDates={meetings.filter(m => m.status === 'confirmed').map(m => m.date)}
            />
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Availability management */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Availability — {format(selectedDate, 'MMM d, yyyy')}</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newSlotTime}
                  onChange={e => setNewSlotTime(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
                />
                <Button size="sm" leftIcon={<Plus size={16} />} onClick={addSlot}>Add Slot</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {slotsToday.length === 0 && <p className="text-sm text-gray-500">No availability set for this day.</p>}
                {slotsToday.map(s => (
                  <Badge key={s.time} variant="secondary" className="flex items-center gap-2">
                    <Clock size={12} /> {s.time}
                    <button onClick={() => removeSlot(s.time)}><Trash2 size={12} /></button>
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Request a meeting on this day's open slots */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Request a Meeting</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Input placeholder="Meeting title" value={requestTitle} onChange={e => setRequestTitle(e.target.value)} fullWidth />
              <div className="flex flex-wrap gap-2">
                {slotsToday.length === 0 && <p className="text-sm text-gray-500">No open slots to request.</p>}
                {slotsToday.map(s => (
                  <Button key={s.time} variant="outline" size="sm" onClick={() => requestMeeting(s.time)}>
                    {s.time}
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Meetings list */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Meetings — {format(selectedDate, 'MMM d, yyyy')}</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {meetingsToday.length === 0 && <p className="text-sm text-gray-500">No meetings scheduled.</p>}
              {meetingsToday.map(m => {
                const withUser = findUserById(m.withUserId);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-500">{m.time} · with {withUser?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={m.status === 'confirmed' ? 'success' : m.status === 'declined' ? 'error' : 'warning'}>
                        {m.status}
                      </Badge>
                      {m.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="p-1.5 text-success-700" onClick={() => updateStatus(m.id, 'confirmed')}>
                            <Check size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1.5 text-error-600" onClick={() => updateStatus(m.id, 'declined')}>
                            <XIcon size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
