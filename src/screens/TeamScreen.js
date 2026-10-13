
import React from 'react';

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { useTeam } from '../context/TeamContext';

export default function TeamScreen({ navigation }) {
  const { team, removeFromTeam } = useTeam();

  // Remove Pokémon with confirmation
  const handleRemove = (pokemon) => {
    Alert.alert(
      'Remove Pokémon',
      `Remove ${pokemon.name} from your team?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromTeam(pokemon.id),
        },
      ]
    );
  };

  // Display each team member
  const renderPokemon = ({ item }) => {
    const imageUrl =
      item.sprites?.other?.['official-artwork']
        ?.front_default ||
      item.sprites?.front_default;

    const name =
      item.name.charAt(0).toUpperCase() +
      item.name.slice(1);

    return (
      <View style={styles.pokemonCard}>
        <TouchableOpacity
          style={styles.pokemonInfo}
          onPress={() =>
            navigation.navigate('PokemonDetail', {
              id: item.id,
            })
          }
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.pokemonImage}
            resizeMode="contain"
          />

          <View style={styles.details}>
            <Text style={styles.pokemonName}>
              {name}
            </Text>

            <Text style={styles.pokemonNumber}>
              #{String(item.id).padStart(3, '0')}
            </Text>

            <Text style={styles.pokemonType}>
              {item.types
                .map(type => type.type.name)
                .join(' / ')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item)}
        >
          <Text style={styles.removeText}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My Pokémon Team
      </Text>

      <Text style={styles.subtitle}>
        Build your team of up to 6 Pokémon
      </Text>

      <View style={styles.counterBox}>
        <Text style={styles.counterText}>
          Team Members: {team.length}/6
        </Text>
      </View>

      <FlatList
        data={team}
        keyExtractor={item => String(item.id)}
        renderItem={renderPokemon}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              ⚪
            </Text>

            <Text style={styles.emptyTitle}>
              Your team is empty!
            </Text>

            <Text style={styles.emptyText}>
              Go to the Pokédex and add your favorite Pokémon.
            </Text>
          </View>
        }
      />
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
    marginTop: 6,
    marginBottom: 16,
  },

  counterBox: {
    backgroundColor: '#e63946',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  counterText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  listContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },

  pokemonCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },

  pokemonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pokemonImage: {
    width: 90,
    height: 90,
  },

  details: {
    flex: 1,
    marginLeft: 14,
  },

  pokemonName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
  },

  pokemonNumber: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },

  pokemonType: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    textTransform: 'capitalize',
  },

  removeButton: {
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  removeText: {
    color: '#d62828',
    fontSize: 14,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 23,
  },
});
