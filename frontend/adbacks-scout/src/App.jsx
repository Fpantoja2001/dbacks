// import React, { useState, useEffect } from 'react';
// import { 
//   User, Calendar, Plus, Play, Clock, Check, X, 
//   Database, Home, History, ChevronLeft, Activity,
//   Save, UserPlus, Settings, Search, Filter, Trash2, Square, Users,
//   ChevronRight, FileText
// } from 'lucide-react';

// // --- API CONFIGURATION ---
// const API_BASE_URL = 'http://localhost'; 
// const USE_DEMO_MODE = true; 

// // --- MOCK DATA FOR DEMO MODE ---
// // Mutable mock storage
// const DB = {
//   players: [
//     { id: 'p1', first_name: 'Corbin', last_name: 'Carroll', position: 'OF', throw: 'L', bat: 'L', player_class: '2023', height: "5'10\"", weight: "165" },
//     { id: 'p2', first_name: 'Zac', last_name: 'Gallen', position: 'P', throw: 'R', bat: 'R', player_class: '2019', height: "6'2\"", weight: "198" },
//     { id: 'p3', first_name: 'Ketel', last_name: 'Marte', position: '2B', throw: 'R', bat: 'S', player_class: '2015', height: "6'1\"", weight: "210" },
//     { id: 'p4', first_name: 'Christian', last_name: 'Walker', position: '1B', throw: 'R', bat: 'R', player_class: '2012', height: "6'0\"", weight: "208" },
//     { id: 'p5', first_name: 'Alek', last_name: 'Thomas', position: 'OF', throw: 'L', bat: 'L', player_class: '2022', height: "5'11\"", weight: "175" },
//   ],
//   // Store sessions here
//   sessions: [
//     { id: 's-past-1', session_date: '2025-10-10', is_active: false, turns: [] }
//   ],
//   // Current active session placeholder
//   activeSessionId: null
// };

// // --- API SERVICE LAYER ---
// const api = {
//   request: async (endpoint, method = 'GET', body = null) => {
//     if (USE_DEMO_MODE) return api.mockRequest(endpoint, method, body);

//     const options = {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//     };
//     if (body) options.body = JSON.stringify(body);

//     // eslint-disable-next-line no-useless-catch
//     try {
//       const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || 'API Error');
//       return data;
//     } catch (err) {
//       throw err;
//     }
//   },

//   mockRequest: async (endpoint, method, body) => {
//     await new Promise(r => setTimeout(r, 300)); 

//     // Auth
//     if (endpoint.includes('/token/create')) return { id: 'mock-token-123' };
//     if (endpoint.includes('/user/login')) return { detail: 'Logged in' };
    
//     // User / Roster
//     if (endpoint.includes('/user/') && method === 'GET') {
//       return { id: 'u1', first_name: 'Scout', last_name: 'User', players: [...DB.players] };
//     }
    
//     // Player Create
//     if (endpoint.includes('/player/create') || endpoint.includes('/player/fast-create')) {
//       const newPlayer = { ...body, id: Math.random().toString(36).substr(2, 9), player_class: '2025' };
//       DB.players.push(newPlayer);
//       return newPlayer;
//     }
    
//     // Sessions
//     if (endpoint.includes('/session/create')) {
//       const newSession = { id: 's-' + Math.random(), session_date: body.session_date, is_active: true, turns: [] };
//       DB.sessions.push(newSession);
//       DB.activeSessionId = newSession.id;
//       return newSession;
//     }
    
//     if (endpoint.includes('/session/active')) {
//       const active = DB.sessions.find(s => s.is_active);
//       return active || null;
//     }

//     if (endpoint.includes('/session/') && endpoint.includes('/end')) {
//       const parts = endpoint.split('/'); // /session/{id}/end
//       const sId = parts[2];
//       const session = DB.sessions.find(s => s.id === sId);
//       if (session) session.is_active = false;
//       DB.activeSessionId = null;
//       return session;
//     }

//     // History
//     if (endpoint.includes('/session/history')) {
//       return DB.sessions.filter(s => !s.is_active).sort((a,b) => new Date(b.session_date) - new Date(a.session_date));
//     }
    
//     // Turns
//     if (endpoint.includes('/turn/create')) {
//       // Find active session
//       const session = DB.sessions.find(s => s.id === body.session_id);
//       const newTurn = { 
//         id: 't-' + Math.random(), 
//         session_id: body.session_id, 
//         batter_id: body.batter_id, 
//         pitcher_id: body.pitcher_id, 
//         start_time: body.start_time || null,
//         balls: 0, strikes: 0, outs: 0, 
//         is_complete: false, 
//         pitches: [] 
//       };
//       if (session) session.turns.push(newTurn);
//       return newTurn;
//     }

//     if (endpoint.includes('/turn/') && endpoint.includes('/mark')) return { success: true };
    
//     // Pitches
//     if (endpoint.includes('/pitch/add')) {
//       // Update the turn in the DB to reflect pitch count (simplified)
//       const session = DB.sessions.find(s => s.turns.find(t => t.id === body.turn_id));
//       if (session) {
//         const turn = session.turns.find(t => t.id === body.turn_id);
//         turn.pitches.push(body);
//         // Simple logic update for preview purposes
//         if(body.pitch_result === 'ball') turn.balls++;
//         if(body.pitch_result === 'strike_call') turn.strikes++;
//       }
//       return { 
//         id: 'p-' + Math.random(), 
//         pitch_result: body.pitch_result, 
//         pitch_type: body.pitch_type, 
//         release_speed: body.release_speed 
//       };
//     }

//     return {};
//   }
// };

// // --- COMPONENT: LAYOUT ---
// const MobileContainer = ({ children }) => (
//   <div className="flex justify-center items-center min-h-screen bg-gray-900 font-sans">
//     <div className="w-full max-w-md h-[850px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-gray-800">
//       {children}
//     </div>
//   </div>
// );

// const Header = ({ title, onBack, rightAction }) => (
//   <div className="bg-red-700 text-white p-4 pt-6 flex items-center justify-between shadow-md shrink-0 z-10">
//     <div className="flex items-center gap-2">
//       {onBack && (
//         <button onClick={onBack} className="p-1 hover:bg-red-800 rounded-full">
//           <ChevronLeft size={24} />
//         </button>
//       )}
//       <h1 className="text-xl font-bold tracking-wide">{title}</h1>
//     </div>
//     {rightAction}
//   </div>
// );

// const BottomNav = ({ activeTab, onTabChange }) => (
//   <div className="bg-white border-t border-gray-200 p-3 flex justify-around shrink-0 pb-6">
//     <NavButton icon={<Home size={24} />} label="Home" active={activeTab === 'home'} onClick={() => onTabChange('home')} />
//     <NavButton icon={<Database size={24} />} label="Players" active={activeTab === 'players'} onClick={() => onTabChange('players')} />
//     <NavButton icon={<History size={24} />} label="History" active={activeTab === 'history'} onClick={() => onTabChange('history')} />
//   </div>
// );

// const NavButton = ({ icon, label, active, onClick }) => (
//   <button 
//     onClick={onClick}
//     className={`flex flex-col items-center gap-1 ${active ? 'text-red-700' : 'text-gray-400'}`}
//   >
//     {icon}
//     <span className="text-xs font-medium">{label}</span>
//   </button>
// );

// // --- SCREENS ---

// // 1. LOGIN SCREEN
// const LoginScreen = ({ onLogin }) => {
//   const [email, setEmail] = useState('scout@dbacks.com');
//   const [password, setPassword] = useState('password');
//   const [token, setToken] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     try {
//       await api.request('/user/login', 'POST', { email, password, token });
//       onLogin();
//     } catch (e) {
//       alert('Login failed: ' + e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 space-y-6">
//       <div className="w-20 h-20 bg-red-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
//         <Activity className="text-white" size={40} />
//       </div>
//       <h1 className="text-2xl font-bold text-gray-800">A-Dbacks Scout</h1>
      
//       <div className="w-full space-y-4">
//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
//           <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
//         </div>
//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
//           <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
//         </div>
//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase">Auth Token</label>
//           <input value={token} onChange={e => setToken(e.target.value)} placeholder="Required" className="w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
//         </div>
//       </div>

//       <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
//         {loading ? 'Logging in...' : 'Start Scouting'}
//       </button>
//       <div className="text-center text-xs text-gray-400 mt-4">{USE_DEMO_MODE ? 'DEMO MODE ACTIVE' : 'CONNECTED TO LOCALHOST'}</div>
//     </div>
//   );
// };

// // 2. HOME SCREEN
// const HomeScreen = ({ onNavigate, session, setSession }) => {
//   const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

//   const createSession = async () => {
//     try {
//       const dateStr = new Date().toISOString().split('T')[0];
//       const res = await api.request('/session/create', 'POST', { session_date: dateStr });
//       setSession(res);
//       onNavigate('roster_select');
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   const resumeSession = async () => {
//     try {
//       const res = await api.request('/session/active');
//       if (res) {
//         setSession(res);
//         onNavigate('session_view');
//       } else {
//         alert("No active session found.");
//       }
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   return (
//     <div className="flex-1 bg-gray-50 flex flex-col p-6 space-y-6 overflow-y-auto">
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//         <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Today's Date</h2>
//         <p className="text-2xl font-bold text-gray-800 mt-1">{today}</p>
//       </div>
//       <div className="grid grid-cols-1 gap-4">
//         <button onClick={createSession} className="bg-red-600 text-white p-6 rounded-2xl shadow-md flex items-center justify-between hover:bg-red-700 transition-colors">
//           <div className="text-left"><div className="font-bold text-xl">Start Session</div><div className="text-red-100 text-sm">Begin a new scouting report</div></div>
//           <Play size={32} fill="currentColor" />
//         </button>
//         <button onClick={resumeSession} className="bg-white text-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors">
//           <div className="text-left"><div className="font-bold text-xl">Resume Active</div><div className="text-gray-400 text-sm">Continue where you left off</div></div>
//           <Activity size={32} className="text-red-600" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // 3. ROSTER SELECT
// const RosterSelect = ({ onNavigate, setSessionRoster }) => {
//   const [allPlayers, setAllPlayers] = useState([]);
//   const [selectedIds, setSelectedIds] = useState(new Set());
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       const u = await api.request('/user/');
//       setAllPlayers(u.players);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   const toggleId = (id) => {
//     const next = new Set(selectedIds);
//     if (next.has(id)) next.delete(id);
//     else next.add(id);
//     setSelectedIds(next);
//   };

//   const handleSave = () => {
//     const roster = allPlayers.filter(p => selectedIds.has(p.id));
//     setSessionRoster(roster);
//     onNavigate('session_view');
//   };

//   return (
//     <div className="flex-1 flex flex-col bg-white">
//       <div className="p-4 bg-gray-50 border-b">
//         <h2 className="font-bold text-lg">Session Roster</h2>
//         <p className="text-xs text-gray-500">Select everyone present today.</p>
//       </div>
//       <div className="flex-1 overflow-y-auto p-2">
//         {loading ? <div className="p-4 text-center">Loading...</div> : allPlayers.map(p => (
//           <div key={p.id} onClick={() => toggleId(p.id)} className={`flex items-center p-3 border-b cursor-pointer ${selectedIds.has(p.id) ? 'bg-red-50' : ''}`}>
//             <div className={`w-6 h-6 rounded border mr-4 flex items-center justify-center ${selectedIds.has(p.id) ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
//               {selectedIds.has(p.id) && <Check size={14} className="text-white" />}
//             </div>
//             <div className="flex-1">
//               <div className="font-bold">{p.first_name} {p.last_name}</div>
//               <div className="text-xs text-gray-500">{p.position} • Class {p.player_class}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="p-4 border-t">
//         <button onClick={handleSave} disabled={selectedIds.size === 0} className={`w-full py-4 rounded-xl font-bold text-white ${selectedIds.size > 0 ? 'bg-red-700' : 'bg-gray-300'}`}>
//           Confirm Roster ({selectedIds.size})
//         </button>
//       </div>
//     </div>
//   );
// };

// // 4. SESSION VIEW (PREVIEW)
// const SessionView = ({ session, sessionRoster, onNavigate, onEndSession }) => {
//   const [turns, setTurns] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTurns = async () => {
//       setLoading(true);
//       try {
//         // Refresh session data to get latest turns
//         const currentSession = await api.request('/session/active');
//         if (currentSession) setTurns(currentSession.turns || []);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (session) fetchTurns();
//   }, [session]); // Re-fetch when session prop changes/loads

//   const handleEndSession = async () => {
//     if (confirm("Are you sure you want to end this session? It will be moved to history.")) {
//       try {
//         await api.request(`/session/${session.id}/end`, 'POST');
//         onEndSession(); // Callback to navigate to history/home
//       } catch (e) {
//         alert("Error ending session");
//       }
//     }
//   };

//   // Helper to get name from ID
//   const getName = (id) => {
//     const p = sessionRoster.find(p => p.id === id) || DB.players.find(p => p.id === id);
//     return p ? `${p.first_name.charAt(0)}. ${p.last_name}` : 'Unknown';
//   };

//   return (
//     <div className="flex-1 flex flex-col bg-gray-50">
//       <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Session Preview</h2>
//           <div className="text-xs text-gray-500">{session.session_date} • {turns.length} Turns</div>
//         </div>
//         <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">LIVE</span>
//       </div>

//       <div className="flex-1 p-4 overflow-y-auto space-y-3">
//         {loading ? (
//           <div className="text-center p-4 text-gray-400">Refreshing...</div>
//         ) : turns.length === 0 ? (
//           <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4 border-2 border-dashed border-gray-200 rounded-xl">
//             <Activity size={48} className="opacity-20" />
//             <p>No turns recorded yet.</p>
//           </div>
//         ) : (
//           turns.map((turn, idx) => (
//             <div key={turn.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
//               <div>
//                 <div className="text-xs text-gray-400 font-bold mb-1">TURN #{idx + 1}</div>
//                 <div className="font-bold text-gray-800">
//                   {getName(turn.pitcher_id)} <span className="text-gray-400 text-xs mx-1">vs</span> {getName(turn.batter_id)}
//                 </div>
//                 <div className="text-xs text-gray-500 mt-1">
//                   {turn.pitches?.length || 0} Pitches • {turn.is_complete ? 'Completed' : 'In Progress'}
//                 </div>
//               </div>
//               <div className="bg-gray-100 p-2 rounded-lg">
//                 <ChevronRight size={20} className="text-gray-400" />
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="p-4 bg-white border-t shadow-lg space-y-3">
//         <button 
//           onClick={() => onNavigate('turn_setup')}
//           className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
//         >
//           <Plus size={20} />
//           Add Turn
//         </button>

//         <button 
//           onClick={handleEndSession}
//           className="w-full py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
//         >
//           <Save size={20} />
//           End Session & Save
//         </button>
//       </div>
//     </div>
//   );
// };

// // 5. TURN SETUP
// const TurnSetup = ({ sessionRoster, onSelect, onBack }) => {
//   const [batter, setBatter] = useState(null);
//   const [pitcher, setPitcher] = useState(null);

//   const handleStart = () => {
//     if (batter && pitcher) onSelect({ batter, pitcher });
//   };

//   return (
//     <div className="flex-1 flex flex-col bg-white">
//       <div className="p-4 border-b bg-gray-50">
//         <h2 className="font-bold text-lg">Who is up?</h2>
//         <p className="text-xs text-gray-500">Select players from active roster.</p>
//       </div>
      
//       <div className="flex-1 p-4 space-y-6">
//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Pitcher</label>
//           <div className="grid grid-cols-2 gap-2">
//             {sessionRoster.filter(p => p.position === 'P' || p.position).map(p => (
//               <button 
//                 key={p.id} onClick={() => setPitcher(p)}
//                 className={`p-3 rounded-lg border text-left transition-all ${pitcher?.id === p.id ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}
//               >
//                 <div className="font-bold text-sm">{p.first_name} {p.last_name}</div>
//                 <div className="text-xs text-gray-400">Pitcher</div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Batter</label>
//           <div className="grid grid-cols-2 gap-2">
//             {sessionRoster.map(p => (
//               <button 
//                 key={p.id} onClick={() => setBatter(p)}
//                 className={`p-3 rounded-lg border text-left transition-all ${batter?.id === p.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
//               >
//                 <div className="font-bold text-sm">{p.first_name} {p.last_name}</div>
//                 <div className="text-xs text-gray-400">{p.position}</div>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="p-4 border-t">
//         <button onClick={handleStart} disabled={!batter || !pitcher} className={`w-full py-4 rounded-xl font-bold text-white ${batter && pitcher ? 'bg-red-700' : 'bg-gray-300'}`}>
//           Enter Turn Mode
//         </button>
//       </div>
//     </div>
//   );
// };

// // 6. TURN VIEW
// const TurnView = ({ session, turnData, onBack }) => {
//   const [turn, setTurn] = useState(null);
//   const [balls, setBalls] = useState(0);
//   const [strikes, setStrikes] = useState(0);
//   const [speed, setSpeed] = useState('');
//   const [pitchType, setPitchType] = useState(null);
  
//   const [startTime, setStartTime] = useState(null);
//   const [selectedResult, setSelectedResult] = useState(null);
//   const [showStopModal, setShowStopModal] = useState(false);
  
//   useEffect(() => {
//     const initTurn = async () => {
//       try {
//         const res = await api.request('/turn/create', 'POST', {
//           session_id: session.id,
//           batter_id: turnData.batter.id,
//           pitcher_id: turnData.pitcher.id,
//         });
//         setTurn(res);
//         if (res.start_time) setStartTime(res.start_time);
//       } catch (e) {
//         alert(e.message);
//       }
//     };
//     if (!turn) initTurn();
//   }, []);

//   const handleMark = async () => {
//     if (!turn) return;
//     const time = new Date().toLocaleTimeString();

//     if (!startTime) {
//       await api.request(`/turn/${turn.id}/mark`, 'POST', { mark_time: time });
//       setStartTime(time);
//     } else {
//       setShowStopModal(true);
//     }
//   };

//   const confirmStop = async () => {
//     try {
//       const time = new Date().toLocaleTimeString();
//       await api.request(`/turn/${turn.id}/mark`, 'POST', { mark_time: time });
//       setShowStopModal(false);
//       onBack(); 
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleDiscardPitch = () => {
//     setSelectedResult(null);
//     setSpeed('');
//   };

//   const handleSavePitch = async () => {
//     if (!turn || !selectedResult) return;
//     if (selectedResult === 'ball') setBalls(b => Math.min(b + 1, 4));
//     if (['strike_call', 'swing_miss', 'foul'].includes(selectedResult)) {
//       if (selectedResult === 'foul' && strikes === 2) { /* no op */ }
//       else setStrikes(s => Math.min(s + 1, 3));
//     }

//     try {
//       const payload = {
//         turn_id: turn.id,
//         pitch_type: pitchType || 'FB',
//         pitch_result: selectedResult,
//         release_speed: parseFloat(speed) || 0
//       };
//       await api.request('/pitch/add', 'POST', payload);
//       setSpeed(''); 
//       setSelectedResult(null);
//     } catch (e) {
//       console.error(e);
//       alert("Failed to save pitch");
//     }
//   };

//   if (!turn) return <div className="flex-1 flex items-center justify-center">Loading Turn...</div>;

//   const ResultButton = ({ value, label, colorClass, heightClass = 'h-20' }) => (
//     <button 
//       onClick={() => setSelectedResult(value)} 
//       className={`${heightClass} rounded-xl font-bold text-sm sm:text-base shadow-sm transition-all border-2 ${selectedResult === value ? 'bg-gray-800 text-white border-gray-800 scale-105 shadow-lg ring-2 ring-offset-2 ring-gray-400' : `${colorClass} border-transparent opacity-90 hover:opacity-100`}`}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div className="flex-1 flex flex-col bg-gray-100 relative">
//       <div className="bg-white p-4 shadow-sm z-10">
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-sm">
//             <div className="text-gray-500 text-xs uppercase">Pitcher</div>
//             <div className="font-bold">{turnData.pitcher.last_name}</div>
//           </div>
//           <div className="text-2xl font-mono font-bold text-gray-800 tracking-widest bg-gray-100 px-4 py-1 rounded-lg">
//             <span className={balls === 4 ? 'text-green-600' : ''}>{balls}</span>
//             <span className="text-gray-300 mx-2">-</span>
//             <span className={strikes === 3 ? 'text-red-600' : ''}>{strikes}</span>
//           </div>
//           <div className="text-sm text-right">
//             <div className="text-gray-500 text-xs uppercase">Batter</div>
//             <div className="font-bold">{turnData.batter.last_name}</div>
//           </div>
//         </div>
        
//         <button 
//           onClick={handleMark}
//           className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md ${startTime ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700 animate-pulse'}`}
//         >
//           {startTime ? <Square size={18} fill="currentColor" /> : <Clock size={18} />}
//           {startTime ? 'STOP / END TURN' : 'MARK START TIME'}
//         </button>
//       </div>

//       <div className="flex-1 p-4 overflow-y-auto relative">
//         {!startTime ? (
//           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100/50 z-0">
//             <Clock size={64} className="mb-4 text-gray-300" />
//             <p className="text-center max-w-[200px] font-medium">Press "Mark Start Time" above to begin recording pitches.</p>
//           </div>
//         ) : (
//           <div className="space-y-4 pb-24">
//             <div className="bg-white p-4 rounded-xl shadow-sm">
//               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Release Speed</label>
//               <div className="flex gap-2">
//                 <input type="number" value={speed} onChange={e => setSpeed(e.target.value)} placeholder="MPH" className="flex-1 text-3xl font-bold p-2 border-b-2 border-gray-200 focus:border-red-500 outline-none text-center text-gray-800" />
//                 <button className="bg-gray-100 px-4 rounded-lg font-bold text-gray-500 text-sm">N/A</button>
//               </div>
//             </div>
//             <div className="bg-white p-4 rounded-xl shadow-sm">
//               <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Pitch Type</label>
//               <div className="grid grid-cols-4 gap-2">
//                 {['FB', 'CB', 'CH', 'SL'].map(type => (
//                   <button key={type} onClick={() => setPitchType(type)} className={`p-3 rounded-lg font-bold text-sm transition-all ${pitchType === type ? 'bg-gray-800 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600'}`}>{type}</button>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block ml-1">Select Result</label>
//               <div className="grid grid-cols-2 gap-3">
//                 <ResultButton value="ball" label="BALL" colorClass="bg-blue-500 text-white" />
//                 <ResultButton value="strike_call" label="STRIKE" colorClass="bg-red-500 text-white" />
//                 <ResultButton value="swing_miss" label="Swing & Miss" colorClass="bg-red-400 text-white" heightClass="h-16" />
//                 <ResultButton value="foul" label="Foul" colorClass="bg-yellow-500 text-white" heightClass="h-16" />
//                 <div className="col-span-2 grid grid-cols-4 gap-2 mt-1">
//                   <ResultButton value="hit" label="HIT" colorClass="bg-green-500 text-white" heightClass="h-12" />
//                   <ResultButton value="out" label="OUT" colorClass="bg-gray-500 text-white" heightClass="h-12" />
//                   <ResultButton value="walk" label="WALK" colorClass="bg-blue-400 text-white" heightClass="h-12" />
//                   <ResultButton value="hbp" label="HBP" colorClass="bg-orange-400 text-white" heightClass="h-12" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {startTime && (
//         <div className="bg-white p-4 border-t shadow-lg z-20 flex gap-3">
//           <button onClick={handleDiscardPitch} disabled={!selectedResult} className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${selectedResult ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'}`}>
//             <Trash2 size={20} /> Discard
//           </button>
//           <button onClick={handleSavePitch} disabled={!selectedResult} className={`flex-[2] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${selectedResult ? 'bg-red-700 text-white hover:bg-red-800 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
//             <Save size={20} /> {selectedResult ? 'SAVE PITCH' : 'Select Result'}
//           </button>
//         </div>
//       )}

//       {showStopModal && (
//         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
//             <h3 className="text-xl font-bold text-gray-900 mb-2">End Turn?</h3>
//             <p className="text-gray-600 mb-6">This will stop the timer and save the current turn data.</p>
//             <div className="flex gap-3">
//               <button onClick={() => setShowStopModal(false)} className="flex-1 py-3 bg-gray-100 font-bold text-gray-700 rounded-xl">Cancel</button>
//               <button onClick={confirmStop} className="flex-1 py-3 bg-red-600 font-bold text-white rounded-xl shadow-lg">End Turn</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // 7. PLAYER DATABASE
// const PlayerDatabase = () => {
//   const [players, setPlayers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [formData, setFormData] = useState({
//     first_name: '', last_name: '', position: 'P', 
//     date_of_birth: '2005-01-01', height: '', weight: '', 
//     throw: 'R', bat: 'R', birth_city: ''
//   });

//   const fetchPlayers = async () => {
//     setLoading(true);
//     try {
//       const user = await api.request('/user/');
//       setPlayers(user.players || []);
//     } catch (e) {
//       alert('Failed to load players');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchPlayers(); }, []);

//   const handleCreate = async () => {
//     try {
//       await api.request('/player/create', 'POST', formData);
//       setShowAddModal(false);
//       fetchPlayers(); 
//       setFormData({ first_name: '', last_name: '', position: 'P', date_of_birth: '2005-01-01', height: '', weight: '', throw: 'R', bat: 'R', birth_city: '' });
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col bg-gray-50 relative">
//       <div className="p-4 bg-white border-b flex gap-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-3 text-gray-400" size={18} />
//           <input className="w-full pl-10 p-2.5 bg-gray-100 rounded-lg text-sm" placeholder="Search players..." />
//         </div>
//         <button className="p-2 bg-gray-100 rounded-lg"><Filter size={20} className="text-gray-600" /></button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-2 space-y-2">
//         {loading ? <div className="p-4 text-center text-gray-400">Loading roster...</div> : players.map(p => (
//           <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="font-bold text-gray-800 text-lg">{p.first_name} {p.last_name}</span>
//                 <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">{p.position}</span>
//               </div>
//               <div className="text-xs text-gray-500 mt-1 flex gap-3">
//                 <span>Class: {p.player_class || 'N/A'}</span>
//                 <span>•</span>
//                 <span>{p.height || '-'}, {p.weight ? `${p.weight}lb` : '-'}</span>
//                 <span>•</span>
//                 <span>B/T: {p.bat}/{p.throw}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="absolute bottom-4 right-4">
//         <button onClick={() => setShowAddModal(true)} className="bg-red-700 text-white p-4 rounded-full shadow-lg hover:bg-red-800 transition-colors"><Plus size={28} /></button>
//       </div>

//       {showAddModal && (
//         <div className="absolute inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
//           <div className="bg-white w-full h-[90%] rounded-t-3xl sm:rounded-3xl sm:w-[90%] sm:h-auto flex flex-col">
//             <div className="p-4 border-b flex justify-between items-center">
//               <h2 className="text-lg font-bold">Add New Player</h2>
//               <button onClick={() => setShowAddModal(false)} className="p-1 bg-gray-100 rounded-full"><X size={20} /></button>
//             </div>
            
//             <div className="p-6 space-y-4 overflow-y-auto flex-1">
//               <div className="grid grid-cols-2 gap-3">
//                 <div><label className="text-xs font-bold text-gray-500">First Name</label><input className="w-full p-2 border rounded-lg" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500">Last Name</label><input className="w-full p-2 border rounded-lg" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
//               </div>
//                <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-xs font-bold text-gray-500">Position</label>
//                   <select className="w-full p-2 border rounded-lg bg-white" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
//                     <option value="P">Pitcher</option><option value="C">Catcher</option><option value="1B">1st Base</option><option value="OF">Outfield</option>
//                   </select>
//                 </div>
//                 <div><label className="text-xs font-bold text-gray-500">DOB</label><input type="date" className="w-full p-2 border rounded-lg" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} /></div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div><label className="text-xs font-bold text-gray-500">Height (ft'in")</label><input className="w-full p-2 border rounded-lg" placeholder="6'2&quot;" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} /></div>
//                 <div><label className="text-xs font-bold text-gray-500">Weight (lbs)</label><input type="number" className="w-full p-2 border rounded-lg" placeholder="195" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                  <div><label className="text-xs font-bold text-gray-500">Throws</label><div className="flex gap-2 mt-1">{['R', 'L'].map(h => (<button key={h} onClick={() => setFormData({...formData, throw: h})} className={`flex-1 py-2 rounded text-sm font-bold ${formData.throw === h ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>{h}</button>))}</div></div>
//                  <div><label className="text-xs font-bold text-gray-500">Bats</label><div className="flex gap-2 mt-1">{['R', 'L', 'S'].map(h => (<button key={h} onClick={() => setFormData({...formData, bat: h})} className={`flex-1 py-2 rounded text-sm font-bold ${formData.bat === h ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>{h}</button>))}</div></div>
//               </div>
//             </div>

//             <div className="p-4 border-t">
//               <button onClick={handleCreate} className="w-full bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg">Save Player Profile</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // 8. HISTORY VIEW
// const HistoryView = () => {
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       const data = await api.request('/session/history');
//       setSessions(data || []);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col bg-gray-50">
//       <div className="bg-white p-4 border-b">
//         <h2 className="font-bold text-lg">History</h2>
//         <p className="text-xs text-gray-500">All saved sessions</p>
//       </div>
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {loading ? <div className="text-center text-gray-400">Loading...</div> : 
//          sessions.length === 0 ? <div className="text-center text-gray-400 pt-10">No past sessions found.</div> :
//          sessions.map(s => (
//           <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//              <div className="flex justify-between items-start">
//                <div>
//                  <div className="font-bold text-gray-800">{new Date(s.session_date).toLocaleDateString(undefined, { dateStyle: 'full' })}</div>
//                  <div className="text-xs text-gray-500 mt-1">{s.turns?.length || 0} Turns Recorded</div>
//                </div>
//                <div className="bg-gray-100 p-2 rounded-full"><FileText size={20} className="text-gray-500" /></div>
//              </div>
//           </div>
//          ))
//         }
//       </div>
//     </div>
//   );
// };

// // --- MAIN APP CONTAINER ---
// export default function App() {
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('home');
//   const [viewStack, setViewStack] = useState(['home']); 
  
//   const [currentSession, setCurrentSession] = useState(null);
//   const [sessionRoster, setSessionRoster] = useState([]); // New state for session roster
//   const [turnData, setTurnData] = useState(null); 

//   const currentView = viewStack[viewStack.length - 1];

//   const navigate = (view) => setViewStack(prev => [...prev, view]);
//   const goBack = () => setViewStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

//   const handleEndSession = () => {
//     setCurrentSession(null);
//     setSessionRoster([]);
//     setActiveTab('history');
//     setViewStack(['history']); // Reset stack to history
//   };

//   if (!user) {
//     return <MobileContainer><LoginScreen onLogin={() => setUser({ name: 'Scout' })} /></MobileContainer>;
//   }

//   let content;
//   let headerTitle = 'A-Dbacks';
//   let showNav = true;
//   let showBack = false;

//   switch (currentView) {
//     case 'home':
//       content = <HomeScreen onNavigate={navigate} session={currentSession} setSession={setCurrentSession} />;
//       headerTitle = 'Dashboard';
//       break;
//     case 'roster_select': 
//       content = <RosterSelect onNavigate={navigate} setSessionRoster={setSessionRoster} />;
//       headerTitle = 'Select Session Roster';
//       showBack = true;
//       showNav = false;
//       break;
//     case 'session_view':
//       content = <SessionView session={currentSession} sessionRoster={sessionRoster} onNavigate={navigate} onEndSession={handleEndSession} />;
//       headerTitle = 'Session';
//       showBack = true;
//       showNav = false;
//       break;
//     case 'turn_setup': 
//       content = <TurnSetup sessionRoster={sessionRoster} onSelect={(data) => { setTurnData(data); navigate('turn_view'); }} onBack={goBack} />;
//       headerTitle = 'Turn Setup';
//       showBack = true;
//       showNav = false;
//       break;
//     case 'turn_view':
//       content = <TurnView session={currentSession} turnData={turnData} onBack={goBack} />;
//       headerTitle = 'Live Tracking';
//       showBack = true;
//       showNav = false;
//       break;
//     case 'players':
//       content = <PlayerDatabase />;
//       headerTitle = 'Roster';
//       break;
//     case 'history':
//       content = <HistoryView />;
//       headerTitle = 'History';
//       break;
//     default:
//       content = <div>Unknown View</div>;
//   }

//   return (
//     <MobileContainer>
//       <Header title={headerTitle} onBack={showBack ? goBack : null} />
//       {content}
//       {showNav && <BottomNav activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); navigate(t); }} />}
//     </MobileContainer>
//   );
// }