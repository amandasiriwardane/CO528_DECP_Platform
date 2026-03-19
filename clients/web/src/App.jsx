import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Feed from './pages/Feed';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Messaging from './pages/Messaging';
import Profile from './pages/Profile';
import AdminAnalytics from './pages/AdminAnalytics';
import Research from './pages/Research';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse w-16 h-16 bg-brand-500 rounded-full"></div>
        </div>;
    }
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
    return <Layout>{children}</Layout>;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                        <Route path="/messages" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
