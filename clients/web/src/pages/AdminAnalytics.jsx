import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Users, FileText, Briefcase, TrendingUp, Calendar } from 'lucide-react';

const StatCard = ({ icon, label, value, color = 'brand' }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-3xl font-black text-slate-900">{value ?? '—'}</p>
        </div>
    </div>
);

const AdminAnalytics = () => {
    const { api } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    api.get('/users/admin/stats'),
                    api.get('/users/list')
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data.users || []);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;

    const roleCount = (role) => users.filter(u => u.role === role).length;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
                <p className="text-slate-500 mt-1">Platform-wide insights and statistics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<Users size={24} />} label="Total Users" value={stats?.totalUsers || users.length + 1} color="brand" />
                <StatCard icon={<FileText size={24} />} label="Total Posts" value={stats?.totalPosts} color="indigo" />
                <StatCard icon={<Briefcase size={24} />} label="Job Postings" value={stats?.totalJobs} color="amber" />
                <StatCard icon={<Calendar size={24} />} label="Total Events" value={stats?.totalEvents} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Breakdown */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-brand-500" /> User Roles</h3>
                    <div className="space-y-3">
                        {['Student', 'Alumni', 'Admin'].map(role => {
                            const count = roleCount(role);
                            const total = users.length;
                            const pct = total ? Math.round((count / total) * 100) : 0;
                            const colors = { Student: 'bg-brand-500', Alumni: 'bg-indigo-500', Admin: 'bg-amber-500' };
                            return (
                                <div key={role}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{role}</span>
                                        <span className="font-bold text-slate-900">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className={`${colors[role]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users size={20} className="text-brand-500" /> Registered Users</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                    {u.username?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{u.first_name} {u.last_name}</p>
                                    <p className="text-xs text-slate-500">@{u.username}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    u.role === 'Admin' ? 'bg-amber-100 text-amber-700' :
                                    u.role === 'Alumni' ? 'bg-indigo-100 text-indigo-700' :
                                    'bg-brand-100 text-brand-700'
                                }`}>{u.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
