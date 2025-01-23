import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TopTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: 'top',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="appname"
        options={{
          title: 'Training Arc',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="face-man-profile" size={24} color="black" />,
        }}
      />
    </Tabs>
  );
}
