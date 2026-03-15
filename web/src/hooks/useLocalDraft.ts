import { useCallback } from 'react';

export interface DraftData {
  title: string;
  category: string;
  tags: string[];
  content_md: string;
  assets: string[];
  timestamp: string;
}

const DRAFT_KEY = 'study-checkin-draft';

export function useLocalDraft() {
  const saveDraft = useCallback((data: DraftData) => {
    try {
      const draft = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  }, []);

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const draftStr = localStorage.getItem(DRAFT_KEY);
      if (!draftStr) return null;
      return JSON.parse(draftStr) as DraftData;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  return { saveDraft, loadDraft, clearDraft };
}
