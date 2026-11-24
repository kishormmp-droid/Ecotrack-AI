import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WelcomePage } from '../features/welcome/WelcomePage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ActivitiesPage } from '../features/activities/ActivitiesPage';
import { RecommendationsPage } from '../features/recommendations/RecommendationsPage';
import { ChallengesPage } from '../features/challenges/ChallengesPage';
import { SatellitePage } from '../features/satellite/SatellitePage';
import { HowWeCalculatePage } from '../features/how-we-calculate/HowWeCalculatePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { getStoredOnboarding, isDemoModeActive } from '../services/storage';

const RootRedirect: React.FC = () => {
  const onboarding = getStoredOnboarding();
  const isDemo = isDemoModeActive();

  if (onboarding.completed || isDemo) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/welcome" replace />;
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/activities',
        element: <ActivitiesPage />,
      },
      {
        path: '/recommendations',
        element: <RecommendationsPage />,
      },
      {
        path: '/challenges',
        element: <ChallengesPage />,
      },
      {
        path: '/satellite',
        element: <SatellitePage />,
      },
      {
        path: '/how-we-calculate',
        element: <HowWeCalculatePage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];
