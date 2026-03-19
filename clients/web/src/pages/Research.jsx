import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Users, FileText, FolderOpen, X } from 'lucide-react';

const Research = () => {
    const { user, api } = useAuth();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/users/projects');
            setProjects(data.projects || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/users/projects', { title, description });
            setShowModal(false);
            setTitle('');
            setDescription('');
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create project');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Research Hub</h1>
                    <p className="text-slate-500 mt-1">Collaborate on projects, share documents, and invite teammates.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors"
                >
                    <Plus size={20} /><span>New Project</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(p => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                                <FolderOpen size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-lg">{p.title}</h3>
                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{p.description}</p>
                                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Users size={14} /> {p.member_count || 1} member(s)</span>
                                    <span className="flex items-center gap-1"><FileText size={14} /> {p.doc_count || 0} document(s)</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase">
                                    {p.creator_username?.[0]}
                                </div>
                                <span className="text-xs text-slate-500">by @{p.creator_username}</span>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No projects yet</h3>
                    <p className="text-slate-500">Create a research project to start collaborating!</p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-slate-900">New Research Project</h2>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Project Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-shadow"
                                    placeholder="e.g. AI in Healthcare Research" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="4" required
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-shadow resize-none"
                                    placeholder="Describe the research goals, methodology, and what collaborators will do..." />
                            </div>
                            <button type="submit" disabled={isLoading}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
                                {isLoading ? 'Creating...' : 'Create Project'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Research;
