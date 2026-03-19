import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Briefcase, Mail, ArrowRight, UserCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'Student'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await register(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative background blobs - reversed for variety */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 left-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10 transition-all duration-300 hover:shadow-brand-500/20">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-slate-900 tracking-tight">
                        Join Platform
                    </h2>
                    <p className="mt-4 text-center text-sm text-slate-600">
                        Create an account to connect with peers and alumni
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-fade-in">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white/50 focus:bg-white"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <UserCircle size={20} />
                                </div>
                                <input
                                    name="first_name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white/50 focus:bg-white"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <input
                                    name="last_name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white/50 focus:bg-white"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Briefcase size={20} />
                            </div>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-slate-200 bg-white/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 shadow-sm focus:bg-white cursor-pointer"
                            >
                                <option value="Student">Student</option>
                                <option value="Alumni">Alumni</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 shadow-sm bg-white/50 focus:bg-white"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg hover:shadow-brand-500/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight className={`h-5 w-5 text-brand-400 group-hover:text-white transition-all duration-200 ${isLoading ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
                            </span>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                            Log in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
