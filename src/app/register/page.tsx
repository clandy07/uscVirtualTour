'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import Image from 'next/image';

import { uscLogo } from "../lib/icons";

type FieldErrors = {
    firstName?: string;
    lastName?: string;
    studentOrAdminId?: string;
    password?: string;
    confirmPassword?: string;
};

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        studentOrAdminId: '',
        password: '',
        confirmPassword: '',
        role: 'student' as 'student' | 'admin',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength calculator
    const passwordStrength = useMemo(() => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Weak', color: 'bg-red-500' },
            { strength: 2, label: 'Fair', color: 'bg-orange-500' },
            { strength: 3, label: 'Good', color: 'bg-yellow-500' },
            { strength: 4, label: 'Strong', color: 'bg-green-500' },
            { strength: 5, label: 'Very Strong', color: 'bg-green-600' },
        ];

        return levels[strength];
    }, [formData.password]);

    const validateForm = () => {
        const errors: FieldErrors = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
            errors.firstName = 'First name should contain only letters';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
            errors.lastName = 'Last name should contain only letters';
        }

        if (!formData.studentOrAdminId.trim()) {
            errors.studentOrAdminId = `${formData.role === 'student' ? 'Student' : 'Admin'} ID is required`;
        } else if (!/^\d+$/.test(formData.studentOrAdminId.trim())) {
            errors.studentOrAdminId = 'ID must contain only numbers';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear field error when user starts typing
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: undefined,
            });
        }
        // Clear general error
        if (error) setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/">
                            <Image src={uscLogo} alt="USC Logo" className="w-16 h-16 mx-auto mb-4" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            Join the Virtual Tour
                        </h1>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <svg
                                className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-bold text-gray-900 mb-2"
                            >
                                Account Type
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                            >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-bold text-gray-900 mb-2"
                                >
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black ${fieldErrors.firstName
                                        ? 'border-red-300 focus:ring-green-700'
                                        : 'border-gray-300 focus:ring-green-700'
                                        }`}
                                //   placeholder="Juan"
                                />
                                {fieldErrors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldErrors.firstName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-bold text-gray-900 mb-2"
                                >
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black ${fieldErrors.lastName
                                        ? 'border-red-300 focus:ring-green-700'
                                        : 'border-gray-300 focus:ring-green-700'
                                        }`}
                                //   placeholder="Dela Cruz"
                                />
                                {fieldErrors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldErrors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Middle Name */}
                        <div>
                            <label
                                htmlFor="middleName"
                                className="block text-sm font-bold text-gray-900 mb-2"
                            >
                                Middle Name <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                                id="middleName"
                                name="middleName"
                                type="text"
                                value={formData.middleName}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                            // placeholder="Santos"
                            />
                        </div>

                        {/* Student/Admin ID */}
                        <div>
                            <label
                                htmlFor="studentOrAdminId"
                                className="block text-sm font-bold text-gray-900 mb-2"
                            >
                                {formData.role === 'student' ? 'Student ID' : 'Admin ID'}
                            </label>
                            <input
                                id="studentOrAdminId"
                                name="studentOrAdminId"
                                type="text"
                                required
                                value={formData.studentOrAdminId}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black ${fieldErrors.studentOrAdminId
                                    ? 'border-red-300 focus:ring-green-700'
                                    : 'border-gray-300 focus:ring-green-700'
                                    }`}
                            // placeholder="Enter your ID number"
                            />
                            {fieldErrors.studentOrAdminId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.studentOrAdminId}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-gray-900 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black ${fieldErrors.password
                                        ? 'border-red-300 focus:ring-green-700'
                                        : 'border-gray-300 focus:ring-green-700'
                                        }`}
                                //   placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />

                                        </svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.password}
                                </p>
                            )}
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        {passwordStrength.label && (
                                            <span className="text-xs font-medium text-gray-600">
                                                {passwordStrength.label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Use 8+ characters with a mix of letters, numbers & symbols
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-bold text-gray-900 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-black ${fieldErrors.confirmPassword
                                        ? 'border-red-300 focus:ring-green-700'
                                        : 'border-gray-300 focus:ring-green-700'
                                        }`}
                                //   placeholder="Re-enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                            {/* Success indicator */}
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="mt-1 text-sm text-green-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 mt-1 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                I agree to the{' '}
                                <Link href="/terms" className="text-green-700 hover:text-green-800">
                                    Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-green-700 hover:text-green-800">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 focus:ring-4 focus:ring-green-300 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/signin"
                            className="text-green-700 hover:text-green-800 font-semibold"
                        >
                            Sign in instead
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                        ← Back to Virtual Tour
                    </Link>
                </div>
            </div>
        </div>
    );
}
