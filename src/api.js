const BASE_URL = 'https://pokeapi.co/api/v2';
export async function getPokemonList(offset = 0, limit = 20) {
  const response = await fetch(
    `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to load Pokémon');
  }

  return await response.json();
}

// Fetch one Pokémon's details
export async function getPokemonDetails(id) {
  const response = await fetch(`${BASE_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error('Failed to load Pokémon details');
  }

  return await response.json();
}

// Fetch all Pokémon names for searching
export async function getAllPokemonNames() {
  const response = await fetch(
    `${BASE_URL}/pokemon?limit=1025`
  );

  if (!response.ok) {
    throw new Error('Failed to load Pokémon names');
  }

  return await response.json();
}
