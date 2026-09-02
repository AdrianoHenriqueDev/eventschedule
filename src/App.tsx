import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Info, CheckCircle2, Menu, X, CalendarDays } from 'lucide-react';
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

  const toggleNotification = async (e: React.MouseEvent, event: ScheduleEvent) => {
    e.stopPropagation();
    const newNotifications = new Set(notifications);
    const isAdded = !newNotifications.has(event.id);
    
    if (isAdded) {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          throw new Error('Push not supported');
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          addToast('removed', 'Permission Denied', 'Please enable notifications in your browser.');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Fetch VAPID key from backend
        const response = await fetch(`${API_URL}/vapidPublicKey`);
        const vapidPublicKey = await response.text();
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        // Subscribe
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        }

        const eventDate = getPdtDate(event.startTime, event.day);
        const triggerTimeMs = eventDate.getTime() - (5 * 60 * 1000); // 5 minutes before

        // Schedule with backend
        await fetch(`${API_URL}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            title: event.title,
            message: `Starting soon at ${formatTime(event.startTime, event.day)} on ${event.stage} stage!`,
            triggerTimeMs
          })
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

    const isShort = height < 60;

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
          <div className="date-header">
            <div className={`day-tab ${activeDay === 1 ? 'active' : ''}`} onClick={() => setActiveDay(1)}>
              <h1>9/12 <span>DAY ONE</span></h1>
            </div>
            <div className={`day-tab ${activeDay === 2 ? 'active' : ''}`} onClick={() => setActiveDay(2)}>
              <h1>9/13 <span>DAY TWO</span></h1>
            </div>
          </div>
          
          <h2 className="main-title">FULL<br/>SCHEDULE</h2>
          
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
        </div>
      </aside>

      <main className="schedule-container">
        <div className="schedule-header">
          <div className="time-column"></div>
          {STAGES.map((stage) => (
            <div key={stage.id} className="stage-header">
              <h2>{stage.name}</h2>
              <span>{stage.location}</span>
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
    </div>
  );
}

export default App;
