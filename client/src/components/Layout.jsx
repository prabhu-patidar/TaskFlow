import PushNotificationButton from './PushNotificationButton';
import TaskReminders from './TaskReminders';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, LogOut, Plus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Layout() { const { user, logout } = useAuth(); const navigate = useNavigate(); const leave = () => { logout(); navigate('/login'); }; return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-icon"><Zap size={19}/></span> taskflow<span className="brand-dot">.</span></div><div className="workspace-label">WORKSPACE</div><nav><NavLink to="/dashboard"><LayoutDashboard size={18}/> Overview</NavLink><NavLink to="/tasks"><CheckSquare size={18}/> My tasks</NavLink></nav><div className="sidebar-bottom"><div className="user-chip"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="user-meta"><b>{user?.name}</b><small>{user?.email}</small></div><button className="icon-btn" title="Log out" onClick={leave}><LogOut size={17}/></button></div></div></aside><main className="main-area"><header className="topbar"><div><span className="eyebrow">PERSONAL WORKSPACE</span><div className="topbar-title">Make progress, every day.</div></div><TaskReminders />
<PushNotificationButton />
<button className="btn btn-primary" onClick={() => navigate('/tasks?new=1')}><Plus size={17}/> New task</button></header><section className="page-content"><Outlet/></section></main></div>; }
