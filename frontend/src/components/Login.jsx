import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaArrowLeft, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

export default function Login({ onRegister, onNavigate }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(form.email, form.password);
        
        if (!result.success) {
            setError(result.error);
        } else {
            // Clear URL hash and navigate to dashboard on successful login
            window.location.hash = '';
            if (onNavigate) {
                onNavigate('dashboard');
            }
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            {/* Animated background elements */}
            <div className="bg-animation">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
            </div>

            {/* Glass morphism card */}
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <button
                        onClick={() => onNavigate && onNavigate('home')}
                        className="back-button"
                    >
                        <FaArrowLeft className="back-icon" />
                        Back to Home
                    </button>
                    
                    <div className="logo-section">
                        <div className="logo-icon">
                            <FaSignInAlt />
                        </div>
                        <h1 className="login-title">AutoFuel Lanka</h1>
                        <p className="login-subtitle">Welcome back! Sign in to your account</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Email Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaUser className="input-icon" />
                            Email Address
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaLock className="input-icon" />
                            Password
                        </label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="password-toggle"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <div className="error-content">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`submit-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <>
                                <FaSignInAlt className="button-icon" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p className="footer-text">
                        Don't have an account?{' '}
                        <button
                            onClick={onRegister}
                            className="link-button"
                        >
                            Sign up here
                        </button>
                    </p>
                </div>


            </div>
        </div>
    );
}
