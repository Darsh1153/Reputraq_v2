"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { setUser } from "@/lib/store/slices/userSlice";
import { useCollectNewsData } from "@/lib/hooks/useNewsSimple";
import { DataVisualization } from "@/components/DataVisualization";
import { SleekDashboard } from "@/components/SleekDashboard";
import styles from "./page.module.scss";

interface Keyword {
  id: number;
  keyword: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

interface MonitoringData {
  keyword: string;
  newsData: any;
  socialData: any;
  timestamp: string;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { articles, loading, error } = useAppSelector((state) => state.news);
  
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [updatingSocial, setUpdatingSocial] = useState(false);
  
  const collectNewsData = useCollectNewsData();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // Update Redux store with user data
      dispatch(setUser(parsedUser));
      
      // Extract keywords from user data
      if (parsedUser.keywords && parsedUser.keywords.length > 0) {
        setKeywords(parsedUser.keywords);
      }
    }
    setPageLoading(false);
  }, [dispatch]);

  const handleCollectData = async () => {
    if (user) {
      try {
        await collectNewsData.mutateAsync(user.id);
      } catch (error) {
        console.error('Failed to collect data:', error);
      }
    }
  };

  if (pageLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <h2>Access Denied</h2>
        <p>Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return <SleekDashboard />;
}