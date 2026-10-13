
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import {
  getPokemonList,
  getAllPokemonNames,
} from '../api';

const START_OFFSET = 149;
const PAGE_SIZE = 20;

// Get Pokémon number from API URL
function getPokemonId(url) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

// Display Pokémon image with fallback
function PokemonImage({ id }) {
  const officialImage =
    `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`;

  const fallbackImage =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  const [imageUrl, setImageUrl] = useState(officialImage);

  useEffect(() => {
    setImageUrl(officialImage);
  }, [id]);

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.pokemonImage}
      resizeMode="contain"
      onError={() => {
        if (imageUrl !== fallbackImage) {
          setImageUrl(fallbackImage);
        }
      }}
    />
  );
}

export default function PokedexScreen({ navigation }) {
  const [pokemon, setPokemon] = useState([]);
  const [offset, setOffset] = useState(START_OFFSET);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [hasMore, setHasMore] = useState(true);

  // Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [allPokemon, setAllPokemon] = useState([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [searchError, setSearchError] = useState('');

  const loadingMoreRef = useRef(false);

  // Load first page of Pokémon
  const loadInitialPokemon = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getPokemonList(
        START_OFFSET,
        PAGE_SIZE
      );

      setPokemon(data.results);
      setOffset(START_OFFSET + data.results.length);

      setHasMore(
        START_OFFSET + data.results.length < data.count
      );
    } catch (err) {
      setError(err.message || 'Failed to load Pokémon');
    } finally {
      setLoading(false);
    }
  };

  // Load more Pokémon while scrolling
  const loadMorePokemon = async () => {
    if (
      loading ||
      loadingMoreRef.current ||
      !hasMore ||
      search.trim() !== ''
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const data = await getPokemonList(
        offset,
        PAGE_SIZE
      );

      setPokemon(previous => {
        const existingNames = new Set(
          previous.map(item => item.name)
        );

        const newPokemon = data.results.filter(
          item => !existingNames.has(item.name)
        );

        return [...previous, ...newPokemon];
      });

      const nextOffset = offset + data.results.length;

      setOffset(nextOffset);
      setHasMore(nextOffset < data.count);
    } catch (err) {
      setError(err.message || 'Failed to load more Pokémon');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  // Load all Pokémon names for global search
  const loadAllNames = async () => {
    setSearchLoading(true);
    setSearchError('');

    try {
      const data = await getAllPokemonNames();
      setAllPokemon(data.results);
    } catch (err) {
      setSearchError(
        err.message || 'Failed to load Pokémon names'
      );
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadInitialPokemon();
    loadAllNames();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(
        search.trim().toLowerCase()
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const isSearching = search.trim() !== '';

  const displayedPokemon = isSearching
    ? allPokemon.filter(item =>
        item.name.includes(debouncedSearch)
      )
    : pokemon;

  // Display each Pokémon card
  const renderPokemon = ({ item }) => {
    const id = getPokemonId(item.url);

    const formattedId = String(id).padStart(3, '0');

    const formattedName =
      item.name.charAt(0).toUpperCase() +
      item.name.slice(1);

    return (
      <TouchableOpacity
        style={styles.pokemonItem}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('PokemonDetail', {
            id: id,
          })
        }
      >
        <PokemonImage id={id} />

        <View style={styles.pokemonInfo}>
          <Text style={styles.pokemonName}>
            {formattedName}
          </Text>

          <Text style={styles.pokemonNumber}>
            #{formattedId}
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>
    );
  };

  // Footer loading indicator
  const renderFooter = () => {
    if (!loadingMore || isSearching) {
      return null;
    }

    return (
      <ActivityIndicator
        size="large"
        color="#e63946"
        style={styles.footerLoader}
      />
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Chimi's Pokédex
      </Text>

      <Text style={styles.subtitle}>
        Explore and discover Pokémon!
      </Text>

      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Pokémon..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Search loading */}
      {isSearching && searchLoading && (
        <ActivityIndicator
          size="small"
          color="#e63946"
          style={styles.searchLoader}
        />
      )}

      {/* Search error */}
      {isSearching && searchError !== '' && (
        <View style={styles.messageBox}>
          <Text style={styles.errorText}>
            {searchError}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAllNames}
          >
            <Text style={styles.retryText}>
              Retry Search
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main loading */}
      {loading && !isSearching ? (
        <ActivityIndicator
          size="large"
          color="#e63946"
          style={styles.mainLoader}
        />
      ) : (
        <>
          {/* Main error */}
          {!isSearching && error !== '' && (
            <View style={styles.messageBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={
                  pokemon.length === 0
                    ? loadInitialPokemon
                    : loadMorePokemon
                }
              >
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={
              isSearching &&
              (debouncedSearch === '' ||
                searchLoading ||
                searchError !== '')
                ? []
                : displayedPokemon
            }
            keyExtractor={item => item.name}
            renderItem={renderPokemon}
            contentContainerStyle={styles.listContent}
            onEndReached={
              isSearching ? undefined : loadMorePokemon
            }
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              isSearching &&
              !searchLoading &&
              searchError === '' &&
              debouncedSearch !== '' ? (
                <Text style={styles.emptyText}>
                  No Pokémon found.
                </Text>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#e63946',
    textAlign: 'center',
    marginTop: 18,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 16,
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 14,
  },

  pokemonItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  pokemonImage: {
    width: 85,
    height: 85,
  },

  pokemonInfo: {
    flex: 1,
    marginLeft: 16,
  },

  pokemonName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
  },

  pokemonNumber: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },

  arrow: {
    fontSize: 32,
    color: '#aaa',
    marginRight: 8,
  },

  listContent: {
    paddingBottom: 25,
    flexGrow: 1,
  },

  mainLoader: {
    marginTop: 50,
  },

  searchLoader: {
    marginBottom: 10,
  },

  footerLoader: {
    marginVertical: 20,
  },

  messageBox: {
    alignItems: 'center',
    marginVertical: 12,
  },

  errorText: {
    color: '#d62828',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },

  retryButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 35,
    fontSize: 16,
  },
});
