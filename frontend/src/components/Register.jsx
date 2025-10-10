import { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaArrowLeft, FaUserPlus, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Register.css';

const API_BASE = "http://localhost:8080";

export default function Register({ onLogin, onNavigate }) {
    const [form, setForm] = useState({ 
        fullName: '', 
        email: '', 
        phone: '', 
        address: '', 
        password: '', 
        confirmPassword: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    address: form.address,
                    password: form.password,
                    role: 'CUSTOMER',
                    enabled: true
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Registration failed');
            }

            // Registration successful, now try to login
            const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: form.email, 
                    password: form.password 
                }),
            });

            if (loginResponse.ok) {
                // Auto-login successful, clear URL hash and navigate to dashboard
                window.location.hash = '';
                if (onNavigate) {
                    onNavigate('dashboard');
                }
            } else {
                // Registration successful but auto-login failed
                setError('Registration successful! Please login with your credentials.');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="register-container">
            {/* Animated background elements */}
            <div className="bg-animation">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
                <div className="floating-shape shape-5"></div>
            </div>

            {/* Glass morphism card */}
            <div className="register-card">
                {/* Header */}
                <div className="register-header">
                    <button
                        onClick={() => onNavigate && onNavigate('home')}
                        className="back-button"
                    >
                        <FaArrowLeft className="back-icon" />
                        Back to Home
                    </button>
                    
                    <div className="logo-section">
                        <div className="logo-icon">
                            <FaUserPlus />
                        </div>
                        <h1 className="register-title">AutoFuel Lanka</h1>
                        <p className="register-subtitle">Join us today! Create your account</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="register-form">
                    {/* Full Name Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaUser className="input-icon" />
                            Full Name *
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaEnvelope className="input-icon" />
                            Email Address *
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

                    {/* Phone Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaPhone className="input-icon" />
                            Phone Number
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your phone number"
                            />
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaMapMarkerAlt className="input-icon" />
                            Address
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your address"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaLock className="input-icon" />
                            Password *
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

                    {/* Confirm Password Field */}
                    <div className="input-group">
                        <label className="input-label">
                            <FaLock className="input-icon" />
                            Confirm Password *
                        </label>
                        <div className="input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="password-toggle"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
                                <FaUserPlus className="button-icon" />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="register-footer">
                    <p className="footer-text">
                        Already have an account?{' '}
                        <button
                            onClick={onLogin}
                            className="link-button"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
