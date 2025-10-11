import { useAuth } from "../contexts/AuthContext";

export default function AuthWrapper({ children, requiredRoles = [] }) {
    const { user, token, isAuthenticated, handleAuthError } = useAuth();

    if (!isAuthenticated()) {
        handleAuthError({ status: 401 });
        return null;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return <div>Access Denied: You don't have permission to view this page.</div>;
    }

    return children;
}