import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image, Send, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
// import axios from 'axios';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [openComments, setOpenComments] = useState({});
    const { user, api } = useAuth();

    const fetchPosts = async () => {
        try {
            const { data } = await api.get('/feed');
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !media) return;
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('content', content);
        if (media) formData.append('media', media);

        try {
            await api.post('/feed/post', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setContent('');
            setMedia(null);
            setPreview(null);
            fetchPosts(); // Refresh feed
        } catch (error) {
            console.error('Failed to post', error);
        }
        setIsLoading(false);
    };

    const handleLike = async (postId) => {
        try {
            const { data } = await api.post(`/feed/post/${postId}/like`);
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return { 
                        ...p, 
                        is_liked: data.liked, 
                        likes_count: parseInt(p.likes_count) + (data.liked ? 1 : -1) 
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const toggleComments = async (postId) => {
        if (openComments[postId]) {
            const newOpen = {...openComments};
            delete newOpen[postId];
            setOpenComments(newOpen);
            return;
        }
        try {
            const { data } = await api.get(`/feed/post/${postId}/comments`);
            setOpenComments({ ...openComments, [postId]: data.comments });
        } catch (error) {
            console.error('Failed to load comments', error);
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        const commentContent = e.target.elements.commentContent.value;
        if (!commentContent.trim()) return;

        try {
            const { data } = await api.post(`/feed/post/${postId}/comment`, { content: commentContent });
            e.target.reset();
            setOpenComments({
                ...openComments,
                [postId]: [...(openComments[postId] || []), data.comment]
            });
            setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: parseInt(p.comments_count) + 1 } : p));
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm rounded-2xl p-6 mb-8 border border-slate-100">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold uppercase">
                            {user?.username?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                            <textarea
                                className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 focus:border-brand-500 focus:bg-white focus:ring-0 resize-none transition-colors"
                                rows="3"
                                placeholder="Share your thoughts, projects, or questions..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            {preview && (
                                <div className="mt-3 relative inline-block">
                                    <img src={preview} alt="Upload preview" className="max-h-64 rounded-lg object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setMedia(null); setPreview(null); }}
                                        className="absolute top-2 right-2 bg-slate-900/50 text-white rounded-full p-1 hover:bg-slate-900/70"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-between">
                                <label className="flex items-center space-x-2 text-slate-500 hover:text-brand-600 cursor-pointer transition-colors px-3 py-2 rounded-lg hover:bg-brand-50">
                                    <Image size={20} />
                                    <span className="text-sm font-medium">Add Media</span>
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaChange} />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isLoading || (!content.trim() && !media)}
                                    className="inline-flex items-center space-x-2 rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span>Post</span>
                                    {isLoading ? <span className="animate-spin">⌛</span> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {posts.map(post => (
                    <article key={post.id} className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-100 to-teal-100 flex items-center justify-center text-brand-700 font-bold uppercase shadow-inner">
                                        {post.username?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {post.first_name} {post.last_name} <span className="font-normal text-slate-500">@{post.username}</span>
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {post.role} • {new Date(post.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            
                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {post.content}
                            </p>
                            
                            {post.image_url && (
                                <div className="mt-4 rounded-xl overflow-hidden bg-slate-100">
                                    <img src={post.image_url} alt="Post attachment" className="w-full max-h-96 object-cover" />
                                </div>
                            )}
                        </div>
                        
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-6">
                            <button 
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${post.is_liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                            >
                                <Heart size={18} className={post.is_liked ? 'fill-current' : ''} />
                                <span>{post.likes_count || 0}</span>
                            </button>
                            <button 
                                onClick={() => toggleComments(post.id)}
                                className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
                            >
                                <MessageCircle size={18} />
                                <span>{post.comments_count || 0} Comments</span>
                            </button>
                        </div>
                        
                        {openComments[post.id] && (
                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                                    {openComments[post.id].length === 0 ? (
                                        <p className="text-sm text-center text-slate-500 py-2">No comments yet. Be the first to reply!</p>
                                    ) : (
                                        openComments[post.id].map(c => (
                                            <div key={c.id} className="flex space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                                    {c.username?.[0] || 'U'}
                                                </div>
                                                <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-bold text-slate-800">{c.first_name} {c.last_name}</span>
                                                        <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{c.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex items-center space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center text-brand-700 font-bold text-xs uppercase">
                                        {user?.username?.[0] || 'U'}
                                    </div>
                                    <input 
                                        type="text" 
                                        name="commentContent"
                                        placeholder="Write a comment..." 
                                        className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow"
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="p-2 text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </article>
                ))}
                
                {posts.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No posts yet. Be the first to share something!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
