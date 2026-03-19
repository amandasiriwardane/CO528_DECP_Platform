import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, Lock, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, api } = useAuth();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.put('/users/profile', { first_name: firstName, last_name: lastName });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.put('/users/password', { currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Profile Settings</h1>

            {saved && (
                <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl font-medium">
                    <CheckCircle size={18} />
                    Changes saved successfully!
                </div>
            )}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Identity Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-brand-100 to-indigo-100 flex items-center justify-center text-brand-700 font-bold text-2xl uppercase">
                        {user?.username?.[0]}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
                        <p className="text-slate-500">@{user?.username}</p>
                        <span className="inline-block mt-1 px-3 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">{user?.role}</span>
                    </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} /> Personal Info
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                            <input
                                type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                            <input
                                type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Username (cannot change)</label>
                        <input value={user?.username} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Role (assigned by Admin)</label>
                        <input value={user?.role} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <button type="submit" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                        <Save size={18} /> Save Changes
                    </button>
                </form>
            </div>

            {/* Password Change */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Lock size={16} /> Change Password
                    </h3>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                        <input
                            type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                        />
                    </div>
                    <button type="submit" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                        <Lock size={18} /> Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
