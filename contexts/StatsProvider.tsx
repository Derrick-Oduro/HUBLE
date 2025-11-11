"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { statsAPI } from '../lib/api';

interface CharacterStats {
  // Core character stats
  level: number;
  experience: number;
  maxExperience: number;
  health: number;
  maxHealth: number;
  
  // Currency & rewards
  coinsEarned: number;
  gemsEarned: number;
  
  // Progress tracking
  habitsCompleted: number;
  totalHabits: number;
  dailiesCompleted: number;
  totalDailies: number;
  routinesCompleted: number;
  totalRoutines: number;
  focusMinutes: number;
  focusSessions: number;
  
  // Streaks & achievements
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  
  // Level up messaging
  levelMessage?: string;
}

interface StatsContextType {
  stats: CharacterStats;
  updateExperience: (amount: number) => void;
  updateHealth: (amount: number) => void;
  updateCoins: (amount: number) => void;
  updateGems: (amount: number) => void;
  updateHabitCompletion: (completed: number, total: number) => void;
  updateDailiesCompletion: (completed: number, total: number) => void;
  updateRoutinesCompletion: (completed: number, total: number) => void;
  updateFocusTime: (minutes: number) => void;
  updateFocusSessions: (sessions: number) => void;
  updateStreak: (streak: number) => void;
  updateTotalTasks: (tasks: number) => void;
  resetStats: () => void;
  loadUserStats: () => Promise<void>;
}

const defaultStats: CharacterStats = {
  level: 1,
  experience: 0,
  maxExperience: 100,
  health: 100,
  maxHealth: 100,
  coinsEarned: 0,
  gemsEarned: 0,
  habitsCompleted: 0,
  totalHabits: 0,
  dailiesCompleted: 0,
  totalDailies: 0,
  routinesCompleted: 0,
  totalRoutines: 0,
  focusMinutes: 0,
  focusSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTasksCompleted: 0,
};

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<CharacterStats>({
    level: 1,
    experience: 0,
    health: 100,           // ← FIX: Always start with 100 health
    maxHealth: 100,        // ← FIX: Max health is always 100
    coinsEarned: 0,
    gemsEarned: 0,
    currentStreak: 0,
    totalTasksCompleted: 0,
    focusMinutes: 0,
    levelMessage: null as string | null,
  })

  // Character progression formulas
  const calculateLevelFromXP = (experience: number): number => {
    return Math.floor(experience / 100) + 1;
  };

  const calculateMaxXPForLevel = (level: number): number => {
    return level * 100;
  };

  const calculateMaxHealthForLevel = (level: number): number => {
    return 100 + ((level - 1) * 10);
  };

  // Backend sync function
  const syncStatsToBackend = async (newStats: CharacterStats) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const isGuest = await AsyncStorage.getItem('isGuest');

      if (token && isGuest !== 'true') {
        console.log('☁️ Syncing stats to backend...');
        await statsAPI.updateStats(newStats);
        console.log('✅ Stats synced to backend successfully');
      }
    } catch (error) {
      console.error('❌ Failed to sync stats to backend:', error);
      // Continue silently - local storage still works
    }
  };

  // Save stats locally and sync to backend
  const saveStats = async (newStats: CharacterStats) => {
    try {
      // Always save locally first
      await AsyncStorage.setItem('characterStats', JSON.stringify(newStats));
      
      // Then try to sync to backend
      await syncStatsToBackend(newStats);
    } catch (error) {
      console.error('Failed to save character stats:', error);
    }
  };

  // Load stats from backend or local storage
  const loadUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const isGuest = await AsyncStorage.getItem('isGuest');

      // Try to load from backend first
      if (token && isGuest !== 'true') {
        console.log('🔄 Loading stats from backend...');
        try {
          const response = await statsAPI.getStats();
          
          if (response.success && response.stats) {
            const backendStats = response.stats;
            const loadedStats = {
              level: backendStats.level || 1,
              experience: backendStats.experience || 0,
              maxExperience: calculateMaxXPForLevel(backendStats.level || 1),
              health: backendStats.health || 100,
              maxHealth: calculateMaxHealthForLevel(backendStats.level || 1),
              coinsEarned: backendStats.coins_earned || 0,
              gemsEarned: backendStats.gems_earned || 0,
              currentStreak: backendStats.current_streak || 0,
              longestStreak: backendStats.longest_streak || 0,
              totalTasksCompleted: backendStats.total_tasks_completed || 0,
              focusMinutes: backendStats.focus_minutes || 0,
              focusSessions: backendStats.focus_sessions || 0,
              habitsCompleted: 0, // These are calculated real-time
              totalHabits: 0,
              dailiesCompleted: 0,
              totalDailies: 0,
              routinesCompleted: 0,
              totalRoutines: 0,
            };

            setStats(loadedStats);
            
            // Cache locally
            await AsyncStorage.setItem('characterStats', JSON.stringify(loadedStats));
            
            console.log('✅ Stats loaded from backend');
            return;
          }
        } catch (error) {
          console.log('❌ Backend stats failed, loading from local:', error);
        }
      }

      // Load from local storage (guest mode or backup)
      console.log('📱 Loading stats from local storage...');
      const savedStats = await AsyncStorage.getItem('characterStats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats({ ...defaultStats, ...parsedStats });
      } else {
        // First time user - start fresh at level 1
        console.log('🆕 New user - starting at Level 1');
        setStats(defaultStats);
        await AsyncStorage.setItem('characterStats', JSON.stringify(defaultStats));
        
        // Create backend stats if logged in
        if (token && isGuest !== 'true') {
          await syncStatsToBackend(defaultStats);
        }
      }
    } catch (error) {
      console.error('Failed to load character stats:', error);
      setStats(defaultStats);
    }
  };

  // Level up system
  const checkLevelUp = (newExperience: number, currentLevel: number) => {
    const newLevel = calculateLevelFromXP(newExperience);
    
    if (newLevel > currentLevel) {
      return {
        newLevel,
        levelMessage: `🎉 LEVEL UP! Welcome to Level ${newLevel}!`
      };
    }
    
    return { newLevel: currentLevel };
  };

  // Update experience with level progression
  const updateExperience = (amount: number) => {
    setStats(prevStats => {
      const newExperience = Math.max(0, prevStats.experience + amount);
      const { newLevel, levelMessage } = checkLevelUp(newExperience, prevStats.level);
      const newMaxExperience = calculateMaxXPForLevel(newLevel);
      const newMaxHealth = calculateMaxHealthForLevel(newLevel);
      
      // If leveled up, restore some health as a bonus
      const healthBonus = newLevel > prevStats.level ? 20 : 0;
      const newHealth = Math.min(newMaxHealth, prevStats.health + healthBonus);
      
      const updatedStats = {
        ...prevStats,
        experience: newExperience,
        level: newLevel,
        maxExperience: newMaxExperience,
        health: newHealth,
        maxHealth: newMaxHealth,
        levelMessage: levelMessage || prevStats.levelMessage,
        totalTasksCompleted: amount > 0 ? prevStats.totalTasksCompleted + 1 : prevStats.totalTasksCompleted
      };
      
      saveStats(updatedStats);
      
      // Clear level message after 5 seconds
      if (levelMessage) {
        setTimeout(() => {
          setStats(current => ({ ...current, levelMessage: undefined }));
        }, 5000);
      }
      
      return updatedStats;
    });
  };

  // Update health
  const updateHealth = (amount: number) => {
    setStats(prevStats => {
      const newHealth = Math.max(0, Math.min(prevStats.maxHealth, prevStats.health + amount));
      const updatedStats = { ...prevStats, health: newHealth };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Update coins
  const updateCoins = (amount: number) => {
    setStats(prevStats => {
      const newCoins = Math.max(0, prevStats.coinsEarned + amount);
      const updatedStats = { ...prevStats, coinsEarned: newCoins };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Update gems
  const updateGems = (amount: number) => {
    setStats(prevStats => {
      const newGems = Math.max(0, prevStats.gemsEarned + amount);
      const updatedStats = { ...prevStats, gemsEarned: newGems };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Update habit completion
  const updateHabitCompletion = (completed: number, total: number) => {
    setStats(prevStats => ({ ...prevStats, habitsCompleted: completed, totalHabits: total }));
  };

  // Update dailies completion
  const updateDailiesCompletion = (completed: number, total: number) => {
    setStats(prevStats => ({ ...prevStats, dailiesCompleted: completed, totalDailies: total }));
  };

  // Update routines completion
  const updateRoutinesCompletion = (completed: number, total: number) => {
    setStats(prevStats => ({ ...prevStats, routinesCompleted: completed, totalRoutines: total }));
  };

  // Update focus time
  const updateFocusTime = (minutes: number) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, focusMinutes: prevStats.focusMinutes + minutes };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Update focus sessions
  const updateFocusSessions = (sessions: number) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, focusSessions: sessions };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Update streak
  const updateStreak = (streak: number) => {
    setStats(prevStats => {
      const newLongestStreak = Math.max(prevStats.longestStreak, streak);
      const updatedStats = { 
        ...prevStats, 
        currentStreak: streak,
        longestStreak: newLongestStreak 
      };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Update total tasks
  const updateTotalTasks = (tasks: number) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, totalTasksCompleted: tasks };
      saveStats(updatedStats);
      return updatedStats;
    });
  };

  // Reset stats
  const resetStats = () => {
    setStats({
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      coinsEarned: 0,
      gemsEarned: 0,
      currentStreak: 0,
      totalTasksCompleted: 0,
      focusMinutes: 0,
      levelMessage: null,
    })
  }

  // Load stats on mount
  useEffect(() => {
    loadUserStats();
  }, []);

  return (
    <StatsContext.Provider value={{
      stats,
      updateExperience,
      updateHealth,
      updateCoins,
      updateGems,
      updateHabitCompletion,
      updateDailiesCompletion,
      updateRoutinesCompletion,
      updateFocusTime,
      updateFocusSessions,
      updateStreak,
      updateTotalTasks,
      resetStats,
      loadUserStats
    }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}
