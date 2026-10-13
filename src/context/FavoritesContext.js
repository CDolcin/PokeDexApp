
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Favorites Context
const FavoritesContext = createContext(null);

// Storage key
const STORAGE_KEY = '@chimi_pokemon_favorites';

// Favorites Provider
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved favorites when app starts
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(
          STORAGE_KEY
        );

        if (savedFavorites !== null) {
          const parsedFavorites = JSON.parse(savedFavorites);

          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites);
          }
        }
      } catch (error) {
        console.error(
          'Error loading favorites:',
          error
        );
      } finally {
        setIsLoaded(true);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(favorites)
        );
      } catch (error) {
        console.error(
          'Error saving favorites:',
          error
        );
      }
    };

    saveFavorites();
  }, [favorites, isLoaded]);

  // Add or remove a Pokémon from favorites
  const toggleFavorite = (pokemonId) => {
    if (!isLoaded) return;

    setFavorites((previous) => {
      if (previous.includes(pokemonId)) {
        return previous.filter(
          (id) => id !== pokemonId
        );
      }

      return [...previous, pokemonId];
    });
  };

  // Check whether a Pokémon is a favorite
  const isFavorite = (pokemonId) => {
    return favorites.includes(pokemonId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isLoaded,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook for accessing Favorites Context
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      'useFavorites must be used inside FavoritesProvider'
    );
  }

  return context;
}
