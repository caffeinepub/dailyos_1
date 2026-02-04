import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import CalendarView from './components/CalendarView';
import DailyDashboard from './components/DailyDashboard';
import MainDashboard from './components/MainDashboard';
import RemindersSection from './components/sections/RemindersSection';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from './components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { getTodayLocal, parseLocalDate } from './utils/localDate';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocal());
  const [view, setView] = useState<'daily' | 'main'>('daily');
  
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  
  // Show profile setup modal if:
  // 1. User is authenticated AND profile is null (first-time setup)
  // 2. User is authenticated AND profile exists but username is empty/whitespace (username repair)
  const needsProfileSetup = isAuthenticated && !profileLoading && isFetched && (
    userProfile === null || 
    (userProfile !== null && userProfile !== undefined && !userProfile.username.trim())
  );

  const displayDate = parseLocalDate(selectedDate);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen bg-background">
        <Header view={view} onViewChange={setView} />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          {view === 'daily' ? (
            <>
              {/* Mobile date header - visible only on small screens */}
              <h2 className="text-2xl font-bold mb-6 lg:hidden">
                {displayDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
                <div className="space-y-6 lg:sticky lg:top-6">
                  <CalendarView 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate}
                  />
                  <RemindersSection selectedDate={selectedDate} />
                </div>
                <div>
                  <DailyDashboard selectedDate={selectedDate} />
                </div>
              </div>
            </>
          ) : (
            <MainDashboard />
          )}
        </main>

        <Footer />
        <Toaster />
        <ProfileSetupModal 
          open={needsProfileSetup} 
          existingProfile={userProfile}
        />
      </div>
    </ThemeProvider>
  );
}
