import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const { isAuthenticated, hasRole, loading } = useAuth();

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
        return null; // Will be handled by App.jsx to show login
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '50vh',
                flexDirection: 'column'
            }}>
                <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ color: '#666' }}>
                    You don't have permission to access this page. 
                    Required role: <strong>{requiredRole}</strong>
                </p>
            </div>
        );
    }

    return children;
}
