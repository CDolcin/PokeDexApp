
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamContext = createContext();

const STORAGE_KEY = '@chimi_pokemon_team';

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved team when the app starts
  useEffect(() => {
    const loadSavedTeam = async () => {
      try {
        const savedTeam = await AsyncStorage.getItem(
          STORAGE_KEY
        );

        if (savedTeam !== null) {
          const parsedTeam = JSON.parse(savedTeam);

          if (Array.isArray(parsedTeam)) {
            setTeam(parsedTeam.slice(0, 6));
          }
        }
      } catch (error) {
        console.error('Error loading team:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedTeam();
  }, []);

  // Save the team whenever it changes
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveTeam = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(team)
        );
      } catch (error) {
        console.error('Error saving team:', error);
      }
    };

    saveTeam();
  }, [team, isLoaded]);

  // Add a Pokémon to the team
  const addToTeam = (pokemon) => {
    if (!isLoaded) {
      return false;
    }

    if (team.some(item => item.id === pokemon.id)) {
      return false;
    }

    if (team.length >= 6) {
      return false;
    }

    setTeam(previous => [...previous, pokemon]);
    return true;
  };

  // Remove a Pokémon from the team
  const removeFromTeam = (id) => {
    if (!isLoaded) {
      return;
    }

    setTeam(previous =>
      previous.filter(item => item.id !== id)
    );
  };

  // Check if a Pokémon is already in the team
  const isInTeam = (id) => {
    return team.some(item => item.id === id);
  };

  return (
    <TeamContext.Provider
      value={{
        team,
        addToTeam,
        removeFromTeam,
        isInTeam,
        isLoaded,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);

  if (!context) {
    throw new Error(
      'useTeam must be used inside TeamProvider'
    );
  }

  return context;
}
