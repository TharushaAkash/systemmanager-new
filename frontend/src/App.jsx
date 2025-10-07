// src/App.jsx
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [showRegister, setShowRegister] = useState(false);
    const [currentView, setCurrentView] = useState('home'); // Track current view

    // Debug: Log authentication state (uncomment for debugging)
    // console.log('Authentication state:', { isAuthenticated: isAuthenticated(), loading });
    
    // Clear authentication on page load for testing
    useEffect(() => {
        // Uncomment the lines below to clear authentication data for testing
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
    }, []);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    // Navigation handler
    const handleNavigate = (view, params = {}) => {
        if (view === 'login') {
            setCurrentView('login');
        } else if (view === 'register') {
            setCurrentView('register');
        } else if (view === 'dashboard' && isAuthenticated()) {
            setCurrentView('dashboard');
            // Clear any existing hash and set to home for the dashboard
            window.location.hash = '#/home';
        } else {
            setCurrentView('home');
        }
    };

    // Show home page for non-authenticated users
    if (!isAuthenticated()) {
        if (currentView === 'login') {
            return <Login onRegister={() => setCurrentView('register')} onNavigate={handleNavigate} />;
        }
        if (currentView === 'register') {
            return <Register onLogin={() => setCurrentView('login')} onNavigate={handleNavigate} />;
        }
        return <HomePage onNavigate={handleNavigate} />;
    }

    // Show dashboard for authenticated users
    return <Layout onNavigate={handleNavigate} />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
