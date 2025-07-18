'use client';

import { useEffect } from 'react';

export function InitJobs() {
  useEffect(() => {
    // Initialize background jobs
    fetch('/api/init')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('[InitJobs]', data.message);
        }
      })
      .catch(error => {
        console.error('[InitJobs] Error initializing jobs:', error);
      });
  }, []);

  return null; // This component doesn't render anything
}