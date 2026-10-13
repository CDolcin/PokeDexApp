
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

import { getPokemonDetails } from '../api';
import { useTeam } from '../context/TeamContext';
import { useFavorites } from '../context/FavoritesContext';

const capitalize = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export default function PokemonDetailScreen({ route }) {
  const { id } = route.params;

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Team context
  const { team, addToTeam, isInTeam } = useTeam();

  // Favorites context
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    isLoaded: favoritesLoaded,
  } = useFavorites();

  const loadPokemon = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getPokemonDetails(id);
      setPokemon(data);
    } catch (err) {
      setError(err.message || 'Failed to load Pokémon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemon();
  }, [id]);

  const handleAddToTeam = () => {
    if (!pokemon) return;

    if (isInTeam(pokemon.id)) {
      Alert.alert(
        'Already Added',
        'This Pokémon is already in your team.'
      );
      return;
    }

    if (team.length >= 6) {
      Alert.alert(
        'Team Full',
        'You can only have 6 Pokémon in your team.'
      );
      return;
    }

    const added = addToTeam(pokemon);

    if (added) {
      Alert.alert(
        'Success!',
        `${capitalize(pokemon.name)} was added to your team.`
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#e63946"
        />
        <Text style={styles.message}>
          Loading Pokémon details...
        </Text>
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || 'Pokémon not found'}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPokemon}
        >
          <Text style={styles.buttonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl =
    pokemon.sprites?.other?.['official-artwork']
      ?.front_default ||
    pokemon.sprites?.front_default;

  const alreadyInTeam = isInTeam(pokemon.id);
  const teamFull = team.length >= 6;
  const favorite = isFavorite(pokemon.id);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Pokémon information card */}
      <View style={styles.card}>
        <Text style={styles.pokemonNumber}>
          #{String(pokemon.id).padStart(3, '0')}
        </Text>

        <Image
          source={{ uri: imageUrl }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />

        <Text style={styles.pokemonName}>
          {capitalize(pokemon.name)}
        </Text>

        {/* Pokémon types */}
        <View style={styles.typesContainer}>
          {pokemon.types.map((item) => {
            const typeName = item.type.name;

            return (
              <View
                key={typeName}
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      typeColors[typeName] || '#888',
                  },
                ]}
              >
                <Text style={styles.typeText}>
                  {capitalize(typeName)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Favorites button */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            favorite && styles.favoriteActive,
          ]}
          onPress={() => toggleFavorite(pokemon.id)}
          disabled={!favoritesLoaded}
        >
          <Text style={styles.favoriteButtonText}>
            {favorite
              ? '❤️ Remove from Favorites'
              : '🤍 Add to Favorites'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.favoritesCount}>
          Total Favorites: {favorites.length}
        </Text>
      </View>

      {/* Height and weight */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Pokémon Information
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Height
            </Text>

            <Text style={styles.infoValue}>
              {pokemon.height / 10} m
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Weight
            </Text>

            <Text style={styles.infoValue}>
              {pokemon.weight / 10} kg
            </Text>
          </View>
        </View>
      </View>

      {/* Base stats */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Base Stats
        </Text>

        {pokemon.stats.map((item) => {
          const statName = item.stat.name
            .replace('special-attack', 'Sp. Attack')
            .replace('special-defense', 'Sp. Defense')
            .replace('attack', 'Attack')
            .replace('defense', 'Defense')
            .replace('speed', 'Speed')
            .replace('hp', 'HP');

          const statValue = item.base_stat;

          return (
            <View
              key={item.stat.name}
              style={styles.statRow}
            >
              <Text style={styles.statName}>
                {statName}
              </Text>

              <Text style={styles.statValue}>
                {statValue}
              </Text>

              <View style={styles.statBarBackground}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${Math.min(
                        (statValue / 255) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Add to team */}
      <TouchableOpacity
        style={[
          styles.teamButton,
          (alreadyInTeam || teamFull) &&
            styles.disabledButton,
        ]}
        onPress={handleAddToTeam}
        disabled={alreadyInTeam || teamFull}
      >
        <Text style={styles.buttonText}>
          {alreadyInTeam
            ? '✓ Already in My Team'
            : teamFull
              ? 'Team Full (6/6)'
              : 'Add to My Team'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.teamCount}>
        Team Members: {team.length}/6
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },

  message: {
    marginTop: 12,
    color: '#777',
  },

  errorText: {
    fontSize: 16,
    color: '#d62828',
    textAlign: 'center',
    marginBottom: 18,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },

  pokemonNumber: {
    fontSize: 17,
    color: '#888',
    textAlign: 'center',
  },

  pokemonImage: {
    width: 220,
    height: 220,
    alignSelf: 'center',
  },

  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 12,
  },

  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },

  typeBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  favoriteButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },

  favoriteActive: {
    backgroundColor: '#ffe5e5',
  },

  favoriteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63946',
  },

  favoritesCount: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  infoItem: {
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },

  infoValue: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
  },

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },

  statName: {
    width: 80,
    fontSize: 12,
    color: '#555',
  },

  statValue: {
    width: 30,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },

  statBarBackground: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },

  statBarFill: {
    height: '100%',
    backgroundColor: '#e63946',
    borderRadius: 5,
  },

  teamButton: {
    backgroundColor: '#e63946',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  disabledButton: {
    backgroundColor: '#aaa',
  },

  retryButton: {
    backgroundColor: '#e63946',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  teamCount: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 12,
  },
});
