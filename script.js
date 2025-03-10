let limit = 20;
let offset = 0;
const typeURL = "https://pokeapi.co/api/v2/type/?limit=21";
const pokemonURL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
const select = document.querySelector("select");
const pokemonDiv = document.querySelector("#pokemon");
const search = document.querySelector("#search");
const loadMore = document.querySelector("#loadmore");
const loadingDiv = document.querySelector("#loading");
const resetButton = document.querySelector("#reset");

let types;
let pokemons;
let finalData = [];

getTypes();
getPokemons(pokemonURL);

loadMore.addEventListener("click", () => {
  offset += limit;
  getPokemons(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
});

select.addEventListener("change", (e) => {
  if (!finalData.length) return; // Prevents filtering before data loads

  if (e.target.value === "all") {
    displayData(finalData);
    return;
  }
  const filteredData = finalData.filter((pokemon) =>
    pokemon.types.some((type) => type.type.name === e.target.value)
  );
  if(filteredData.length === 0){
    pokemonDiv.innerHTML = "<h2>No Pokémon found</h2>";
    return;
  }
  displayData(filteredData);
});

search.addEventListener("keyup", (e) => {
  if (!finalData.length) return; // Prevents searching before data loads

  if (e.target.value.trim().length === 0) {
    displayData(finalData);
    return;
  } else {
    const searchedPokemon = finalData.filter((obj) =>
      obj.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    if (searchedPokemon.length === 0) {
      pokemonDiv.innerHTML = "<h2>No Pokémon found</h2>";
    } else {
      displayData(searchedPokemon);
    }
  }
});

async function getPokemons(url) {
  loadingDiv.style.display = "block"; // Show loading before fetching data
  const response = await getDataFromURL(url);
  pokemons = response.results;

  const promises = pokemons.map((obj) => getDataFromURL(obj.url));
  const newData = await Promise.all(promises);

  finalData = [...finalData, ...newData]; // Append new data instead of replacing
  displayData(finalData);
}

function displayData(data) {
  loadingDiv.style.display = "block";
  pokemonDiv.innerHTML = "";

  const fragment = document.createDocumentFragment();
  data.forEach((obj) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    // Front Card
    const cardFront = document.createElement("div");
    cardFront.classList.add("card-front");

    const image = document.createElement("img");
    image.src = obj.sprites.other.dream_world.front_default;
    image.classList.add("image");
    const name = document.createElement("h2");
    name.innerText = obj.name;

    const type = document.createElement("p");
    const types = obj.types.map((t) => t.type.name).join(", ");
    type.innerHTML = `<strong>Type:</strong> ${types}`;

    cardFront.append(image, name, type);

    // Back Card
    const cardBack = document.createElement("div");
    cardBack.classList.add("card-back");
    console.log(obj);

    const ability = document.createElement("p");
    const height = document.createElement("p");
    const weight = document.createElement("p");

    const abilities = obj.abilities.map((a) => a.ability.name).join(", ");
    ability.innerHTML = `<strong>Abilities:</strong> <span>${abilities}</span>`;

    height.innerHTML = `<strong>height:</strong> ${obj.height}`;

    weight.innerHTML = `<strong>Weight:</strong> ${obj.weight}`;

    cardBack.append(ability, height, weight);

    cardInner.append(cardFront, cardBack);
    card.append(cardInner);
    fragment.append(card);
  });

  loadingDiv.style.display = "none";
  pokemonDiv.append(fragment);
}

async function getTypes() {
  types = await getDataFromURL(typeURL);
  creatOptions(types.results);
}

function creatOptions(types) {
  const fragment = document.createDocumentFragment();
  types.forEach((obj) => {
    const option = document.createElement("option");
    option.value = obj.name;
    option.innerText = obj.name;
    fragment.append(option);
  });

  select.append(fragment);
}

async function getDataFromURL(url) {
  const response = await fetch(url);
  return response.json();
}

resetButton.addEventListener("click", () => {
    search.value = "";  // Clear search input
    select.value = "";  // Reset dropdown
    displayData(finalData);  // Show all Pokémon
});
