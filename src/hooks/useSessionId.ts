import { useState } from 'react';

const SESSION_KEY = 'schussbogen_session_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function useSessionId(): string {
  const [sessionId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return stored;
      const newId = generateUUID();
      localStorage.setItem(SESSION_KEY, newId);
      return newId;
    } catch {
      return generateUUID();
    }
  });
  return sessionId;
}
