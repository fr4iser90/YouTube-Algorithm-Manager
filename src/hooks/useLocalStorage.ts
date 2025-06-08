import { useState, useEffect } from 'react';

// Date reviver function to convert ISO date strings back to Date objects
export function dateReviver(key: string, value: any) {
  if (typeof value === 'string') {
    // Check if the string matches ISO 8601 date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (dateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial value from chrome.storage.local
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        console.error(`Error reading chrome.storage key "${key}":`, chrome.runtime.lastError);
        setIsLoading(false);
        return;
      }
      if (result[key]) {
        const parsed = JSON.parse(result[key], dateReviver);
        setStoredValue(parsed);
      }
      setIsLoading(false);
    });

    // Listen for changes from other parts of the extension
    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[key]) {
        const parsed = JSON.parse(changes[key].newValue, dateReviver);
        setStoredValue(parsed);
      }
    };

    chrome.storage.onChanged.addListener(handleChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const stringifiedValue = JSON.stringify(valueToStore);
      chrome.storage.local.set({ [key]: stringifiedValue }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error setting chrome.storage key "${key}":`, chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error(`Error setting chrome.storage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading] as const;
}
