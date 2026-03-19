import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Calendar, Briefcase, MessageSquare, Bell, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-8 pb-12">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-brand-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || user?.username}!</h3>
                    <p className="text-brand-50 text-lg max-w-xl">
                        Here is what's happening in your department network today. You are currently logged in as a {user?.role}.
                    </p>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User size={20} className="text-brand-500" />
                    Profile Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Username</label>
                        <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">@{user?.username}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
                        <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{user?.role}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">First Name</label>
                        <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{user?.first_name || 'Not set'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Last Name</label>
                        <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{user?.last_name || 'Not set'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/feed" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-dashed border-2 hover:border-brand-300 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[160px] text-center">
                    <MessageSquare className="text-slate-300 group-hover:text-brand-400 transition-colors mb-3" size={32} />
                    <p className="font-medium text-slate-600 group-hover:text-brand-600">Explore Feed</p>
                </Link>
                <Link to="/jobs" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-dashed border-2 hover:border-brand-300 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[160px] text-center">
                    <Briefcase className="text-slate-300 group-hover:text-brand-400 transition-colors mb-3" size={32} />
                    <p className="font-medium text-slate-600 group-hover:text-brand-600">Find Jobs</p>
                </Link>
                <Link to="/events" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-dashed border-2 hover:border-brand-300 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[160px] text-center">
                    <Calendar className="text-slate-300 group-hover:text-brand-400 transition-colors mb-3" size={32} />
                    <p className="font-medium text-slate-600 group-hover:text-brand-600">Browse Events</p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
