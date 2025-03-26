import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import { CopilotStep, useCopilot, CopilotProvider, walkthroughable } from 'react-native-copilot';
import "../firebaseConfig"
import { getAuth, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { theme } from '../utils/theme';

const WalkthroughView = walkthroughable(View);
const firestore = getFirestore();

function TabLayout() {
  const { start, copilotEvents } = useCopilot();
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const auth = getAuth();
  
    const checkUserTutorialStatus = async (user: User | null) => {
      try {
        if (!user) {
          console.log("No user found, skipping tutorial check.");
          return;
        }
  
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists() && userDoc.data().hasSeenTutorial) {
          console.log("User has already seen the tutorial.");
          return;
        }
  
        console.log("First-time user detected. Preparing to start tutorial...");
        setIsFirstTime(true);
  
        // Wait briefly to ensure everything is mounted before starting tutorial
        setTimeout(() => {
          console.log("Starting tutorial...");
          start(); 
        }, 1500);
  
        // Mark tutorial as seen in Firestore
        await setDoc(userDocRef, { hasSeenTutorial: true }, { merge: true });
  
      } catch (error) {
        console.error("Error checking tutorial status:", error);
      }
    };
  
    // Listen for authentication state change to ensure user is available
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User authenticated, checking tutorial status...");
        checkUserTutorialStatus(user);
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [start]); // Dependency to ensure `start()` is available

  useEffect(() => {
    copilotEvents.on('start', () => console.log('Tutorial started!'));
    copilotEvents.on('stop', () => console.log('Tutorial ended.'));
  }, [copilotEvents]);

  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            height: 65,
            paddingBottom: 5,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 8,
          },
          tabBarIconStyle: {
            marginTop: 5,
          },
        }}
        >
        <Tabs.Screen
          name="exercises"
          options={{
            title: 'Exercises',
            tabBarIcon: ({color}) => (
              <CopilotStep text="View a list of exercises." order={1} name="Exercises">
                <WalkthroughView>
                  <MaterialIcons name="format-list-numbered" size={24} color={color} />
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />

        <Tabs.Screen
          name="generateWorkout"
          options={{
            title: 'AI Workout',
            tabBarIcon: ({color}) => (
              <CopilotStep text="Generate AI-powered workouts!" order={2} name="AIWorkout">
                <WalkthroughView>
                  <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({color}) => (
              <CopilotStep text="Discover new workout locations." order={3} name="Explore">
                <WalkthroughView>
                  <Feather name="map-pin" size={24} color={color} />
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: 'Workout',
            tabBarIcon: ({color}) => (
              <CopilotStep text="View Today's Workout" order={4} name="Workout">
                <WalkthroughView>
                  <FontAwesome6 name="house" size={24} color={color}/>
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({color}) => (
              <CopilotStep text="View various supplements that may help you on your journey" order={5} name="Shop">
                <WalkthroughView>
                  <Entypo name="shop" size={24} color={color} />
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />

        <Tabs.Screen
          name="questionare"
          options={{
            title: 'Questionare',
            tabBarIcon: ({color}) => (
              <CopilotStep text="General Information Form to help formulate a better workout plan" order={6} name="Questionare">
                <WalkthroughView>
                  <FontAwesome6 name="comments" size={24} color={color} />
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({color}) => (
              <CopilotStep text="Your Profile Page" order={6} name="Profile">
                <WalkthroughView>
                  <FontAwesome6 name="user" size={24} color={color} />
                </WalkthroughView>
              </CopilotStep>
            ),
          }}
        />
      </Tabs>
  );
}

// Wrap with CopilotProvider
export default function App() {
  return (
    <CopilotProvider>
      <TabLayout />
    </CopilotProvider>
  );
}