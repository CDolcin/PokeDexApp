
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PokedexScreen from './src/screens/PokedexScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import PokemonDetailScreen from './src/screens/PokemonDetailScreen';

// NEW: Favorites screen
import FavoritesScreen from './src/screens/FavoritesScreen';

import { TeamProvider } from './src/context/TeamContext';
import { FavoritesProvider } from './src/context/FavoritesContext';

// Debugging: Check imported components
console.log('========== DEBUG CHECK ==========');
console.log('PokedexScreen:', typeof PokedexScreen);
console.log('TeamScreen:', typeof TeamScreen);
console.log('GameScreen:', typeof GameScreen);
console.log('PokemonDetailScreen:', typeof PokemonDetailScreen);
console.log('TeamProvider:', typeof TeamProvider);
console.log('FavoritesProvider:', typeof FavoritesProvider);
console.log('NavigationContainer:', typeof NavigationContainer);
console.log('Ionicons:', typeof Ionicons);

// NEW: Debugging Favorites screen
console.log('FavoritesScreen:', typeof FavoritesScreen);

console.log('=================================');

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom tab navigation
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Pokédex') {
            iconName = focused
              ? 'grid'
              : 'grid-outline';

          } else if (route.name === 'My Team') {
            iconName = focused
              ? 'people'
              : 'people-outline';

          } else if (route.name === 'Game') {
            iconName = focused
              ? 'game-controller'
              : 'game-controller-outline';

          // NEW: Favorites tab icon
          } else if (route.name === 'Favorites') {
            iconName = focused
              ? 'heart'
              : 'heart-outline';

          } else {
            iconName = 'ellipse-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: '#e63946',
        tabBarInactiveTintColor: 'gray',

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
        },

        headerTitleAlign: 'center',
      })}
    >
      {/* Existing Pokédex tab */}
      <Tab.Screen
        name="Pokédex"
        component={PokedexScreen}
        options={{
          title: "Chimi's Pokédex",
        }}
      />

      {/* Existing My Team tab */}
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
        options={{
          title: 'My Pokémon Team',
        }}
      />

      {/* Existing Game tab */}
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          title: "Who's That Pokémon?",
        }}
      />

      {/* NEW: Favorites tab */}
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'My Favorite Pokémon',
          tabBarLabel: 'Favorites',
        }}
      />
    </Tab.Navigator>
  );
}

// Main application
export default function App() {
  console.log('App component is rendering');

  return (
    <TeamProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={BottomTabs}
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="PokemonDetail"
              component={PokemonDetailScreen}
              options={{
                title: 'Pokémon Details',
                headerTitleAlign: 'center',
                headerTintColor: '#e63946',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </TeamProvider>
  );
}
