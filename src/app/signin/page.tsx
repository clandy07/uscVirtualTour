'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

import { uscLogo } from "../lib/icons";

export default function SignInPage() {
    const [formData, setFormData] = useState({
        studentOrAdminId: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{
        studentOrAdminId?: string;
        password?: string;
    }>({});

    const validateForm = () => {
        const errors: { studentOrAdminId?: string; password?: string } = {};

        if (!formData.studentOrAdminId.trim()) {
            errors.studentOrAdminId = 'Student/Admin ID is required';
        } else if (!/^\d+$/.test(formData.studentOrAdminId.trim())) {
            errors.studentOrAdminId = 'ID must contain only numbers';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear field error when user starts typing
        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: undefined,
            });
        }
        // Clear general error
        if (error) setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/">
                            <Image src={uscLogo} alt="USC Logo" className="w-16 h-16 mx-auto mb-4" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            Sign in to USC Virtual Tour
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Student/Admin ID Field */}
                        <div>
                            <label
                                htmlFor="studentOrAdminId"
                                className="block text-sm text-gray-900 mb-2 font-bold"
                            >
                                Student/Admin ID
                            </label>
                            <input
                                id="studentOrAdminId"
                                name="studentOrAdminId"
                                type="text"
                                required
                                value={formData.studentOrAdminId}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-black ${fieldErrors.studentOrAdminId
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-green-700'
                                    }`}
                                // placeholder="Enter your ID number"
                                disabled={isLoading}
                            />
                            {fieldErrors.studentOrAdminId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.studentOrAdminId}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm text-gray-900 mb-2 font-bold"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-black ${fieldErrors.password
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-green-700'
                                    }`}
                                // placeholder="Enter your password"
                                disabled={isLoading}
                            />
                            {fieldErrors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-green-700 hover:text-green-800 font-medium"
                            >
                                Forgot password?
                            </Link>
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
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
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
                                Don't have an account?
                            </span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/register"
                            className="text-green-700 hover:text-green-800 font-semibold"
                        >
                            Create a new account
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
