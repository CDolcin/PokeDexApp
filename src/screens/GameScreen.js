
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { getPokemonDetails } from '../api';

const MAX_POKEMON = 1025;

// Capitalize Pokémon name
const capitalize = (name) =>
  name.charAt(0).toUpperCase() + name.slice(1);

// Generate random Pokémon ID
function randomId() {
  return Math.floor(Math.random() * MAX_POKEMON) + 1;
}

// Generate four unique Pokémon IDs
function generateIds() {
  const ids = new Set();

  while (ids.size < 4) {
    ids.add(randomId());
  }

  return [...ids];
}

export default function GameScreen() {
  const [pokemon, setPokemon] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Score and streak tracking
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  // Start a new guessing round
  const startNewRound = async () => {
    setLoading(true);
    setError('');
    setPokemon(null);
    setChoices([]);
    setSelectedAnswer(null);

    try {
      const ids = generateIds();

      const results = await Promise.all(
        ids.map(id => getPokemonDetails(id))
      );

      const correctPokemon = results[0];

      // Shuffle answer choices
      const shuffledChoices = [...results]
        .map(item => ({
          id: item.id,
          name: item.name,
        }))
        .sort(() => Math.random() - 0.5);

      setPokemon(correctPokemon);
      setChoices(shuffledChoices);
    } catch (err) {
      setError(err.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  // Load first round
  useEffect(() => {
    startNewRound();
  }, []);

  // Check answer and update scoreboard
  const handleAnswer = (id) => {
    if (selectedAnswer !== null || !pokemon || loading) {
      return;
    }

    setSelectedAnswer(id);
    setTotalRounds(previous => previous + 1);

    if (id === pokemon.id) {
      setScore(previous => previous + 1);

      const newStreak = streak + 1;

      setStreak(newStreak);

      setBestStreak(previous =>
        Math.max(previous, newStreak)
      );
    } else {
      setStreak(0);
    }
  };

  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === pokemon?.id;

  // Pokémon artwork
  const imageUrl =
    pokemon?.sprites?.other?.['official-artwork']
      ?.front_default ||
    pokemon?.sprites?.front_default;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Who's That Pokémon?
      </Text>

      <Text style={styles.subtitle}>
        Guess the Pokémon from its silhouette!
      </Text>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreNumber}>
            {score}
          </Text>
          <Text style={styles.scoreLabel}>
            Score
          </Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreNumber}>
            {streak}
          </Text>
          <Text style={styles.scoreLabel}>
            Streak
          </Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreNumber}>
            {bestStreak}
          </Text>
          <Text style={styles.scoreLabel}>
            Best
          </Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={styles.scoreNumber}>
            {totalRounds}
          </Text>
          <Text style={styles.scoreLabel}>
            Rounds
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#e63946"
          />

          <Text style={styles.message}>
            Loading mystery Pokémon...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={startNewRound}
          >
            <Text style={styles.nextButtonText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : pokemon ? (
        <>
          {/* Mystery Pokémon card */}
          <View style={styles.gameCard}>
            <Text style={styles.question}>
              {answered
                ? capitalize(pokemon.name)
                : 'Who is this Pokémon?'}
            </Text>

            <Image
              source={{ uri: imageUrl }}
              style={[
                styles.pokemonImage,
                !answered && styles.silhouette,
              ]}
              resizeMode="contain"
            />

            <Text style={styles.hint}>
              {answered
                ? `Pokémon #${String(pokemon.id).padStart(3, '0')}`
                : 'Choose the correct name below'}
            </Text>
          </View>

          {/* Four answer choices */}
          <View style={styles.choicesContainer}>
            {choices.map(choice => {
              const correctChoice =
                answered && choice.id === pokemon.id;

              const wrongChoice =
                answered &&
                choice.id === selectedAnswer &&
                !isCorrect;

              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceButton,
                    correctChoice && styles.correctChoice,
                    wrongChoice && styles.wrongChoice,
                  ]}
                  disabled={answered}
                  onPress={() => handleAnswer(choice.id)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      (correctChoice || wrongChoice) &&
                        styles.selectedChoiceText,
                    ]}
                  >
                    {capitalize(choice.name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Answer result */}
          {answered && (
            <View style={styles.resultContainer}>
              <Text
                style={[
                  styles.resultText,
                  {
                    color: isCorrect
                      ? '#2e7d32'
                      : '#d62828',
                  },
                ]}
              >
                {isCorrect
                  ? 'Correct! Great job!'
                  : `Incorrect! It was ${capitalize(pokemon.name)}.`}
              </Text>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={startNewRound}
              >
                <Text style={styles.nextButtonText}>
                  Next Pokémon
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : null}
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

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#e63946',
    textAlign: 'center',
    marginTop: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },

  // Scoreboard styles
  scoreboard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 20,
    elevation: 2,
  },

  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },

  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e63946',
  },

  scoreLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },

  message: {
    marginTop: 12,
    color: '#777',
  },

  errorText: {
    color: '#d62828',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 15,
  },

  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },

  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  pokemonImage: {
    width: 220,
    height: 220,
  },

  silhouette: {
    tintColor: '#111',
  },

  hint: {
    fontSize: 14,
    color: '#777',
    marginTop: 12,
  },

  choicesContainer: {
    marginTop: 22,
    gap: 12,
  },

  choiceButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  choiceText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },

  correctChoice: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },

  wrongChoice: {
    backgroundColor: '#d62828',
    borderColor: '#d62828',
  },

  selectedChoiceText: {
    color: '#fff',
  },

  resultContainer: {
    alignItems: 'center',
    marginTop: 22,
  },

  resultText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },

  nextButton: {
    backgroundColor: '#e63946',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
