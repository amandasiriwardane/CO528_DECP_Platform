import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut, User, Calendar, Briefcase, MessageSquare, Bell,
    Mail, Home, BarChart2, BookOpen, X, ChevronRight
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout, api } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [unread, setUnread] = useState(0);
    const eventSourceRef = useRef(null);
    const token = localStorage.getItem('token');

    // Connect to SSE stream for live notifications
    useEffect(() => {
        if (!token) return;
        const es = new EventSource(`http://localhost:8080/api/notifications/stream?token=${token}`);
        eventSourceRef.current = es;

        const handleEvent = (type) => (e) => {
            const data = JSON.parse(e.data);
            setNotifications(prev => [{ ...data, type, id: Date.now() }, ...prev.slice(0, 19)]);
            setUnread(n => n + 1);
        };

        es.addEventListener('new_post', handleEvent('new_post'));
        es.addEventListener('new_event', handleEvent('new_event'));
        es.addEventListener('event_rsvp', handleEvent('event_rsvp'));
        es.addEventListener('new_job', handleEvent('new_job'));
        es.addEventListener('new_message', handleEvent('new_message'));
        es.addEventListener('new_group_message', handleEvent('new_group_message'));
        es.onerror = () => es.close();

        return () => es.close();
    }, [token]);

    const handleLogout = () => {
        if (eventSourceRef.current) eventSourceRef.current.close();
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { to: '/feed', icon: <MessageSquare size={20} />, label: 'Feed' },
        { to: '/jobs', icon: <Briefcase size={20} />, label: 'Jobs' },
        { to: '/events', icon: <Calendar size={20} />, label: 'Events' },
        { to: '/research', icon: <BookOpen size={20} />, label: 'Research' },
        { to: '/messages', icon: <Mail size={20} />, label: 'Messages' },
        ...(user?.role === 'Admin' ? [{ to: '/admin', icon: <BarChart2 size={20} />, label: 'Analytics' }] : []),
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 left-0 z-30">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-2xl font-black text-brand-600 tracking-tighter">DECP</h1>
                    <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded-full">{user?.role}</span>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navLinks.map(link => {
                        const active = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                                    active
                                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                {link.icon}
                                {link.label}
                                {active && <ChevronRight size={16} className="ml-auto text-brand-400" />}
                            </Link>
                        );
                    })}
                </nav>
                {/* User profile mini card */}
                <div className="p-4 border-t border-slate-100 space-y-1">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                        <User size={20} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name || user?.username}</p>
                            <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main content with offset for sidebar */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
                    <h2 className="text-lg font-bold text-slate-800 capitalize">
                        {location.pathname.replace('/', '') || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowNotifs(!showNotifs); setUnread(0); }}
                                className="p-2 text-slate-400 hover:text-brand-600 transition-colors relative rounded-full hover:bg-brand-50"
                            >
                                <Bell size={20} />
                                {unread > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                                        {unread > 9 ? '9+' : unread}
                                    </span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <span className="font-bold text-slate-900">Notifications</span>
                                        <button onClick={() => setShowNotifs(false)}><X size={16} className="text-slate-400" /></button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-400 text-sm">
                                                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                                No notifications yet
                                            </div>
                                        ) : notifications.map(n => (
                                            <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Avatar */}
                        <Link to="/profile">
                            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold border border-brand-200 text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
