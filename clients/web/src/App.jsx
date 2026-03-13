import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [view, setView] = useState('feed'); // feed, jobs, events

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    if (!token) {
        return <AuthScreen setToken={(t) => { setToken(t); localStorage.setItem('token', t); }} setUser={(u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} />;
    }

    return (
        <div style={styles.appContainer}>
            <Sidebar view={view} setView={setView} user={user} logout={logout} />
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <h2>{view.charAt(0).toUpperCase() + view.slice(1)} Dashboard</h2>
                </header>
                <div style={styles.contentArea}>
                    {view === 'feed' && <Feed token={token} user={user} />}
                    {view === 'jobs' && <Jobs token={token} user={user} />}
                    {view === 'events' && <Events token={token} user={user} />}
                </div>
            </main>
        </div>
    );
}

function AuthScreen({ setToken, setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/users/login' : '/users/register';
        const body = isLogin ? { username, password } : { username, password, role };

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            if (isLogin) {
                setToken(data.token);
                setUser(data.user);
            } else {
                alert('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.authContainer}>
            <form onSubmit={handleSubmit} style={styles.authForm}>
                <h2>DECP Platform</h2>
                <h3>{isLogin ? 'Sign In' : 'Create Account'}</h3>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input style={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                {!isLogin && (
                    <select style={styles.input} value={role} onChange={e => setRole(e.target.value)}>
                        <option value="Student">Student</option>
                        <option value="Alumni">Alumni</option>
                        <option value="Admin">Admin</option>
                    </select>
                )}
                <button type="submit" style={styles.button}>{isLogin ? 'Login' : 'Register'}</button>
                <p style={{ cursor: 'pointer', color: '#0066cc' }} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </p>
            </form>
        </div>
    );
}

function Sidebar({ view, setView, user, logout }) {
    return (
        <div style={styles.sidebar}>
            <h2 style={{ color: 'white', marginBottom: '2rem' }}>DECP</h2>
            <button style={view === 'feed' ? styles.activeNavBtn : styles.navBtn} onClick={() => setView('feed')}>Feed</button>
            <button style={view === 'jobs' ? styles.activeNavBtn : styles.navBtn} onClick={() => setView('jobs')}>Jobs</button>
            <button style={view === 'events' ? styles.activeNavBtn : styles.navBtn} onClick={() => setView('events')}>Events</button>

            <div style={{ marginTop: 'auto', color: 'white' }}>
                <p>Logged in as: <b>{user?.username}</b> ({user?.role})</p>
                <button style={{ ...styles.button, backgroundColor: '#dc3545', width: '100%' }} onClick={logout}>Logout</button>
            </div>
        </div>
    );
}

function Feed({ token, user }) {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');

    const fetchPosts = async () => {
        const res = await fetch(`${API_BASE}/feed`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setPosts(data.posts || []);
    };

    useEffect(() => { fetchPosts(); }, []);

    const submitPost = async (e) => {
        e.preventDefault();
        if (!content) return;
        const res = await fetch(`${API_BASE}/feed/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
        if (res.ok) { setContent(''); fetchPosts(); }
    };

    return (
        <div>
            <form onSubmit={submitPost} style={styles.card}>
                <textarea style={{ ...styles.input, minHeight: '80px' }} placeholder="What's happening in the department?" value={content} onChange={e => setContent(e.target.value)} />
                <button type="submit" style={{ ...styles.button, width: '150px' }}>Share Post</button>
            </form>
            {posts.map(p => (
                <div key={p.id} style={styles.card}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{p.username} <span style={{ color: '#666', fontSize: '12px' }}>({p.role})</span></div>
                    <p>{p.content}</p>
                    <small style={{ color: '#999' }}>{new Date(p.created_at).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
}

function Jobs({ token, user }) {
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const fetchJobs = async () => {
        const res = await fetch(`${API_BASE}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setJobs(data.jobs || []);
    };

    useEffect(() => { fetchJobs(); }, []);

    const submitJob = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_BASE}/jobs/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, description: desc })
        });
        if (res.ok) { setTitle(''); setDesc(''); fetchJobs(); }
        else { const errDetail = await res.json(); alert(errDetail.error); }
    };

    return (
        <div>
            {(user.role === 'Admin' || user.role === 'Alumni') && (
                <form onSubmit={submitJob} style={styles.card}>
                    <h3>Post an Opportunity</h3>
                    <input style={styles.input} type="text" placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <textarea style={{ ...styles.input, minHeight: '80px' }} placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} required />
                    <button type="submit" style={{ ...styles.button, width: '150px' }}>Post Job</button>
                </form>
            )}
            {jobs.map(j => (
                <div key={j.id} style={styles.card}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{j.title}</h3>
                    <p>{j.description}</p>
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        Posted by: {j.username} ({j.role}) | {new Date(j.created_at).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}

function Events({ token, user }) {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');

    const fetchEvents = async () => {
        const res = await fetch(`${API_BASE}/events`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setEvents(data.events || []);
    };

    useEffect(() => { fetchEvents(); }, []);

    const submitEvent = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_BASE}/events/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, date: new Date(date).toISOString() })
        });
        if (res.ok) { setTitle(''); setDate(''); fetchEvents(); }
        else { const errDetail = await res.json(); alert(errDetail.error); }
    };

    return (
        <div>
            {user.role === 'Admin' && (
                <form onSubmit={submitEvent} style={styles.card}>
                    <h3>Schedule Event</h3>
                    <input style={styles.input} type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <input style={styles.input} type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                    <button type="submit" style={{ ...styles.button, width: '150px' }}>Create Event</button>
                </form>
            )}
            {events.map(e => (
                <div key={e.id} style={styles.card}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{e.title}</h3>
                    <p>Date: {new Date(e.date).toLocaleString()}</p>
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        Organized by: {e.username} | {new Date(e.created_at).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    appContainer: { display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f7fa', color: '#333' },
    sidebar: { width: '250px', backgroundColor: '#1e293b', padding: '20px', display: 'flex', flexDirection: 'column' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { backgroundColor: 'white', padding: '20px', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    contentArea: { padding: '20px', overflowY: 'auto', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%' },
    authContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fa', fontFamily: 'system-ui, sans-serif' },
    authForm: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
    button: { padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    navBtn: { padding: '10px', backgroundColor: 'transparent', color: '#cbd5e1', border: 'none', textAlign: 'left', fontSize: '16px', cursor: 'pointer', marginBottom: '5px', borderRadius: '4px' },
    activeNavBtn: { padding: '10px', backgroundColor: '#334155', color: 'white', border: 'none', textAlign: 'left', fontSize: '16px', cursor: 'pointer', marginBottom: '5px', borderRadius: '4px', fontWeight: 'bold' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }
};

export default App;
