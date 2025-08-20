import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MentorSearchPage from './pages/MentorSearch';
import MentorsPage from './pages/MentorsPage';
import GroupsPage from './pages/GroupsPage';
import ExamPrepPage from './pages/ExamPrepPage';

// A simple protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mentor-search',
        element: (
          <ProtectedRoute>
            <MentorSearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mentors',
        element: (
          <ProtectedRoute>
            <MentorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'groups',
        element: (
          <ProtectedRoute>
            <GroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam-prep',
        element: (
          <ProtectedRoute>
            <ExamPrepPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
