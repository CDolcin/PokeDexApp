
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { getPokemonDetails } from '../api';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesScreen() {
  const navigation = useNavigation();

  const {
    favorites,
    toggleFavorite,
    isLoaded,
  } = useFavorites();

  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load favorite Pokémon using the existing API
  useEffect(() => {
    if (!isLoaded) return;

    let active = true;

    const loadFavorites = async () => {
      if (favorites.length === 0) {
        setPokemonList([]);
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const results = await Promise.all(
          favorites.map((id) => getPokemonDetails(id))
        );

        if (active) {
          setPokemonList(results);
        }
      } catch (err) {
        console.error('Error loading favorites:', err);

        if (active) {
          setError('Failed to load favorite Pokémon.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, [favorites, isLoaded]);

  // Loading screen
  if (!isLoaded || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#e63946"
        />

        <Text style={styles.message}>
          Loading favorites...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.heading}>
        My Favorites ❤️
      </Text>

      <Text style={styles.subtitle}>
        Your saved Pokémon collection
      </Text>

      <Text style={styles.count}>
        Total Favorites: {favorites.length}
      </Text>

      {/* Error message */}
      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      {/* Favorites list */}
      <FlatList
        data={pokemonList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="heart-outline"
              size={65}
              color="#e63946"
            />

            <Text style={styles.emptyTitle}>
              No Favorites Yet!
            </Text>

            <Text style={styles.message}>
              Go to the Pokédex, select a Pokémon,
              and tap Add to Favorites.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl =
            item.sprites?.other?.['official-artwork']
              ?.front_default ||
            item.sprites?.front_default;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('PokemonDetail', {
                  id: item.id,
                })
              }
            >
              {/* Pokémon image */}
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />

              {/* Pokémon information */}
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.name}
                </Text>

                <Text style={styles.number}>
                  #{String(item.id).padStart(3, '0')}
                </Text>

                <Text style={styles.detailsHint}>
                  Tap to view details
                </Text>
              </View>

              {/* Remove from favorites */}
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => toggleFavorite(item.id)}
                accessibilityLabel={`Remove ${item.name} from favorites`}
              >
                <Ionicons
                  name="heart"
                  size={28}
                  color="#e63946"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#e63946',
    textAlign: 'center',
    marginTop: 24,
  },

  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },

  count: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  image: {
    width: 85,
    height: 85,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },

  number: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },

  detailsHint: {
    fontSize: 12,
    color: '#e63946',
    marginTop: 7,
  },

  heartButton: {
    padding: 10,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },

  message: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },

  errorText: {
    color: '#d62828',
    textAlign: 'center',
    marginBottom: 12,
  },
});
