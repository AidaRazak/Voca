import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export interface StreakUpdateData {
  accuracy?: number;
  brandName?: string;
  sessionType?: 'practice' | 'game' | 'arcade-session';
}

export const updateUserStreak = async (userId: string, updateData: StreakUpdateData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user document with initial streak data
      const accuracyByBrand: any = {};
      if (updateData.brandName && updateData.accuracy !== undefined) {
        accuracyByBrand[updateData.brandName] = [updateData.accuracy];
      }
      await updateDoc(userDocRef, {
        streakCount: 1,
        lastPlayedDate: new Date().toISOString().split('T')[0],
        activeDays: [new Date().toISOString().split('T')[0]],
        totalSessions: 1,
        brandsLearned: updateData.brandName ? 1 : 0,
        averageAccuracy: updateData.accuracy || 0,
        gameScore: 0,
        learnedBrands: updateData.brandName ? [updateData.brandName] : [],
        accuracyByBrand
      });
      return;
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newStreakCount = userData.streakCount || 0;
    let newActiveDays = userData.activeDays || [];
    let newTotalSessions = userData.totalSessions || 0;
    let newBrandsLearned = userData.brandsLearned || 0;
    let newAverageAccuracy = userData.averageAccuracy || 0;
    let learnedBrands = userData.learnedBrands || [];
    let accuracyByBrand = userData.accuracyByBrand || {};
    
    // Check if user already played today
    const alreadyPlayedToday = newActiveDays.includes(today);
    
    // Always increment totalSessions for every game played
    newTotalSessions += 1;
    // Update average accuracy for every session
    if (updateData.accuracy !== undefined) {
      const totalAccuracy = (newAverageAccuracy * (newTotalSessions - 1)) + updateData.accuracy;
      newAverageAccuracy = Math.round(totalAccuracy / newTotalSessions);
    }
    // Only update streak and activeDays if this is a new day
    if (!alreadyPlayedToday) {
      newActiveDays = [...newActiveDays, today];
      if (userData.lastPlayedDate === yesterday) {
        newStreakCount += 1;
      } else if (userData.lastPlayedDate !== today) {
        newStreakCount = 1;
      }
    }
    // Update brands learned if new brand
    if (updateData.brandName) {
      if (!learnedBrands.includes(updateData.brandName)) {
        learnedBrands.push(updateData.brandName);
        newBrandsLearned = learnedBrands.length;
      }
      // Update accuracyByBrand
      if (updateData.accuracy !== undefined) {
        if (!accuracyByBrand[updateData.brandName]) {
          accuracyByBrand[updateData.brandName] = [];
        }
        accuracyByBrand[updateData.brandName].push(updateData.accuracy);
      }
    }
    
    // Update Firestore
    await updateDoc(userDocRef, {
      streakCount: newStreakCount,
      lastPlayedDate: today,
      activeDays: newActiveDays,
      totalSessions: newTotalSessions,
      brandsLearned: newBrandsLearned,
      averageAccuracy: newAverageAccuracy,
      learnedBrands,
      accuracyByBrand
    });
    
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
};

export const getStreakData = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        streakCount: data.streakCount || 0,
        lastPlayedDate: data.lastPlayedDate || '',
        activeDays: data.activeDays || [],
        totalSessions: data.totalSessions || 0,
        brandsLearned: data.brandsLearned || 0,
        averageAccuracy: data.averageAccuracy || 0
      };
    }
    
    return {
      streakCount: 0,
      lastPlayedDate: '',
      activeDays: [],
      totalSessions: 0,
      brandsLearned: 0,
      averageAccuracy: 0
    };
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return {
      streakCount: 0,
      lastPlayedDate: '',
      activeDays: [],
      totalSessions: 0,
      brandsLearned: 0,
      averageAccuracy: 0
    };
  }
}; 