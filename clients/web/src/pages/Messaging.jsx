import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, MessageCircle, User, Users, Plus, X } from 'lucide-react';

const Messaging = () => {
    const [view, setView] = useState('direct'); // 'direct' or 'groups'
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    
    const messagesEndRef = useRef(null);
    const { user, api } = useAuth();

    const fetchData = async () => {
        try {
            const [uRes, gRes] = await Promise.all([
                api.get('/users/list'),
                api.get('/users/groups')
            ]);
            setUsers(uRes.data.users || []);
            setGroups(gRes.data.groups || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (!selectedEntity) return;
        const endpoint = view === 'direct' 
            ? `/users/messages/${selectedEntity.id}` 
            : `/users/groups/${selectedEntity.id}/messages`;
        
        api.get(endpoint)
            .then(({ data }) => setMessages(data.messages || []))
            .catch(console.error);
    }, [selectedEntity, view]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedEntity) return;
        try {
            const endpoint = view === 'direct' ? '/users/messages' : `/users/groups/${selectedEntity.id}/messages`;
            const payload = view === 'direct' 
                ? { receiver_id: selectedEntity.id, content: newMessage.trim() }
                : { content: newMessage.trim() };
            
            const { data } = await api.post(endpoint, payload);
            setMessages(prev => [...prev, { 
                ...data.message, 
                sender_username: user.username, 
                sender_first_name: user.first_name || user.username 
            }]);
            setNewMessage('');
        } catch (err) { console.error(err); }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/groups', { name: groupName, memberIds: selectedMembers });
            setShowCreateGroup(false);
            setGroupName('');
            setSelectedMembers([]);
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => { setView('direct'); setSelectedEntity(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'direct' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
                    >
                        Direct
                    </button>
                    <button 
                        onClick={() => { setView('groups'); setSelectedEntity(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'groups' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
                    >
                        Groups
                    </button>
                </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex" style={{ height: '75vh' }}>
                {/* Sidebar */}
                <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{view} Messages</span>
                        {view === 'groups' && (
                            <button onClick={() => setShowCreateGroup(true)} className="p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors">
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {(view === 'direct' ? users : groups).map(item => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedEntity(item)}
                                className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-white transition-all border-b border-slate-50 ${selectedEntity?.id === item.id ? 'bg-white border-l-4 border-l-brand-500 shadow-sm' : ''}`}
                            >
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100 flex items-center justify-center font-bold text-brand-700 text-lg uppercase flex-shrink-0">
                                    {(item.username || item.name)?.[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900 truncate">{item.first_name ? `${item.first_name} ${item.last_name || ''}` : (item.username || item.name)}</p>
                                    <p className="text-xs text-slate-500 truncate">{item.role || (item.id === user.id ? 'Admin' : 'Group Chat')}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedEntity ? (
                        <>
                            <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center font-bold text-brand-600 uppercase">
                                    {(selectedEntity.username || selectedEntity.name)?.[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{selectedEntity.first_name ? `${selectedEntity.first_name} ${selectedEntity.last_name || ''}` : (selectedEntity.username || selectedEntity.name)}</p>
                                    <p className="text-xs text-brand-500 font-medium">{view === 'direct' ? selectedEntity.role : 'Active Group'}</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                                {messages.map(msg => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!isMe && view === 'groups' && (
                                                <div className="h-8 w-8 rounded-full bg-slate-200 mr-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {msg.sender_username?.[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className={`max-w-xs lg:max-w-md ${isMe ? 'bg-brand-600 text-white rounded-2xl rounded-tr-none shadow-brand-200/50' : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none'} px-4 py-3 shadow-sm`}>
                                                {!isMe && view === 'groups' && <p className="text-[10px] font-black text-brand-500 mb-1 uppercase tracking-tighter">{msg.sender_username}</p>}
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-1.5 font-medium ${isMe ? 'text-brand-200 text-right' : 'text-slate-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center space-x-3">
                                <input
                                    type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Write something..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="p-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-brand-200 transition-all active:scale-95">
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                            {view === 'direct' ? <User size={64} className="mb-4 opacity-20" /> : <Users size={64} className="mb-4 opacity-20" />}
                            <p className="font-bold text-slate-500">Pick a conversation</p>
                            <p className="text-sm mt-1">Select from the list to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">New Group Chat</h2>
                            <button onClick={() => setShowCreateGroup(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Group Name</label>
                                <input 
                                    type="text" required value={groupName} onChange={e => setGroupName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Invite Members</label>
                                <div className="max-height-[200px] overflow-y-auto space-y-2">
                                    {users.map(u => (
                                        <label key={u.id} className="flex items-center p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                                            <input 
                                                type="checkbox" value={u.id} 
                                                checked={selectedMembers.includes(u.id)}
                                                onChange={e => {
                                                    const id = parseInt(e.target.value);
                                                    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                                                }}
                                                className="h-4 w-4 text-brand-600 rounded mr-3"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{u.first_name || u.username} ({u.role})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={!groupName || selectedMembers.length === 0} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl transition-all hover:bg-brand-600 disabled:opacity-50">
                                Create Group
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messaging;
