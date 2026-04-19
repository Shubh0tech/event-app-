/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MessageSquare, 
  User as UserIcon, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Send, 
  LogOut, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Share2,
  CalendarPlus,
  CheckSquare,
  UserCircle,
  Award,
  History,
  Trophy,
  Medal,
  Gift,
  Users,
  Compass,
  Layers,
  BarChart2,
  Map as MapIcon,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertCircle,
  SlidersHorizontal,
  Star,
  Camera,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet default marker icons not showing up in common loaders
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { io, Socket } from 'socket.io-client';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Event, Message } from './types';
import { DateTimePicker } from './components/DateTimePicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const USD_TO_INR = 83.50;

const EVENT_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1540575861501-7ad0582371f3', name: 'Conference Hall' },
  { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865', name: 'Corporate Event' },
  { url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678', name: 'Technology' },
  { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952', name: 'Meeting' },
  { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', name: 'Festival' },
  { url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94', name: 'Crowd' },
];

const AVATAR_GALLERY = [
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', name: 'Avatar 1' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', name: 'Avatar 2' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harley', name: 'Avatar 3' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jace', name: 'Avatar 4' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liza', name: 'Avatar 5' },
];

function ImageGallery({ isOpen, onClose, onSelect, type }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void, type: 'avatar' | 'event' | 'user_gallery' }) {
  const images = type === 'avatar' ? AVATAR_GALLERY : EVENT_GALLERY;
  const [customUrl, setCustomUrl] = useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Choose a {type === 'avatar' ? 'Profile Photo' : type === 'event' ? 'Event Header' : 'Gallery Photo'}</h3>
                  <p className="text-neutral-400 text-sm">Select from our gallery or provide your own URL</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {images.map((img) => (
                  <button 
                    key={img.url}
                    onClick={() => { onSelect(img.url); onClose(); }}
                    className="aspect-video rounded-2xl overflow-hidden hover:ring-4 ring-black ring-offset-2 transition-all group relative"
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="text-white" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-widest pl-2">Or paste custom URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-neutral-50 p-4 rounded-2xl outline-none border focus:border-neutral-200 transition-all font-medium"
                  />
                  <button 
                    disabled={!customUrl}
                    onClick={() => { onSelect(customUrl); onClose(); }}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-bold transition-all",
                      customUrl ? "bg-black text-white hover:scale-105" : "bg-neutral-100 text-neutral-400"
                    )}
                  >
                    Use URL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'event' | 'recommendations' | 'profile' | 'my-events' | 'analytics' | 'groups' | 'map'>(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return (savedUser && savedToken) ? 'dashboard' : 'landing';
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [imagePicker, setImagePicker] = useState<{ isOpen: boolean, type: 'avatar' | 'event' | 'user_gallery', onSelect: (url: string) => void }>({ isOpen: false, type: 'avatar', onSelect: () => {} });
  const [groups, setGroups] = useState<any[]>([]);
  const [isLogin, setIsLogin] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return !!(savedUser && savedToken);
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, eventId: string | null }>({
    isOpen: false,
    eventId: null
  });
  const [createEventModal, setCreateEventModal] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    type: 'CONFERENCE',
    date: '',
    location: '',
    price: '',
    capacity: '100',
    lat: '',
    lng: '',
    swags: false,
    categories: [] as string[],
    activities: [] as { title: string, time: string }[],
    imageUrl: ''
  });

  const handleUpdateProfile = async (name: string, interests: string[], bio: string, age: number, avatarUrl?: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, interests, bio, age, avatarUrl })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to update profile');
    }
  };

  const handleAddDirectPhoto = async (url: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`/api/users/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const fetchMeRes = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fetchMeRes.ok) {
          const updatedUser = await fetchMeRes.json();
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error('Failed to add personal photo');
    }
  };

  const handleUpdateEvent = async (eventId: string, data: Partial<Event>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchEvents();
        if (selectedEventId === eventId) {
          fetchEvents(); 
        }
      }
    } catch (err) {
      console.error('Failed to update event');
    }
  };

  const fetchMe = async (t: string) => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch user me');
    }
  };

  const handleShare = async (event: Event) => {
    const shareData = {
      title: event.name,
      text: `Check out ${event.name} on Event OS!`,
      url: window.location.origin
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleAddToCalendar = (event: Event) => {
    const startDate = new Date(event.date).toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${event.name}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `DESCRIPTION:${event.description}`,
      'LOCATION:Conference Hall C',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user && token) {
      if (view === 'landing' || view === 'auth') {
        setView('dashboard');
      }
      fetchEvents();
      fetchMe(token);
      fetchGroups();
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.log('Location access denied'),
          { enableHighAccuracy: true }
        );
      }

      const newSocket = io(window.location.origin);
      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }
  }, [token]);

  const fetchEvents = async () => {
    if (events.length === 0) setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error('Failed to fetch groups');
    }
  };

  const handleCreateGroup = async (name: string, description: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        fetchGroups();
        alert('Group created successfully!');
      }
    } catch (err) {
      console.error('Failed to create group');
    }
  };

  const handleFollowGroup = async (groupId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGroups();
        fetchMe(token);
      } else {
        alert('You are already following this group');
      }
    } catch (err) {
      console.error('Failed to follow group');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setView('landing');
    if (socket) socket.disconnect();
  };

  const handleRegister = async (eventId: string) => {
    if (!user || !token) return;
    
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        // Refresh local data
        fetchEvents();
        setConfirmModal({ isOpen: false, eventId: null });
      } else {
        const data = await res.json();
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error');
    }
  };

  const handleUpdateRegStatus = async (regId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/registrations/${regId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchEvents();
        alert(`Registration ${status.toLowerCase()} successfully!`);
      }
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    if (!token) return;
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        fetchEvents();
        setCreateEventModal(false);
        setEventForm({
          name: '',
          description: '',
          type: 'CONFERENCE',
          date: '',
          location: '',
          price: '',
          capacity: '100',
          lat: '',
          lng: '',
          swags: false,
          categories: [],
          activities: [],
          imageUrl: ''
        });
        alert('Event created successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleAiAssist = async () => {
    if (!aiKeywords.trim()) return;
    setIsAiGenerating(true);
    try {
      const prompt = `Suggest event details for an event with these keywords: ${aiKeywords}. 
      The suggestions should be catchy, professional and complete.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["CONFERENCE", "WORKSHOP", "MEETUP", "WEBINAR", "HACKATHON", "NETWORKING", "DESIGN_SESSION", "TECH_TALK", "PRODUCT_LAUNCH"] },
              activities: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    title: { type: Type.STRING }, 
                    time: { type: Type.STRING } 
                  },
                  required: ["title", "time"]
                } 
              }
            },
            required: ["name", "description", "type", "activities"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setEventForm(prev => ({
        ...prev,
        name: data.name,
        description: data.description,
        type: data.type === 'DESIGN_SESSION' || data.type === 'TECH_TALK' || data.type === 'PRODUCT_LAUNCH' ? 'CONFERENCE' : data.type,
        activities: data.activities
      }));
      setShowAiInput(false);
      setAiKeywords('');
    } catch (err) {
      console.error('AI Error:', err);
      alert('AI assistant failed to generate suggestions. Please try again.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const currentEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#1A1A1A]">
      <AnimatePresence mode="wait" initial={false}>
        {view === 'landing' && (
          <motion.div key="landing">
            <LandingView onGetStarted={() => setView('auth')} />
          </motion.div>
        )}
        {view === 'auth' && (
          <motion.div key="auth">
            <AuthView 
              isLogin={isLogin} 
              setIsLogin={setIsLogin} 
              onSuccess={(u, t) => {
                setUser(u);
                setToken(t);
                localStorage.setItem('user', JSON.stringify(u));
                localStorage.setItem('token', t);
                setView('dashboard');
              }} 
            />
          </motion.div>
        )}
        {(view === 'dashboard' || view === 'event' || view === 'recommendations' || view === 'profile' || view === 'my-events' || view === 'analytics' || view === 'groups' || view === 'map') && user && (
          <motion.div 
            key="app" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-20 md:pb-0 md:ml-64"
          >
            <Sidebar activeView={view} setView={setView} user={user} onLogout={handleLogout} onCreateEvent={() => setCreateEventModal(true)} />
            <main className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
              <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Dashboard 
                      events={events} 
                      userCoords={userCoords}
                      user={user}
                      onSelectEvent={(id) => {
                        setSelectedEventId(id);
                        setView('event');
                      }} 
                      loading={loading}
                      onShare={handleShare}
                      onAddToCalendar={handleAddToCalendar}
                    />
                  </motion.div>
                )}
                {view === 'map' && (
                  <motion.div 
                    key="map"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <MapView events={events} userCoords={userCoords} onSelectEvent={(id) => { setSelectedEventId(id); setView('event'); }} />
                  </motion.div>
                )}
                {view === 'groups' && (
                  <motion.div 
                    key="groups"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <GroupsView 
                      groups={groups} 
                      user={user} 
                      onCreate={handleCreateGroup} 
                      onFollow={handleFollowGroup} 
                    />
                  </motion.div>
                )}
                {view === 'analytics' && (
                  <motion.div 
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AnalyticsView 
                      events={events} 
                      user={user} 
                      onUpdateStatus={handleUpdateRegStatus}
                    />
                  </motion.div>
                )}
                {view === 'my-events' && (
                  <motion.div 
                    key="my-events"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Dashboard 
                      events={events.filter(e => e.registrations?.some((r: any) => r.userId === user.id))} 
                      user={user}
                      onSelectEvent={(id) => {
                        setSelectedEventId(id);
                        setView('event');
                      }} 
                      loading={loading}
                      onShare={handleShare}
                      onAddToCalendar={handleAddToCalendar}
                      title="My Registered Events"
                    />
                  </motion.div>
                )}
                {view === 'profile' && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ProfileView user={user} onUpdate={handleUpdateProfile} setImagePicker={setImagePicker} onAddPhoto={handleAddDirectPhoto} />
                  </motion.div>
                )}
                {view === 'event' && currentEvent && (
                  <motion.div 
                    key={`event-${selectedEventId}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <EventDetail 
                      event={currentEvent} 
                      user={user} 
                      socket={socket} 
                      onBack={() => setView('dashboard')} 
                      onRegister={() => setConfirmModal({ isOpen: true, eventId: currentEvent.id })}
                      onRefresh={fetchEvents}
                      onShare={handleShare}
                      setImagePicker={setImagePicker}
                      onUpdateEvent={handleUpdateEvent}
                    />
                  </motion.div>
                )}
                {view === 'recommendations' && (
                  <motion.div 
                    key="recommendations"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Recommendations 
                      user={user} 
                      events={events} 
                      userCoords={userCoords}
                      onSelectEvent={(id) => {
                        setSelectedEventId(id);
                        setView('event');
                      }} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <ImageGallery 
              isOpen={imagePicker.isOpen} 
              onClose={() => setImagePicker({ ...imagePicker, isOpen: false })}
              onSelect={imagePicker.onSelect}
              type={imagePicker.type}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, eventId: null })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <CalendarPlus className="text-black" size={32} />
              </div>
              <h2 className="text-2xl font-black mb-2">Confirm Registration</h2>
              <p className="text-neutral-500 mb-8 leading-relaxed font-medium">
                Are you sure you want to register for this event?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, eventId: null })}
                  className="flex-1 py-4 bg-neutral-100 text-neutral-500 font-bold rounded-2xl hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmModal.eventId && handleRegister(confirmModal.eventId)}
                  className="flex-1 py-4 bg-black text-white font-bold rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-black/10"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setCreateEventModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black mb-1">Create Event</h2>
                  <p className="text-neutral-500 font-medium">Schedule a new session for the community</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAiInput(!showAiInput)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm",
                      showAiInput ? "bg-black text-white" : "bg-neutral-100 text-[#1A1A1A] hover:bg-neutral-200"
                    )}
                  >
                    <Sparkles size={16} />
                    {showAiInput ? "Close AI Help" : "AI Assist"}
                  </button>
                  <button 
                    onClick={() => {
                      setCreateEventModal(false);
                      setShowAiInput(false);
                    }}
                    className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  >
                    <X />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAiInput && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-8"
                  >
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[32px] border border-indigo-100/50 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Sparkles size={16} className="text-indigo-600" />
                        </div>
                        <p className="text-sm font-bold text-indigo-900">AI Event Architect</p>
                      </div>
                      <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">Enter a few keywords about your event, and I'll help you architect the title, description, and suggested activities.</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="text" 
                          value={aiKeywords}
                          onChange={(e) => setAiKeywords(e.target.value)}
                          placeholder="e.g. hackathon, developers, AI agents, San Francisco..."
                          className="flex-1 bg-white p-4 rounded-2xl outline-none border border-indigo-200 text-sm font-medium focus:ring-2 ring-indigo-500/10 transition-all"
                        />
                        <button 
                          onClick={handleAiAssist}
                          disabled={isAiGenerating || !aiKeywords.trim()}
                          className="bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                          {isAiGenerating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Architecting...
                            </>
                          ) : "Generate"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={(e) => {
                e.preventDefault();
                const latNum = parseFloat(eventForm.lat);
                const lngNum = parseFloat(eventForm.lng);
                
                if (latNum && (latNum < -90 || latNum > 90)) {
                  alert('Latitude must be between -90 and 90');
                  return;
                }
                if (lngNum && (lngNum < -180 || lngNum > 180)) {
                  alert('Longitude must be between -180 and 180');
                  return;
                }

                if (!eventForm.date) {
                  alert('Please select a date and time for your event');
                  return;
                }

                handleCreateEvent({
                  ...eventForm,
                  lat: latNum || 37.7749,
                  lng: lngNum || -122.4194,
                  price: parseFloat(eventForm.price) || 0,
                  capacity: parseInt(eventForm.capacity) || 100,
                  categories: eventForm.categories
                });
              }} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Event Title</label>
                  <input 
                    name="name" 
                    required 
                    value={eventForm.name}
                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                    placeholder="e.g. SF AI Hackathon 2026"
                    className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Event Category</label>
                    <select 
                      name="type" 
                      value={eventForm.type}
                      onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                      className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium appearance-none text-sm"
                    >
                      <option value="CONFERENCE">Conference</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="MEETUP">Meetup</option>
                      <option value="WEBINAR">Webinar</option>
                      <option value="HACKATHON">Hackathon</option>
                      <option value="NETWORKING">Networking</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Date & Time</label>
                    <DateTimePicker 
                      value={eventForm.date}
                      onChange={(date) => setEventForm({...eventForm, date})}
                      placeholder="Select event date & time"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Venue / Virtual Link</label>
                    <input 
                      name="location" 
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                      placeholder="e.g. Moscone Center, SF" 
                      className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Event Price ($)</label>
                    <input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={eventForm.price}
                      onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                      placeholder="0.00 (Free)" 
                      className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Latitude (-90 to 90)</label>
                    <input 
                      name="lat" 
                      type="number" 
                      step="any" 
                      placeholder="37.7749" 
                      min="-90"
                      max="90"
                      value={eventForm.lat}
                      onChange={(e) => setEventForm({...eventForm, lat: e.target.value})}
                      className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Max Capacity</label>
                    <input 
                      name="capacity" 
                      type="number" 
                      placeholder="100" 
                      min="1"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
                      className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Longitude (-180 to 180)</label>
                    <input 
                      name="lng" 
                      type="number" 
                      step="any" 
                      placeholder="-122.4194" 
                      min="-180"
                      max="180"
                      value={eventForm.lng}
                      onChange={(e) => setEventForm({...eventForm, lng: e.target.value})}
                      className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Cover Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        name="imageUrl" 
                        value={eventForm.imageUrl}
                        onChange={(e) => setEventForm({...eventForm, imageUrl: e.target.value})}
                        placeholder="https://..." 
                        className="flex-1 bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                      />
                      <button 
                        type="button"
                        onClick={() => setImagePicker({ 
                          isOpen: true, 
                          type: 'event', 
                          onSelect: (url) => setEventForm({...eventForm, imageUrl: url}) 
                        })}
                        className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-neutral-800 transition-all shadow-xl"
                      >
                        <Sparkles size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">About the Event</label>
                  <textarea 
                    name="description" 
                    rows={4} 
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="Share what attendees can expect from this session..."
                    className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium resize-none text-sm leading-relaxed" 
                  />
                </div>

                {/* Activities Section */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 block">Planned Activities</label>
                  <div className="space-y-3">
                    {eventForm.activities.map((activity, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <input 
                          type="text" 
                          placeholder="Activity Title"
                          value={activity.title}
                          onChange={(e) => {
                            const newActivities = [...eventForm.activities];
                            newActivities[idx].title = e.target.value;
                            setEventForm({...eventForm, activities: newActivities});
                          }}
                          className="flex-1 bg-neutral-50 p-3 rounded-xl outline-none border border-transparent focus:border-neutral-200 text-sm font-medium"
                        />
                        <input 
                          type="text" 
                          placeholder="Time"
                          value={activity.time}
                          onChange={(e) => {
                            const newActivities = [...eventForm.activities];
                            newActivities[idx].time = e.target.value;
                            setEventForm({...eventForm, activities: newActivities});
                          }}
                          className="w-24 bg-neutral-50 p-3 rounded-xl outline-none border border-transparent focus:border-neutral-200 text-sm font-medium"
                        />
                        <button 
                          onClick={() => {
                            const newActivities = eventForm.activities.filter((_, i) => i !== idx);
                            setEventForm({...eventForm, activities: newActivities});
                          }}
                          className="p-3 text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setEventForm({
                        ...eventForm,
                        activities: [...eventForm.activities, { title: '', time: '' }]
                      })}
                      className="w-full py-4 border-2 border-dashed border-neutral-100 rounded-2xl text-neutral-400 hover:border-neutral-200 hover:text-neutral-500 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                    >
                      <Plus size={16} />
                      Add Activity
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 block ml-2">Categories (Comma separated)</label>
                  <input 
                    name="categories" 
                    value={eventForm.categories.join(', ')}
                    onChange={(e) => setEventForm({...eventForm, categories: e.target.value.split(',').map(c => c.trim()).filter(c => c !== '')})}
                    placeholder="e.g. AI, Hackathon, Networking" 
                    className="w-full bg-neutral-50 p-6 rounded-3xl outline-none focus:bg-white border focus:border-neutral-200 transition-all font-medium" 
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-50 p-6 rounded-3xl border border-transparent hover:border-neutral-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Gift className="text-pink-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Event Swags</p>
                      <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">T-shirts, stickers, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-400">No</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={eventForm.swags}
                        onChange={(e) => setEventForm({...eventForm, swags: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black"></div>
                    </label>
                    <span className={cn("text-xs font-bold", eventForm.swags ? "text-black" : "text-neutral-400")}>Yes</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-black text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.01] transition-all active:scale-95 shadow-2xl shadow-black/20"
                >
                  Publish Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalyticsView({ events, user, onUpdateStatus }: { 
  events: Event[], 
  user: User, 
  onUpdateStatus: (regId: string, status: 'ACCEPTED' | 'REJECTED') => void 
}) {
  const [activeTab, setActiveTab ] = useState<'stats' | 'manage'>('stats');
  const myEvents = events.filter(e => e.organizerId === user.id);
  const pendingRegistrations = myEvents.reduce((acc: any[], event) => {
    const pending = event.registrations?.filter(r => r.status === 'PENDING') || [];
    return [...acc, ...pending.map(p => ({ ...p, eventName: event.name }))];
  }, []);

  const totalRegistrations = events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0);
  const avgRegistrations = events.length ? (totalRegistrations / events.length).toFixed(1) : 0;
  
  const chartData = events.map(e => ({
    name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
    registrations: e.registrations?.length || 0
  })).sort((a, b) => b.registrations - a.registrations).slice(0, 10);

  const typeData = events.reduce((acc: any[], e) => {
    const existing = acc.find(item => item.name === e.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: e.type, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Organizer Dashboard</h1>
          <p className="text-neutral-500">Manage your events and track performance</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
              activeTab === 'stats' ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            )}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'manage' ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            )}
          >
            Manage Attendees
            {pendingRegistrations.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {pendingRegistrations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Total Events</p>
          <p className="text-4xl font-black">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Total Registrations</p>
          <p className="text-4xl font-black">{totalRegistrations}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Avg. per Event</p>
          <p className="text-4xl font-black">{avgRegistrations}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm min-h-[400px]">
          <h3 className="text-xl font-bold mb-8">Registrations by Event</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A3A3A3' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A3A3A3' }} />
                <Tooltip 
                  cursor={{ fill: '#F5F5F5' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="registrations" fill="#000000" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm min-h-[400px]">
          <h3 className="text-xl font-bold mb-8">Event Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {typeData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-neutral-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold mb-6">Top Performing Events</h3>
        <div className="space-y-4">
          {events.sort((a, b) => (b.registrations?.length || 0) - (a.registrations?.length || 0)).slice(0, 5).map((event, i) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-neutral-400">
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold">{event.name}</p>
                  <p className="text-xs text-neutral-400 capitalize">{event.type.toLowerCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-lg">{event.registrations?.length || 0}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Attending</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  ) : (
    <div className="space-y-6">
      <div className="bg-white rounded-[40px] p-8 border border-neutral-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Pending Registrations</h3>
        {pendingRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
            <CheckCircle2 size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500 font-medium">All caught up! No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRegistrations.map((reg) => (
              <div key={reg.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-neutral-50 rounded-[32px] gap-6 border border-transparent hover:border-neutral-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl font-black text-neutral-300">
                    {reg.user?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{reg.user?.name}</p>
                    <p className="text-sm text-neutral-500 mb-1">{reg.user?.email}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-neutral-100 shadow-xs">
                      <Calendar size={12} className="text-neutral-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{reg.eventName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onUpdateStatus(reg.id, 'REJECTED')}
                    className="px-6 py-3 bg-white text-rose-500 border border-neutral-200 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-colors"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(reg.id, 'ACCEPTED')}
                    className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    Approve Participant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}
</div>
);
}

function GroupsView({ groups, user, onCreate, onFollow }: { 
  groups: any[], 
  user: User, 
  onCreate: (name: string, desc: string) => void,
  onFollow: (id: string) => void
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Community Groups</h1>
          <p className="text-neutral-500">Connect with like-minded participants</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-xl mb-8 space-y-4">
              <h3 className="text-xl font-bold">New Community Group</h3>
              <input 
                type="text" 
                placeholder="Group Name" 
                className="w-full p-4 bg-neutral-50 rounded-2xl outline-none border border-neutral-100 focus:ring-2 ring-black/5 transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <textarea 
                placeholder="What is this group about?" 
                className="w-full p-4 bg-neutral-50 rounded-2xl outline-none border border-neutral-100 focus:ring-2 ring-black/5 transition-all h-32"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => { onCreate(name, desc); setName(''); setDesc(''); setShowCreate(false); }}
                  className="px-8 py-3 bg-black text-white rounded-xl font-bold"
                >
                  Launch Group
                </button>
                <button onClick={() => setShowCreate(false)} className="px-8 py-3 text-neutral-500 font-bold">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
                <Users size={24} />
              </div>
              <div className="px-3 py-1 bg-neutral-50 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400">
                By {group.owner?.name}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{group.name}</h3>
            <p className="text-neutral-500 text-sm line-clamp-2 mb-6 flex-1">{group.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center text-[10px] font-bold">
                  +{group.followers?.length || 0}
                </div>
              </div>
              <button 
                onClick={() => onFollow(group.id)}
                disabled={group.followers?.some((f: any) => f.userId === user.id)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  group.followers?.some((f: any) => f.userId === user.id) 
                    ? "bg-neutral-100 text-neutral-400" 
                    : "bg-black text-white hover:scale-105 active:scale-95"
                )}
              >
                {group.followers?.some((f: any) => f.userId === user.id) ? 'Following' : 'Join Group'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapView({ events, userCoords, onSelectEvent }: { events: Event[], userCoords: any, onSelectEvent: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const center: [number, number] = userCoords ? [userCoords.lat, userCoords.lng] : [20.5937, 78.9629]; // Default India

  const filteredEvents = events.filter(e => 
    e.lat && e.lng && 
    (e.name.toLowerCase().includes(search.toLowerCase()) || 
     e.location?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Map Explorer</h1>
          <p className="text-neutral-500">Discover events across India</p>
        </div>
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search city or event name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-neutral-100 shadow-sm outline-none focus:ring-4 ring-black/5 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white p-2 rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden h-[600px] relative z-0">
        <MapContainer 
          center={center} 
          zoom={5} 
          style={{ height: '100%', width: '100%', borderRadius: '32px' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {filteredEvents.map(event => (
            <Marker key={event.id} position={[event.lat!, event.lng!]}>
              <Popup className="rounded-[20px] overflow-hidden">
                <div className="p-3 min-w-[200px]">
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl mb-3" referrerPolicy="no-referrer" />
                  )}
                  <p className="font-bold text-lg mb-1 leading-tight">{event.name}</p>
                  <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1">
                    <MapPin size={12} className="text-indigo-600" />
                    {event.location}
                  </p>
                  <button 
                    onClick={() => onSelectEvent(event.id)}
                    className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10"
                  >
                    View Experience
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

// --- Views ---

function ProfileView({ user, onUpdate, setImagePicker, onAddPhoto }: { 
  user: User, 
  onUpdate: (name: string, interests: string[], bio: string, age: number, avatarUrl?: string) => void,
  setImagePicker: (picker: any) => void,
  onAddPhoto: (url: string) => void
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [age, setAge] = useState(user.age || 0);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(() => {
    if (Array.isArray(user.interests)) return user.interests;
    if (typeof user.interests === 'string') return user.interests.split(',').filter(Boolean);
    return [];
  });

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) {
        setInterests([...interests, interestInput.trim()]);
      }
      setInterestInput('');
    }
  };

  const removeInterest = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
  };

  const pastEvents = user.registrations?.filter(r => {
    const eventDate = (r as any).event?.date;
    return eventDate && new Date(eventDate) < new Date();
  }) || [];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-6 mb-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center text-4xl text-white font-black">
                      {name[0]}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setImagePicker({ 
                    isOpen: true, 
                    type: 'avatar', 
                    onSelect: (url) => setAvatarUrl(url) 
                  })}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title="Change Avatar"
                >
                  <Sparkles size={14} />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-black mb-1">Public Profile</h1>
                <p className="text-neutral-500">How others see you on Event OS</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border border-transparent focus:border-neutral-200 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Age</label>
                  <input 
                    type="number" 
                    value={age || ''}
                    onChange={e => setAge(parseInt(e.target.value))}
                    className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border border-transparent focus:border-neutral-200 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Bio</label>
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-neutral-50 p-4 rounded-2xl outline-none focus:bg-white border border-transparent focus:border-neutral-200 transition-all font-medium min-h-[120px] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Professional Interests</label>
                <div className="bg-neutral-50 p-2 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-neutral-200 transition-all">
                  <div className="flex flex-wrap gap-2 mb-2 p-2">
                    {interests.map(interest => (
                      <span key={interest} className="px-3 py-1.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="hover:text-red-400 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={interestInput}
                    onChange={e => setInterestInput(e.target.value)}
                    onKeyDown={handleAddInterest}
                    placeholder="Add topics of interest..."
                    className="w-full bg-transparent p-2 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={() => onUpdate(name, interests, bio, age, avatarUrl)}
                className="w-full py-5 bg-black text-white rounded-[24px] font-bold hover:scale-[1.01] transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
              >
                Save Profile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-neutral-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Calendar className="text-neutral-400" />
              Events I'm Organizing
            </h2>
            {user.organizedEvents && user.organizedEvents.length > 0 ? (
              <div className="space-y-4">
                {user.organizedEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-6 bg-neutral-50 rounded-3xl group border border-transparent hover:border-neutral-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-neutral-300 shadow-sm">
                        {event.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{event.name}</p>
                        <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
                          {new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                         {event.registrations?.length || 0} Registrations
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                <p className="text-neutral-400 font-medium">You haven't created any events yet.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-neutral-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <History className="text-neutral-400" />
              Past Experiences
            </h2>
            {pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.map((reg: any) => (
                  <div key={reg.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-500">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">{reg.event.name}</h4>
                      <p className="text-xs text-neutral-400">
                        {new Date(reg.event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(reg.event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-400">
                <p>No past events yet. Attend more to grow your history!</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Camera className="text-neutral-400" />
                Personal Gallery
              </h2>
              <button 
                onClick={() => setImagePicker({
                  isOpen: true,
                  type: 'user_gallery',
                  onSelect: (url: string) => onAddPhoto(url)
                })}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} />
                Add Photo
              </button>
            </div>
            {user.photos && user.photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {user.photos.map((photo: any) => (
                  <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img 
                      src={photo.url} 
                      alt="" 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                <p className="text-neutral-400 font-medium">No moments captured yet.</p>
                <p className="text-[10px] text-neutral-300 uppercase font-black mt-1">Upload photos to see them here</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-8 text-white shadow-xl">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <Trophy className="text-white/80" />
              Achievements
            </h2>
            <div className="space-y-4">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map(badge => (
                  <motion.div 
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        {badge.icon === 'Sparkles' ? <Sparkles size={20} /> : <Award size={20} />}
                      </div>
                      <span className="font-black text-sm uppercase tracking-wider">{badge.name}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{badge.description}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-white/50">
                  <Medal size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold">Earn badges by attending events!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-neutral-100">
            <h3 className="font-black mb-4 uppercase tracking-widest text-[10px] text-neutral-400">Activity Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-3xl text-center">
                <p className="text-2xl font-black">{user.registrations?.length || 0}</p>
                <p className="text-[10px] uppercase font-bold text-neutral-400">Events</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-3xl text-center">
                <p className="text-2xl font-black">{user.badges?.length || 0}</p>
                <p className="text-[10px] uppercase font-bold text-neutral-400">Badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingView({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
      >
        <Calendar className="text-white w-10 h-10" />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-6xl font-bold tracking-tight mb-4"
      >
        Event OS
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-neutral-500 max-w-md mb-12"
      >
        Your entire event lifecycle, automated. Networking, scheduling, and AI recommendations.
      </motion.p>
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onGetStarted}
        className="px-10 py-4 bg-black text-white rounded-full font-semibold hover:scale-105 transition-transform"
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}

function AuthView({ isLogin, setIsLogin, onSuccess }: { 
  isLogin: boolean, 
  setIsLogin: (l: boolean) => void, 
  onSuccess: (u: User, t: string) => void 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email, password } : { 
      name, 
      email, 
      password, 
      interests: interests.split(',').map(i => i.trim()).filter(Boolean) 
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.user || data, data.token || '');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex items-center justify-center p-6 bg-[#F5F5F5]"
    >
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-sm">
        <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-neutral-500 mb-8">{isLogin ? 'Sign in to continue to Event OS' : 'Start your journey with us today'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full p-4 bg-neutral-100 rounded-2xl outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="Interests (e.g. AI, Design, Web3)" 
                className="w-full p-4 bg-neutral-100 rounded-2xl outline-none"
                value={interests}
                onChange={e => setInterests(e.target.value)}
              />
            </>
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-4 bg-neutral-100 rounded-2xl outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-neutral-100 rounded-2xl outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-4 bg-black text-white rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-neutral-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-black font-bold">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

function Sidebar({ activeView, setView, user, onLogout, onCreateEvent }: { 
  activeView: string, 
  setView: (v: any) => void, 
  user: User,
  onLogout: () => void,
  onCreateEvent: () => void
}) {
  const items = [
    { id: 'dashboard', label: 'Discover', icon: Calendar },
    { id: 'my-events', label: 'My Events', icon: CheckSquare },
    { id: 'map', label: 'Map Explorer', icon: MapIcon },
    { id: 'recommendations', label: 'AI Planner', icon: Sparkles },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white h-screen fixed left-0 top-0 border-r border-neutral-200">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Event OS</span>
        </div>
        
        <button 
          onClick={onCreateEvent}
          className="mx-4 flex items-center gap-4 px-4 py-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] font-bold hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-indigo-500/20 mb-8"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={20} />
          </div>
          Create Event
        </button>

        <nav className="flex-1 px-4 space-y-2">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all",
                activeView === item.id ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 p-4 mb-2">
            <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
              <UserIcon className="text-neutral-500" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-1 left-4 right-4 bg-white/80 backdrop-blur-xl border border-neutral-200 flex justify-around p-3 z-50 rounded-[32px] shadow-2xl shadow-black/10">
        {items.slice(0, 4).map(item => (
          <button 
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "p-3 rounded-2xl transition-all",
              activeView === item.id ? "bg-black text-white" : "text-neutral-500"
            )}
          >
            <item.icon size={22} />
          </button>
        ))}
        <button 
          onClick={onCreateEvent}
          className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20"
        >
          <Plus size={22} />
        </button>
        <button 
          onClick={() => setView('profile')}
          className={cn(
            "p-3 rounded-2xl transition-all",
            activeView === 'profile' ? "bg-black text-white" : "text-neutral-500"
          )}
        >
          <UserIcon size={22} />
        </button>
      </nav>
    </>
  );
}

const getEventImage = (event: Event, width = 800, height = 600) => {
  if (event.imageUrl) return event.imageUrl;
  const query = `${event.type},${event.name}`.toLowerCase().replace(/[^a-z0-9]/g, ',');
  return `https://source.unsplash.com/featured/${width}x${height}?${encodeURIComponent(query)}`;
};

function EventCard({ event, user, onSelectEvent, onShare, onAddToCalendar, setFilterType }: {
  event: Event,
  user: User,
  onSelectEvent: (id: string) => void,
  onShare: (e: Event) => void,
  onAddToCalendar: (e: Event) => void,
  setFilterType: any,
  key?: any
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelectEvent(event.id)}
      className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 group cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 mb-6 overflow-hidden rounded-[24px] flex-shrink-0">
        <img 
          src={getEventImage(event)} 
          alt={event.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setFilterType(event.type);
          }}
          className={cn(
            "absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-110 active:scale-95",
            event.type === 'CONFERENCE' ? "bg-indigo-600 text-white" :
            event.type === 'WORKSHOP' ? "bg-amber-500 text-white" :
            "bg-emerald-500 text-white"
          )}
        >
          {event.type}
        </button>
        {event.swags && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <Gift size={12} className="text-pink-500" />
            <span className="text-[9px] font-black text-pink-600 uppercase">Swags</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-neutral-700">{event.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-neutral-400 text-sm line-clamp-1 flex-1">{event.description}</p>
        <span className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border",
          (event.price || 0) === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-neutral-50 border-neutral-100 text-neutral-600"
        )}>
          {(event.price || 0) === 0 ? 'Free' : `$${event.price} / ₹${((event.price || 0) * USD_TO_INR).toFixed(0)}`}
        </span>
      </div>

      {event.categories && event.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {event.categories.map((cat: any) => (
            <span 
              key={cat.id} 
              className="px-2 py-0.5 bg-neutral-100 text-[10px] text-neutral-500 rounded-md font-medium"
            >
              #{cat.name}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto pt-4">
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <UserIcon size={14} />
            {((event as any).registrations?.length || 0)} / {event.capacity || 100}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onShare(event); }}
            className="p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-black transition-all active:scale-95"
            title="Share Event"
          >
            <Share2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCalendar(event); }}
            className="p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-black transition-all active:scale-95"
            title="Add to Calendar"
          >
            <CalendarPlus size={16} />
          </button>
        </div>
      </div>

      {(() => {
        const reg = (event.registrations as any)?.find((r: any) => r.userId === user.id);
        if (reg) {
          const status = reg.status || 'PENDING';
          return (
            <div className={cn(
              "mt-5 p-3 rounded-2xl flex items-center gap-3 text-xs font-bold border animate-in fade-in slide-in-from-bottom-2",
              status === 'ACCEPTED' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
              status === 'REJECTED' ? "bg-rose-50 border-rose-100 text-rose-700" :
              "bg-amber-50 border-amber-100 text-amber-700"
            )}>
              {status === 'ACCEPTED' ? <CheckCircle2 size={14} /> : 
               status === 'REJECTED' ? <XCircle size={14} /> : 
               <AlertCircle size={14} />}
              {status === 'ACCEPTED' ? "You are going" : 
               status === 'REJECTED' ? "You are not going" : 
               "Pending Confirmation"}
            </div>
          );
        }
        return null;
      })()}
    </motion.div>
  );
}

function Dashboard({ events, onSelectEvent, loading, onShare, onAddToCalendar, userCoords, user, title = "Discover Events" }: { 
  events: Event[], 
  onSelectEvent: (id: string) => void,
  loading: boolean,
  onShare: (e: Event) => void,
  onAddToCalendar: (e: Event) => void,
  userCoords?: { lat: number, lng: number } | null,
  user: User,
  title?: string
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase()) || 
                          event.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || event.type === filterType;
    
    const eventDate = new Date(event.date);
    const matchesStart = !startDate || eventDate >= new Date(startDate);
    const matchesEnd = !endDate || eventDate <= new Date(endDate);

    const matchesMinPrice = !minPrice || event.price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || event.price <= parseFloat(maxPrice);
    
    let matchesNearby = true;
    if (nearbyOnly && userCoords && event.lat && event.lng) {
      const distance = calculateDistance(userCoords.lat, userCoords.lng, event.lat, event.lng);
      matchesNearby = distance < 50; // Within 50km
    }
    
    return matchesSearch && matchesType && matchesStart && matchesEnd && matchesMinPrice && matchesMaxPrice && matchesNearby;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-1 tracking-tight">{title}</h1>
          <p className="text-neutral-500">Explore and manage your upcoming schedule</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 md:max-w-2xl">
          <div className="flex items-center bg-white rounded-2xl px-4 py-1.5 shadow-sm w-full border border-neutral-100 focus-within:ring-2 ring-black/5 transition-all">
            <Search className="text-neutral-400 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="bg-transparent outline-none w-full py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "ml-2 p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold",
                showFilters ? "bg-black text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Date Range</label>
                <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl px-4 py-1.5 border border-transparent focus-within:border-neutral-200 transition-all">
                  <Clock size={14} className="text-neutral-400" />
                  <input 
                    type="date" 
                    className="bg-transparent outline-none text-xs font-medium py-2 flex-1"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-neutral-300">/</span>
                  <input 
                    type="date" 
                    className="bg-transparent outline-none text-xs font-medium py-2 flex-1"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Price Range ($)</label>
                <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl px-4 py-1.5 border border-transparent focus-within:border-neutral-200 transition-all">
                  <span className="text-neutral-400 text-xs font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="bg-transparent outline-none text-xs font-medium py-2 w-full"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-neutral-300">/</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="bg-transparent outline-none text-xs font-medium py-2 w-full"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Proximity</label>
                <div className="flex h-[46px] items-center px-4 bg-neutral-50 rounded-2xl border border-transparent transition-all">
                  <button 
                    onClick={() => setNearbyOnly(!nearbyOnly)}
                    disabled={!userCoords}
                    className={cn(
                      "flex items-center gap-2 w-full text-xs font-bold transition-all py-1.5 rounded-xl justify-center",
                      !userCoords ? "opacity-30 cursor-not-allowed text-neutral-400" :
                      nearbyOnly ? "bg-black text-white" : "bg-white text-neutral-500 shadow-sm"
                    )}
                  >
                    <Compass size={14} />
                    {nearbyOnly ? "Within 50km" : "Worldwide"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filterType && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Filtering by:</span>
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm",
            filterType === 'CONFERENCE' ? "bg-indigo-600 text-white" :
            filterType === 'WORKSHOP' ? "bg-amber-500 text-white" :
            "bg-emerald-500 text-white"
          )}>
            {filterType}
            <button onClick={() => setFilterType(null)} className="hover:opacity-70">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1,2,3].map(i => (
              <div key={i} className="bg-white h-[300px] rounded-[32px] animate-pulse shadow-sm" />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event, idx) => (
              <EventCard 
                key={event.id}
                event={event}
                user={user}
                onSelectEvent={onSelectEvent}
                onShare={onShare}
                onAddToCalendar={onAddToCalendar}
                setFilterType={setFilterType}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventDetail({ event, user, socket, onBack, onRegister, onRefresh, onShare, setImagePicker, onUpdateEvent }: { 
  event: Event, 
  user: User, 
  socket: Socket | null, 
  onBack: () => void,
  onRegister: () => void,
  onRefresh: () => void,
  onShare: (e: Event) => void,
  setImagePicker: (picker: any) => void,
  onUpdateEvent: (eventId: string, data: Partial<Event>) => void
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'comments' | 'ratings' | 'gallery'>('info');
  const [message, setMessage] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [ratingScore, setRatingScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePostRating = async () => {
    if (ratingScore === 0) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch(`/api/events/${event.id}/ratings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: ratingScore, feedback: ratingFeedback })
      });
      if (res.ok) {
        setRatingScore(0);
        setRatingFeedback('');
        onRefresh();
        alert('Thank you for your rating!');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to submit rating');
      }
    } catch (err) {
      console.error('Failed to post rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentContent.trim()) return;
    try {
      const res = await fetch(`/api/events/${event.id}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: commentContent })
      });
      if (res.ok) {
        setCommentContent('');
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to post comment');
    }
  };

  const userRegistration = event.registrations?.find(r => r.userId === user.id);
  const isAttendee = userRegistration?.status === 'ACCEPTED';
  const hasRated = event.ratings?.some(r => r.userId === user.id);
  const averageRating = event.ratings?.length 
    ? (event.ratings.reduce((acc, r) => acc + r.score, 0) / event.ratings.length).toFixed(1)
    : null;

  const handleReplyComment = async (commentId: string) => {
    const reply = replyContent[commentId];
    if (!reply?.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reply })
      });
      if (res.ok) {
        setReplyContent(prev => ({ ...prev, [commentId]: '' }));
        setShowReplyInput(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to reply to comment');
    }
  };

  const handleUploadPhoto = async (url: string, caption?: string) => {
    try {
      const res = await fetch(`/api/events/${event.id}/photos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url, caption })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to upload photo');
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit('join', event.id);
      
      const handleMessage = (msg: Message) => {
        setChatHistory(prev => [...prev, msg]);
      };
      
      socket.on('message', handleMessage);
      return () => {
        socket.off('message', handleMessage);
      };
    }
  }, [socket, event.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('message', {
        userId: user.id,
        sessionId: event.id,
        content: message
      });
      setMessage('');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors font-medium">
          <ChevronRight size={18} className="rotate-180" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          {averageRating && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-amber-900">{averageRating}</span>
              <span className="text-[10px] font-bold text-amber-600 uppercase ml-1">Avg Rating</span>
            </div>
          )}
          <button 
            onClick={() => onShare(event)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:bg-neutral-50 transition-all text-sm font-bold"
          >
            <Share2 size={18} />
            Share Event
          </button>
        </div>
      </div>

      <div className="relative h-64 md:h-96 rounded-[40px] overflow-hidden mb-8 shadow-2xl group">
        <img 
          src={getEventImage(event, 1200, 400)} 
          alt={event.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {event.organizerId === user.id && (
          <button 
            onClick={() => setImagePicker({ 
              isOpen: true, 
              type: 'event', 
              onSelect: (url) => onUpdateEvent(event.id, { imageUrl: url }) 
            })}
            className="absolute top-8 right-8 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
            title="Change Cover Image"
          >
            <Sparkles size={20} />
          </button>
        )}
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
               {event.type}
             </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-neutral-300 font-medium">
            <span className="flex items-center gap-2">
              <Calendar size={16} /> 
              {new Date(event.date).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> 
              {new Date(event.date).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-neutral-100 w-fit">
            <button 
              onClick={() => setActiveTab('info')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'info' ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              Event Info
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'chat' ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              Live Chat
            </button>
            <button 
              onClick={() => setActiveTab('comments')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'comments' ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              Q&A
            </button>
            <button 
              onClick={() => setActiveTab('ratings')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'ratings' ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              Reviews
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'gallery' ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              Gallery
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'info' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100 mb-8">
                  <h2 className="text-2xl font-bold mb-4">About Event</h2>
                  <p className="text-neutral-500 leading-relaxed mb-8">{event.description}</p>

                  {event.organizer && (
                    <div className="mb-8 p-6 bg-neutral-50 rounded-[24px] border border-neutral-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center font-bold text-xl shadow-sm border border-neutral-100 overflow-hidden">
                          {event.organizer.avatarUrl ? (
                            <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            event.organizer.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Organized By</p>
                          <h4 className="text-xl font-bold">{event.organizer.name}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-500 leading-relaxed mb-6">{event.organizer.bio || "This organizer has shared their vision yet."}</p>
                      
                      {event.organizer.organizedEvents && event.organizer.organizedEvents.filter(e => e.id !== event.id).length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-3">Other Events by {event.organizer.name.split(' ')[0]}</p>
                          <div className="space-y-2">
                            {event.organizer.organizedEvents.filter(e => e.id !== event.id).map(oe => (
                              <div key={oe.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-neutral-100">
                                <span className="text-xs font-bold">{oe.name}</span>
                                <span className="text-[10px] font-black uppercase text-neutral-400">{new Date(oe.date!).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {event.swags && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Gift className="text-pink-500" size={20} />
                        Exclusive Swags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.swags.split(',').map((item, i) => (
                          <span key={i} className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-pink-100 flex items-center gap-2">
                            <Sparkles size={12} />
                            {item.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-4">Location</h3>
                  {event.location && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 text-neutral-500 mb-4">
                        <MapPin size={18} className="text-indigo-600" />
                        <span className="font-bold">{event.location}</span>
                      </div>
                      
                      {event.lat && event.lng ? (
                        <div className="space-y-4">
                          <div className="w-full h-64 md:h-80 rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm relative z-0">
                            <MapContainer 
                              center={[event.lat, event.lng]} 
                              zoom={14} 
                              scrollWheelZoom={false}
                              className="w-full h-full"
                            >
                              <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                              />
                              <Marker position={[event.lat, event.lng]}>
                                <Popup>
                                  <div className="p-1">
                                    <p className="font-bold text-sm mb-1">{event.name}</p>
                                    <p className="text-[10px] text-neutral-500">{event.location}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-neutral-100 text-neutral-900 rounded-[20px] text-sm font-bold hover:bg-neutral-200 transition-all border border-neutral-200"
                          >
                            <Navigation size={18} />
                            Open in Google Maps
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-64 rounded-[24px] bg-neutral-50 flex flex-col items-center justify-center border-2 border-dashed border-neutral-100 p-8 text-center group hover:bg-neutral-100/50 transition-colors">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-neutral-100 group-hover:scale-110 transition-transform">
                            <Compass size={32} className="text-neutral-300" />
                          </div>
                          <p className="font-bold text-neutral-600 mb-1">Coordinates Unavailable</p>
                          <p className="text-neutral-400 text-xs mb-6 max-w-[240px]">We have the address but no direct map pin. Use the link below to find it on external maps.</p>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 active:scale-95 transition-all shadow-lg shadow-black/5"
                          >
                            <Navigation size={14} />
                            Locate via Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-4">Activities</h3>
                  <div className="space-y-4">
                    {event.activities?.length ? event.activities.map((act, i) => (
                      <div key={act.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-neutral-400">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{act.title}</p>
                          <p className="text-xs text-neutral-400">{act.time || 'TBD'}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-neutral-400 italic">No activities listed yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'chat' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 h-[500px] flex flex-col"
              >
                <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 space-y-4 mb-4">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 p-8">
                      <MessageSquare size={48} className="mb-4 opacity-20" />
                      <p>Start the conversation! Be the first to say hello.</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex flex-col",
                      msg.userId === user.id ? "items-end" : "items-start"
                    )}>
                      <span className="text-[10px] text-neutral-400 mb-1 px-2 font-bold uppercase tracking-widest">{msg.user?.name || 'User'}</span>
                      <div className={cn(
                        "p-3 rounded-2xl max-w-[80%] shadow-sm",
                        msg.userId === user.id ? "bg-black text-white rounded-tr-none" : "bg-neutral-100 text-[#1A1A1A] rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 bg-neutral-100 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 transition-all"
                  />
                  <button type="submit" className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                    <Send size={20} />
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'comments' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100">
                  <h3 className="text-xl font-bold mb-6">Questions & Feedback</h3>
                  <div className="space-y-8 mb-8">
                    {event.comments?.length ? event.comments.map((comment: any) => (
                      <div key={comment.id} className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-400">
                            {comment.user?.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-sm">{comment.user?.name}</p>
                              <span className="text-[10px] text-neutral-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-neutral-600 bg-neutral-50 p-4 rounded-2xl rounded-tl-none inline-block">{comment.content}</p>
                            
                            {comment.reply && (
                              <div className="mt-4 ml-6 flex gap-4">
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                  <UserIcon className="text-white" size={14} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black uppercase text-neutral-400 mb-1">Organizer Answer</p>
                                  <p className="text-sm text-neutral-700 bg-indigo-50 p-4 rounded-2xl rounded-tl-none border border-indigo-100">{comment.reply}</p>
                                </div>
                              </div>
                            )}

                            {!comment.reply && event.organizerId === user.id && (
                              <div className="mt-4 ml-6">
                                {showReplyInput === comment.id ? (
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={replyContent[comment.id] || ''}
                                      onChange={e => setReplyContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                      placeholder="Write an answer..." 
                                      className="flex-1 text-sm bg-neutral-50 p-3 rounded-xl outline-none border border-neutral-200"
                                    />
                                    <button 
                                      onClick={() => handleReplyComment(comment.id)}
                                      className="px-4 bg-black text-white rounded-xl text-xs font-bold"
                                    >
                                      Send
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setShowReplyInput(comment.id)}
                                    className="text-xs font-bold text-indigo-600 hover:underline"
                                  >
                                    Reply as Organizer
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <MessageSquare size={40} className="mx-auto text-neutral-200 mb-4" />
                        <p className="text-neutral-400 text-sm">No questions asked yet.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-neutral-100">
                    <p className="text-sm font-bold mb-4">Have a question?</p>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={commentContent}
                        onChange={e => setCommentContent(e.target.value)}
                        placeholder="Ask the organizer something..." 
                        className="flex-1 bg-neutral-50 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 transition-all text-sm border border-neutral-100"
                      />
                      <button 
                        onClick={handlePostComment}
                        className="px-8 bg-black text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-black/10"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'gallery' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Event Gallery</h3>
                    <p className="text-xs text-neutral-400 mt-1">Shared moments from the event community</p>
                  </div>
                  <button 
                    onClick={() => setImagePicker({ 
                      isOpen: true, 
                      type: 'event', 
                      onSelect: (url) => handleUploadPhoto(url) 
                    })}
                    className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-2xl text-xs font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-black/10"
                  >
                    <Plus size={16} />
                    Add Photo
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.photos?.length ? event.photos.map((photo: any) => (
                    <div key={photo.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-50">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || 'Event photo'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                            {photo.user?.avatarUrl ? (
                              <img src={photo.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              photo.user?.name.charAt(0)
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-white/90 truncate">{photo.user?.name}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center mb-4 border border-neutral-100">
                        <Camera size={40} className="text-neutral-200" />
                      </div>
                      <p className="font-bold text-neutral-400">No photos yet</p>
                      <p className="text-xs text-neutral-300 max-w-[200px] mt-1">Be the first to share a moment from this event!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Attendee Feedback</h3>
                    {averageRating && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={16} className={cn(
                              "transition-all",
                              s <= Math.round(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                            )} />
                          ))}
                        </div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 mt-1">{averageRating} avg rating</p>
                      </div>
                    )}
                  </div>

                  {isAttendee && !hasRated && (
                    <div className="bg-neutral-50 p-6 rounded-[24px] mb-8 border border-neutral-100">
                      <p className="text-sm font-bold mb-4">You attended this event! How was it?</p>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onMouseEnter={() => setHoverScore(star)}
                              onMouseLeave={() => setHoverScore(0)}
                              onClick={() => setRatingScore(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={28}
                                className={cn(
                                  "transition-colors",
                                  star <= (hoverScore || ratingScore)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-neutral-300"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Share your detailed experience (optional)..."
                          value={ratingFeedback}
                          onChange={(e) => setRatingFeedback(e.target.value)}
                          className="w-full bg-white p-4 rounded-xl text-sm border border-neutral-200 outline-none focus:ring-2 ring-black/5"
                          rows={3}
                        />
                        <button
                          onClick={handlePostRating}
                          disabled={ratingScore === 0 || isSubmittingRating}
                          className="bg-black text-white py-4 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                        >
                          {isSubmittingRating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Rating'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {event.ratings?.length ? event.ratings.map((rate: any) => (
                      <div key={rate.id} className="pb-6 border-b border-neutral-50 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs">
                              {rate.user?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold">{rate.user?.name}</p>
                              <p className="text-[10px] text-neutral-400">{new Date(rate.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={10} className={cn(
                                s <= rate.score ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                              )} />
                            ))}
                          </div>
                        </div>
                        {rate.feedback && (
                          <p className="text-sm text-neutral-600 leading-relaxed pl-11">{rate.feedback}</p>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Trophy size={40} className="mx-auto text-neutral-200 mb-2" />
                        <p className="text-neutral-400 text-sm">No reviews yet for this event.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black text-white rounded-[32px] p-8 shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">Registration</h3>
              {(event.price || 0) > 0 && (
                <div className="text-right">
                  <div className="text-xl font-black text-white">${event.price}</div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">₹{(event.price * USD_TO_INR).toFixed(2)}</div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-white/60 text-sm">{(event as any).registrations?.length || 0} / {event.capacity || 100} Registered</p>
              {((event as any).registrations?.length || 0) >= (event.capacity || 100) && (
                <span className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-lg font-black uppercase tracking-widest">Sold Out</span>
              )}
            </div>
            
            {(() => {
              const reg = (event.registrations as any)?.find((r: any) => r.userId === user.id);
              if (reg) {
                const status = reg.status || 'PENDING';
                return (
                  <div className={cn(
                    "p-6 rounded-2xl flex flex-col items-center gap-4 text-center border-t border-white/10",
                    status === 'ACCEPTED' ? "bg-emerald-500/10 text-emerald-400" :
                    status === 'REJECTED' ? "bg-rose-500/10 text-rose-400" :
                    "bg-amber-500/10 text-amber-400"
                  )}>
                    {status === 'ACCEPTED' ? <CheckCircle2 size={32} /> : 
                     status === 'REJECTED' ? <XCircle size={32} /> : 
                     <AlertCircle size={32} />}
                    
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight">
                        {status === 'ACCEPTED' ? "YOU ARE GOING" : 
                         status === 'REJECTED' ? "YOU ARE NOT GOING" : 
                         "REGISTRATION PENDING"}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {status === 'ACCEPTED' ? "Pack your bags! We'll see you there." : 
                         status === 'REJECTED' ? "The organizer has declined your request." : 
                         "Waiting for organizer to confirm your spot."}
                      </p>
                    </div>
                  </div>
                );
              }
              const isFull = ((event as any).registrations?.length || 0) >= (event.capacity || 100);
              return (
                <button 
                  onClick={onRegister}
                  disabled={isFull}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                >
                  {isFull ? 'Event Full' : 'Register Now'}
                </button>
              );
            })()}
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              Similar Events
            </h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://picsum.photos/seed/rel-${i}-${event.id}/100/100`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:underline">Related Workshop {i}</h4>
                    <p className="text-xs text-neutral-400">Next Monday</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Recommendations({ user, events, onSelectEvent, userCoords }: { 
  user: User, 
  events: Event[], 
  onSelectEvent: (id: string) => void,
  userCoords?: { lat: number, lng: number } | null
}) {
  const [recs, setRecs] = useState<{ eventName: string; reason: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function getRecommendations() {
      if (!user.interests || events.length === 0) {
        setLoading(false);
        return;
      }
      
      setError(null);
      setLoading(true);
      
      try {
        const eventsContext = events.map(e => ({
          id: e.id,
          name: e.name,
          type: e.type,
          location: e.location,
          lat: e.lat,
          lng: e.lng,
          price: e.price,
          capacity: e.capacity,
          attendees: (e as any).registrations?.length || 0
        }));

        const prompt = `You are a high-end event concierge. 
        User Profile:
        - Interests: "${user.interests}"
        - Current Location: ${userCoords ? `Latitude ${userCoords.lat}, Longitude ${userCoords.lng}` : 'Not shared'}
        
        Upcoming Events Data:
        ${JSON.stringify(eventsContext)}
        
        Task:
        Recommend the top 3 events for this user. 
        Priorities:
        1. Interest Alignment: How well the event matches "${user.interests}".
        2. Proximity: Closer events are better if coordinates are available.
        3. Popularity & Urgency: Mention if an event is almost full (near capacity).
        4. Value: Mention the price in both USD ($) and INR (₹) using a conversion of 1 USD = ${USD_TO_INR} INR.
        
        Output:
        Return a JSON array of exactly 3 objects. 
        Each object must have:
        - "eventName": Name of the event.
        - "reason": A catchy, compelling 2-sentence reason describing why it's perfect, explicitly mentioning distance (if known), price in both currencies, or remaining spots.
        
        Only return the JSON. No conversational text.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  eventName: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["eventName", "reason"]
              }
            }
          }
        });
        
        if (isMounted) {
          const data = JSON.parse(response.text || '[]');
          setRecs(data);
        }
      } catch (err: any) {
        console.error('Gemini error:', err);
        if (isMounted) {
          const errorMessage = err?.message || '';
          if (errorMessage.includes('quota') || errorMessage.includes('429')) {
            setError('AI Planner is currently reaching its limit. Please try again in 1 minute.');
          } else {
            setError('Something went wrong while generating suggestions.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(getRecommendations, 500); // 500ms debounce to prevent multiple triggers
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user.interests, events]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-yellow-400">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-bold">AI Planner</h1>
          <p className="text-neutral-500">Tailored suggestions based on your profile</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-neutral-100 mb-8 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6">Why these events?</h2>
          <p className="text-neutral-500 max-w-2xl mb-8">
            Our algorithm analyzed your interest in <b>{user.interests || 'everything'}</b> and compared it with our upcoming library.
          </p>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-50 border border-neutral-100">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                <AlertCircle className="text-neutral-400" size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Notice</h3>
              <p className="text-neutral-500 mb-6 max-w-sm mx-auto">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-black text-white rounded-2xl font-bold hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {recs.length > 0 ? recs.map((rec, i) => {
                const event = events.find(e => e.name === rec.eventName);
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => event && onSelectEvent(event.id)}
                    className={cn(
                      "p-6 rounded-3xl border border-neutral-100 group transition-all",
                      event ? "bg-neutral-50 cursor-pointer hover:bg-neutral-100 hover:border-neutral-200" : "bg-neutral-50/50 grayscale opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold mb-1">{rec.eventName}</h4>
                        <p className="text-sm text-neutral-500 leading-relaxed">{rec.reason}</p>
                      </div>
                      {event && (
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center self-center shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                  <p className="text-neutral-400">Add interests to your profile to get personalized recommendations.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
