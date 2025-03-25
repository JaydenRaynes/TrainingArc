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
import { theme } from '../utils/theme';

export default function TabLayout() {
  return (
    <NavigationContainer>
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
            fontSize: 10,
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
            tabBarIcon: ({ color }) => <MaterialIcons name="format-list-numbered" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="generateWorkout" 
          options={{
            title: 'AI Workout',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Feather name="map-pin" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="splits"
          options={{
            title: 'Splits',
            tabBarIcon: ({ color }) => <AntDesign name="calendar" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="questionare"
          options={{
            title: 'Questionare',
            tabBarIcon: ({ color }) => <FontAwesome6 name="comments" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Feather name="user" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => <Entypo name="shop" size={30} color={color} />,
          }}
        />
      </Tabs>
    </NavigationContainer>
  );
}
