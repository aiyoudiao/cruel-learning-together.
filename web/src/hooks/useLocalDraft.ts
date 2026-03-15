import { useCallback } from 'react';

export interface DraftData {
  title: string;
  tags: string[];
  content_md: string;
  assets: string[];
  timestamp: string;
}

// Map category to draft data
type DraftStorage = Record<string, DraftData>;

const DRAFT_KEY = 'study-checkin-drafts-v2';
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useLocalDraft() {
  
  // Save draft for a specific category
  const saveDraft = useCallback((category: string, data: Omit<DraftData, 'timestamp'>) => {
    try {
      const storageStr = localStorage.getItem(DRAFT_KEY);
      let storage: DraftStorage = storageStr ? JSON.parse(storageStr) : {};
      
      storage[category] = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(storage));
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  }, []);

  // Load draft for a specific category
  const loadDraft = useCallback((category: string): DraftData | null => {
    try {
      const storageStr = localStorage.getItem(DRAFT_KEY);
      if (!storageStr) return null;
      
      const storage: DraftStorage = JSON.parse(storageStr);
      const draft = storage[category];
      
      if (!draft) return null;
      
      // Check expiration
      const draftTime = new Date(draft.timestamp).getTime();
      if (Date.now() - draftTime > EXPIRATION_MS) {
        // Expired, remove it
        delete storage[category];
        localStorage.setItem(DRAFT_KEY, JSON.stringify(storage));
        return null;
      }
      
      return draft;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, []);

  // Clear specific category draft or all
  const clearDraft = useCallback((category?: string) => {
    try {
      if (category) {
        const storageStr = localStorage.getItem(DRAFT_KEY);
        if (storageStr) {
            const storage: DraftStorage = JSON.parse(storageStr);
            delete storage[category];
            localStorage.setItem(DRAFT_KEY, JSON.stringify(storage));
        }
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  return { saveDraft, loadDraft, clearDraft };
}
