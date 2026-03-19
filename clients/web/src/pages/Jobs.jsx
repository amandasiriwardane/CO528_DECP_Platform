import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Clock, Plus, CheckCircle, Upload, X, FileText } from 'lucide-react';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    
    const [postForm, setPostForm] = useState({ title: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { user, api } = useAuth();
    
    // Derived permissions
    const canPost = user?.role === 'Admin' || user?.role === 'Alumni';

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data.jobs || []);
        } catch (error) { console.error('Failed to fetch jobs', error); }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handlePostJob = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/jobs/post', postForm);
            setShowPostModal(false);
            setPostForm({ title: '', description: '' });
            fetchJobs();
        } catch (error) { console.error('Failed to post job', error); }
        setIsLoading(false);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!cvFile || !selectedJob) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('resume', cvFile);
            await api.post(`/jobs/${selectedJob.id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, has_applied: true } : j));
            setShowApplyModal(false);
            setCvFile(null);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to apply');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Job Board</h1>
                    <p className="text-slate-500 mt-1">Discover opportunities mapped exactly to your degree path.</p>
                </div>
                {canPost && (
                    <button 
                        onClick={() => setShowPostModal(true)}
                        className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors"
                    >
                        <Plus size={20} />
                        <span>Post Opportunity</span>
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                                <div className="flex items-center space-x-4 text-sm font-medium text-slate-500 mb-4">
                                    <span className="flex items-center"><Briefcase size={16} className="mr-1 text-brand-500" /> {job.username}</span>
                                    <span className="flex items-center"><Clock size={16} className="mr-1 text-amber-500" /> {new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed mb-6">{job.description}</p>
                            </div>
                            <div className="ml-6 flex flex-col items-end">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">
                                    Full Time
                                </span>
                                {job.has_applied ? (
                                    <button disabled className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 opacity-80 cursor-default">
                                        <CheckCircle size={18} />
                                        <span>Applied</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                                        className="px-6 py-3 rounded-full bg-slate-900 hover:bg-brand-600 text-white font-bold shadow-sm transition-colors"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Post Job Modal */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Post New Opportunity</h2>
                            <button onClick={() => setShowPostModal(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handlePostJob} className="p-6 space-y-4">
                            <input 
                                type="text" placeholder="Job Title" required
                                value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3"
                            />
                            <textarea 
                                placeholder="Description" required rows="5"
                                value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3"
                            />
                            <button type="submit" disabled={isLoading} className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl">
                                {isLoading ? 'Posting...' : 'Publish Job'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">Apply for Job</h2>
                            <button onClick={() => setShowApplyModal(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleApply} className="p-6 space-y-6">
                            <div className="text-center">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{selectedJob?.title}</h3>
                                <p className="text-slate-500 text-sm">at {selectedJob?.username}</p>
                            </div>
                            
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 relative group hover:border-brand-500 transition-colors">
                                <input 
                                    type="file" accept=".pdf,.doc,.docx" required
                                    onChange={e => setCvFile(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                                {cvFile ? (
                                    <div className="flex flex-col items-center">
                                        <FileText size={40} className="text-brand-500 mb-2" />
                                        <p className="text-sm font-bold text-slate-900">{cvFile.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload size={40} className="text-slate-300 group-hover:text-brand-400 mb-2 transition-colors" />
                                        <p className="text-sm font-bold text-slate-600">Upload your Resume/CV</p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, or DOCX (Max 10MB)</p>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={!cvFile || isLoading} className="w-full bg-slate-900 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50">
                                {isLoading ? 'Uploading...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
