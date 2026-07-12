import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Joyride, Step, EventData, STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const TOUR_KEY = 'nexus_tour_seen';

const steps: Step[] = [
  { target: '[data-tour="tour-messages"]', content: 'Chat and video call investors or entrepreneurs directly.' },
  { target: '[data-tour="tour-documents"]', content: 'Upload, review, and e-sign deal documents in the Document Chamber.' },
  { target: '[data-tour="tour-calendar"]', content: 'Set your availability and manage meeting requests here.' },
  { target: '[data-tour="tour-payments"]', content: 'Track your wallet, deposits, withdrawals, and deal funding.' },
];

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [runTour, setRunTour] = useState(() => !localStorage.getItem(TOUR_KEY));

  const handleTourEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem(TOUR_KEY, '1');
      setRunTour(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        onEvent={handleTourEvent}
        options={{ primaryColor: '#2563EB', zIndex: 10000 }}
      />
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};