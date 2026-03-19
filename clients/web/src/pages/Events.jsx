import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Plus, CheckCircle, Clock, FileText, X } from 'lucide-react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', date: '', venue: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { user, api } = useAuth();

    const canPost = user?.role === 'Admin' || user?.role === 'Alumni';

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data.events || []);
        } catch (error) { console.error('Failed to fetch events', error); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/events/create', form);
            setShowModal(false);
            setForm({ title: '', date: '', venue: '', description: '' });
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create event');
        }
        setIsLoading(false);
    };

    const handleRSVP = async (eventId, hasRSVP) => {
        try {
            const { data } = await api.post(`/events/${eventId}/rsvp`);
            setEvents(events.map(e => {
                if (e.id === eventId) {
                    const diff = data.rsvped ? 1 : -1;
                    return { ...e, has_rsvp: data.rsvped, rsvp_count: parseInt(e.rsvp_count || 0) + diff };
                }
                return e;
            }));
        } catch (error) { console.error('Failed to RSVP', error); }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events Hub</h1>
                    <p className="text-slate-500 mt-1">Networking, Workshops, and Alumni Sessions.</p>
                </div>
                {canPost && (
                    <button onClick={() => setShowModal(true)}
                        className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors">
                        <Plus size={20} /><span>Create Event</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => {
                    const eventDate = new Date(event.date);
                    const isUpcoming = eventDate > new Date();
                    return (
                        <div key={event.id} className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col">
                            <div className="h-24 bg-gradient-to-br from-brand-500 to-indigo-600 relative p-6 flex items-end">
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {isUpcoming ? 'Upcoming' : 'Past'}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{event.title}</h3>
                                {event.description && (
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{event.description}</p>
                                )}
                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                        <Calendar size={16} className="mr-3 text-brand-500 flex-shrink-0" />
                                        <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                        <Clock size={16} className="mr-3 text-brand-500 flex-shrink-0" />
                                        <span>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                        <MapPin size={16} className="mr-3 text-brand-500 flex-shrink-0" />
                                        <span>{event.venue || 'Virtual / Online'}</span>
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-slate-600">
                                        <Users size={16} className="mr-3 text-brand-500 flex-shrink-0" />
                                        <span>{event.rsvp_count || 0} Attending</span>
                                    </div>
                                </div>
                                <button onClick={() => handleRSVP(event.id, event.has_rsvp)}
                                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center space-x-2
                                        ${event.has_rsvp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-900 text-white hover:bg-brand-600'}`}>
                                    {event.has_rsvp ? (<><CheckCircle size={18} /><span>Spot Reserved</span></>) : (<span>RSVP Now</span>)}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {events.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 mt-4">
                    <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No events scheduled</h3>
                    <p className="text-slate-500">{canPost ? 'Create the first event!' : 'Check back later for upcoming events!'}</p>
                </div>
            )}

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">Schedule New Event</h2>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Event Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500"
                                    placeholder="e.g. Alumni Cloud Tech Workshop" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 resize-none"
                                    placeholder="What will attendees learn or experience?" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date & Time *</label>
                                <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Venue / Location</label>
                                <input type="text" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500"
                                    placeholder="e.g. Main Hall, Room 203 or Virtual via Zoom" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isLoading}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                                    {isLoading ? 'Creating...' : 'Launch Event 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
