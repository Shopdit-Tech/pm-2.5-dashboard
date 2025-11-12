'use client';

import { useState, useEffect } from 'react';

type PageViewData = {
  allTime: number;
  today: number;
};

export const usePageViews = () => {
  const [pageViews, setPageViews] = useState<PageViewData>({
    allTime: 0,
    today: 0,
  });

  useEffect(() => {
    // Get current date in YYYY-MM-DD format
    const getCurrentDate = () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    };

    const currentDate = getCurrentDate();

    // Get all-time views
    const allTimeViews = parseInt(localStorage.getItem('pageViews_all') || '0', 10);

    // Get today's date from storage
    const storedDate = localStorage.getItem('pageViews_date');
    let todayViews = 0;

    if (storedDate === currentDate) {
      // Same day - get existing count
      todayViews = parseInt(localStorage.getItem('pageViews_today') || '0', 10);
    } else {
      // New day - reset today's count
      localStorage.setItem('pageViews_date', currentDate);
      localStorage.setItem('pageViews_today', '0');
      todayViews = 0;
    }

    // Increment both counters
    const newAllTime = allTimeViews + 1;
    const newToday = todayViews + 1;

    localStorage.setItem('pageViews_all', newAllTime.toString());
    localStorage.setItem('pageViews_today', newToday.toString());

    setPageViews({
      allTime: newAllTime,
      today: newToday,
    });
  }, []);

  return pageViews;
};
