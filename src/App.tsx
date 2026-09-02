import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Info, CheckCircle2, Menu, X, CalendarDays, Search, CalendarPlus, Video, Share2, Map } from 'lucide-react';
import { EVENTS, STAGES } from './data';
import type { Category, ScheduleEvent } from './data';
import './App.css';

// Helpers for Timezone Conversion (PDT is UTC-7)
const getPdtDate = (time: string, day: 1 | 2): Date => {
  const dateStr = day === 1 ? '2026-09-12' : '2026-09-13';
  return new Date(`${dateStr}T${time}:00-07:00`);
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Base64 helper for VAPID keys
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const LEGEND: { category: Category; label: string }[] = [
  { category: 'wow', label: 'WORLD OF WARCRAFT' },
  { category: 'overwatch', label: 'OVERWATCH' },
  { category: 'diablo', label: 'DIABLO' },
  { category: 'hearthstone', label: 'HEARTHSTONE' },
  { category: 'classic', label: 'CLASSIC CUP' },
  { category: 'blizzard', label: 'BLIZZARD' },
];

interface Toast {
  id: string;
  message: string;
  title: string;
  type: 'added' | 'removed';
}

function App() {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [notifications, setNotifications] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('blizzcon_notifications');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMyScheduleOnly, setIsMyScheduleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [theme, setTheme] = useState<'default'|'diablo'|'overwatch'|'warcraft'>('default');
  const [showMapModal, setShowMapModal] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme !== 'default' ? `theme-${theme}` : '';
  }, [theme]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const saved = urlParams.get('saved');
    if (saved) {
      const ids = saved.split(',');
      if (ids.length > 0) {
        if (window.confirm("Do you want to import this shared schedule?")) {
          setNotifications(prev => {
            const newSet = new Set(prev);
            ids.forEach(id => newSet.add(id));
            return newSet;
          });
        }
        urlParams.delete('saved');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('blizzcon_notifications', JSON.stringify(Array.from(notifications)));
  }, [notifications]);

  const startTimeObj = useMemo(() => getPdtDate('09:00', activeDay), [activeDay]);

  const timeToPixels = (time: string, day: 1 | 2): number => {
    const eventDate = getPdtDate(time, day);
    const minutesSinceStart = (eventDate.getTime() - startTimeObj.getTime()) / (1000 * 60);
    return minutesSinceStart * 2;
  };

  const liveIndicatorTop = useMemo(() => {
    const activeDate = getPdtDate('09:00', activeDay);
    const minutesSinceStart = (currentTime.getTime() - activeDate.getTime()) / (1000 * 60);
    
    // Show line if within the typical 14-hour window of the event
    if (minutesSinceStart >= 0 && minutesSinceStart <= 14 * 60) {
      return minutesSinceStart * 2;
    }
    return null;
  }, [currentTime, activeDay]);

  const formatTime = (time: string, day: 1 | 2): string => {
    const date = getPdtDate(time, day);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const timeLabels = useMemo(() => {
    return Array.from({ length: 11 }).map((_, i) => {
      const d = new Date(startTimeObj.getTime() + i * 60 * 60 * 1000);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s+/g, '');
    });
  }, [startTimeObj]);

  const getTwitchUrl = (category: Category) => {
    switch (category) {
      case 'wow': return 'https://twitch.tv/warcraft';
      case 'overwatch': return 'https://twitch.tv/playoverwatch';
      case 'diablo': return 'https://twitch.tv/diablo';
      case 'hearthstone': return 'https://twitch.tv/playhearthstone';
      case 'classic':
      case 'blizzard':
      case 'opening':
      default:
        return 'https://twitch.tv/blizzard';
    }
  };

  const generateICS = (event: ScheduleEvent) => {
    const startDate = getPdtDate(event.startTime, event.day);
    const endDate = getPdtDate(event.endTime, event.day);
    
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BlizzCon Schedule//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@blizzcon`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${STAGES.find(s => s.id === event.stage)?.name || 'BlizzCon'}`,
      `URL:${getTwitchUrl(event.category)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleNotification = async (e: React.MouseEvent, event: ScheduleEvent) => {
    e.stopPropagation();
    const newNotifications = new Set(notifications);
    const isAdded = !newNotifications.has(event.id);
    
    if (isAdded) {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          throw new Error('Push not supported');
        }

        const registration = await navigator.serviceWorker.ready;
        
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const response = await fetch(`${API_URL}/vapidPublicKey`);
          const vapidPublicKey = await response.text();
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
          
          await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          });
        }
        
        const startDate = getPdtDate(event.startTime, event.day);
        await fetch(`${API_URL}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            event: {
              id: event.id,
              title: event.title,
              time: startDate.toISOString()
            }
          }),
        });

        newNotifications.add(event.id);
        addToast('added', 'Push Enabled', `You will receive a notification for ${event.title}.`);
      } catch (err) {
        console.error('Push error:', err);
        addToast('removed', 'Push Error', 'Could not enable push notifications.');
        return;
      }
    } else {
      newNotifications.delete(event.id);
      addToast('removed', 'Notification Cancelled', `Alert for ${event.title} has been cancelled.`);
    }
    setNotifications(newNotifications);
  };

  const shareSchedule = async () => {
    if (notifications.size === 0) {
      alert("You haven't added any events to your schedule yet!");
      return;
    }
    const ids = Array.from(notifications).join(',');
    const url = new URL(window.location.href);
    url.searchParams.set('saved', ids);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BlizzCon Schedule',
          text: 'Check out the events I am attending!',
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.error('Error sharing', err);
      }
    }
    
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const addToast = (type: 'added' | 'removed', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const renderEvent = (event: ScheduleEvent) => {
    if (event.day !== activeDay) return null;
    
    if (isMyScheduleOnly && !notifications.has(event.id)) return null;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return null;

    const isVisible = !activeFilter || event.category === activeFilter;
    if (!isVisible) return null;

    const top = timeToPixels(event.startTime, event.day);
    const bottom = timeToPixels(event.endTime, event.day);
    const height = bottom - top;
    const isNotified = notifications.has(event.id);

    if (event.isSpanningAll) {
      return (
        <motion.div
          key={event.id}
          className={`event-card event-spanning`}
          style={{ top, height, left: 0, width: '100%', zIndex: 1 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <div className="event-time">{formatTime(event.startTime, event.day)} - {formatTime(event.endTime, event.day)}</div>
          <h3>{event.title}</h3>
          
          <div className={`event-actions ${isNotified ? 'active' : ''}`}>
            <button 
              className={`action-btn ${isNotified ? `active ${event.category}-btn` : ''}`}
              onClick={(e) => toggleNotification(e, event)}
              title={isNotified ? "Remove Notification" : "Notify Me"}
            >
              {isNotified ? <Bell size={14} /> : <BellOff size={14} />}
            </button>
          </div>
        </motion.div>
      );
    }

    const isShort = height <= 60;

    return (
      <motion.div
        key={event.id}
        className={`event-card event-${event.category} ${isShort ? 'event-short' : ''}`}
        style={{ top, height }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="event-time">
          {formatTime(event.startTime, event.day)} - {formatTime(event.endTime, event.day)}
        </div>
        <div className="event-title">{event.title}</div>
        
        <div className={`event-actions ${isNotified ? 'active' : ''}`}>
          <a
            href={getTwitchUrl(event.category)}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn twitch-btn"
            title="Watch on Twitch"
            onClick={(e) => e.stopPropagation()}
          >
            <Video size={14} />
          </a>
          <button 
            className="action-btn calendar-btn"
            onClick={(e) => { e.stopPropagation(); generateICS(event); }}
            title="Add to Calendar"
          >
            <CalendarPlus size={14} />
          </button>
          <button 
            className={`action-btn ${isNotified ? `active ${event.category}-btn` : ''}`}
            onClick={(e) => toggleNotification(e, event)}
            title={isNotified ? "Remove Notification" : "Notify Me"}
          >
            {isNotified ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="app-container">
      <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <div className="mobile-title">
            <CalendarDays size={20} />
          </div>
          <button className="close-sidebar-btn">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="sidebar-content">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="date-header">
            <div className={`day-tab ${activeDay === 1 ? 'active' : ''}`} onClick={() => setActiveDay(1)}>
              <h1>9/12 <span>DAY ONE</span></h1>
            </div>
            <div className={`day-tab ${activeDay === 2 ? 'active' : ''}`} onClick={() => setActiveDay(2)}>
              <h1>9/13 <span>DAY TWO</span></h1>
            </div>
          </div>
          
          <h2 className="main-title">FULL<br/>SCHEDULE</h2>

          <div className="view-toggles" style={{ marginBottom: '1rem' }}>
            <button 
              className={`view-toggle-btn ${!isMyScheduleOnly ? 'active' : ''}`}
              onClick={() => setIsMyScheduleOnly(false)}
            >
              All Events
            </button>
            <button 
              className={`view-toggle-btn ${isMyScheduleOnly ? 'active' : ''}`}
              onClick={() => setIsMyScheduleOnly(true)}
            >
              My Schedule
            </button>
          </div>
          
          <button 
            className="view-toggle-btn" 
            style={{ width: '100%', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)' }}
            onClick={shareSchedule}
          >
            <Share2 size={16} /> Share Schedule
          </button>

          <div className="legend">
            {LEGEND.map((item) => (
              <div 
                key={item.category} 
                className={`legend-item ${activeFilter && activeFilter !== item.category ? 'inactive' : ''}`}
                onClick={() => setActiveFilter(activeFilter === item.category ? null : item.category)}
              >
                <div className={`legend-color color-${item.category}`}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="theme-selector">
            <button onClick={() => setTheme('default')} className={`theme-btn ${theme === 'default' ? 'active' : ''}`}>BlizzCon</button>
            <button onClick={() => setTheme('diablo')} className={`theme-btn ${theme === 'diablo' ? 'active' : ''}`}>Diablo</button>
            <button onClick={() => setTheme('overwatch')} className={`theme-btn ${theme === 'overwatch' ? 'active' : ''}`}>Overwatch</button>
            <button onClick={() => setTheme('warcraft')} className={`theme-btn ${theme === 'warcraft' ? 'active' : ''}`}>Warcraft</button>
          </div>
        </div>
      </aside>

      <main className="schedule-container">
        <div className="schedule-header">
          <div className="time-column"></div>
          {STAGES.map((stage) => (
            <div key={stage.id} className="stage-header">
              <h2>{stage.name}</h2>
              <span onClick={() => setShowMapModal(stage.location)} className="location-link">
                <Map size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {stage.location}
              </span>
            </div>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeDay}
            className="schedule-grid-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="time-labels">
              {timeLabels.map((time, i) => (
                <div key={time} className="time-label" style={{ top: i * 120 }}>
                  {time}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {EVENTS.filter(e => e.isSpanningAll).map(renderEvent)}
            </AnimatePresence>

            {liveIndicatorTop !== null && (
              <div 
                className="live-indicator" 
                style={{ top: liveIndicatorTop }}
              >
                <div className="live-pulse"></div>
              </div>
            )}

            <div className="schedule-grid">
              {STAGES.map((stage) => (
                <div key={stage.id} className="stage-column">
                  <AnimatePresence>
                    {EVENTS.filter(e => e.stage === stage.id).map(renderEvent)}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`toast toast-${toast.type} glass`}
            >
              {toast.type === 'added' ? <CheckCircle2 size={24} color="#2ecc71" /> : <Info size={24} color="#e74c3c" />}
              <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-message">{toast.message}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showMapModal && (
          <motion.div 
            className="map-modal-overlay" 
            onClick={() => setShowMapModal(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="map-modal-content" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button className="close-map" onClick={() => setShowMapModal(null)}><X size={24} /></button>
              <h2 style={{ marginTop: 0 }}>Map: {showMapModal}</h2>
              <div className="map-placeholder">
                <Map size={64} style={{ opacity: 0.5 }} />
                <p>Interactive Map View for <strong>{showMapModal}</strong></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
