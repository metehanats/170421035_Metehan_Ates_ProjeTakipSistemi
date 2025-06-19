// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    issues: [],
    sprints: [],
    users: [],
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await dashboardService.getDashboardData();
      
      // Hata kontrolü
      const hasErrors = Object.values(data.errors).some(error => error !== null);
      if (hasErrors) {
        console.warn('Some data failed to load:', data.errors);
      }

      setDashboardData(data);
      
      // İstatistikleri hesapla
      const calculatedStats = dashboardService.calculateStats(
        data.projects,
        data.issues,
        data.sprints
      );
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  return {
    dashboardData,
    stats,
    loading,
    error,
    refreshing,
    refresh,
    reload: loadDashboardData
  };
};
