import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';

export default function TabLayout() {
  return (
    <NavigationContainer>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color }) => <Entypo name="progress-one" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="exercises"
          options={{
            title: 'Exercises',
            tabBarIcon: ({ color }) => <MaterialIcons name="format-list-numbered" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="generateWorkout" 
          options={{
            title: 'AI Workout',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Feather name="map-pin" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="splits"
          options={{
            title: 'Splits',
            tabBarIcon: ({ color }) => <AntDesign name="calendar" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="questionare"
          options={{
            title: 'Questionare',
            tabBarIcon: ({ color }) => <FontAwesome6 name="comments" />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Feather name="settings" size={24} color="black" />,
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => <Entypo name="shop" size={24} color="black" />,
          }}
        />
      </Tabs>
    </NavigationContainer>
  );
}
