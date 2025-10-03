// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

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

    if (!isAuthenticated()) {
        if (showRegister) {
            return <Register onLogin={() => setShowRegister(false)} />;
        }
        return <Login onRegister={() => setShowRegister(true)} />;
    }

    return <Layout />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
