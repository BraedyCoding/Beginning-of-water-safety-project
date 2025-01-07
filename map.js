/*API KEY*/
const API_KEY = '3a5be4cbe954fd58a90766407e40036e';
const API_pixaBay_KEY = '46903041-e07cc1b045267ceaec4e999de';

// Create the map and set the initial view to a specific latitude and longitude (e.g., London)
var map = L.map('map').setView([51.505, -0.09], 13);  // Coordinates of London

// Add OpenStreetMap tile layer (no API key required)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initial marker for the default location
var marker = L.marker([51.505, -0.09]).addTo(map);



// Add event listener to the input field
const input = document.getElementById('input');
const submitButton = document.getElementById('submit');
const card = document.getElementById('card');

submitButton.addEventListener("click", async () => {
    const location = input.value.trim();
    if (!location) {
        console.error('Location cannot be empty');
        return;
    }
    await updateLocation(location);
});

async function updateLocation(location) {
    try {
        const { latitude, longitude } = await getCoordinates(location);
        // Ensure latitude and longitude are valid
        if (latitude && longitude) {
            // Update marker location
            marker.setLatLng([latitude, longitude]);
            map.setView([latitude, longitude], 13); // Recenter map to new location

            // Get the marine life data
            const response = await getMarineLifeData(latitude, longitude);
            // Display the marine life data
            displayMarineLifeData(response);
        } else {
            console.error('Invalid coordinates received.');
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}


async function getCoordinates(city) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.length > 0) {
            return { latitude: data[0].lat, longitude: data[0].lon };
        } else {
            throw new Error('City not found in the OpenWeatherMap database');
        }
    } catch (error) {
        throw new Error('Failed to fetch data from the API: ' + error.message);
    }
}

async function getMarineLifeData(latitude, longitude) {
  const radius = 100; // 100 km radius
  const url = `https://api.inaturalist.org/v1/observations?lat=${latitude}&lng=${longitude}&radius=${radius}&taxon_id=47178`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to fetch marine life data");
  return response.json(); //return as javascript object
}

function displayMarineLifeData(marineLifeData) {
  card.textContent = ''; // Clear previous data
  if (marineLifeData.results && Array.isArray(marineLifeData.results)) {
    const seenSpecies = new Set();
    const uniqueSpecies = [];

    marineLifeData.results.forEach((item) => {
      const species = item.species_guess || "Unknown";
      if (!seenSpecies.has(species)) {
        seenSpecies.add(species);
        uniqueSpecies.push(species);
      }
    });

    if (uniqueSpecies.length === 0) {
      const noResultMessage = document.createElement('p');
      noResultMessage.textContent = "No unique species found.";
      card.appendChild(noResultMessage)
    } else {
      card.style.display = 'block';
      uniqueSpecies.forEach(async(species) => {
        const marineLifeItem = document.createElement('div');
        const marineLifeName = document.createElement('h2');
        const marineLifeImage = document.createElement('img');
        const marineLifeDescription = document.createElement('p');

        marineLifeItem.classList.add('marineLifeItem');
        marineLifeName.classList.add('marineLifeName');
        marineLifeImage.classList.add('marineLifeImage');
        marineLifeDescription.classList.add('marineLifeDescription');

        marineLifeName.textContent = species;
        marineLifeImage.src = await getImageUrlForSpecies(species);
        //marineLifeDescription.textContent = `Description for ${species}`; // Optional description

        marineLifeItem.appendChild(marineLifeName);
        marineLifeItem.appendChild(marineLifeImage);
        marineLifeItem.appendChild(marineLifeDescription);
        card.appendChild(marineLifeItem);
      });
    }
  } else {
    console.log("No results found.");
  }
}


async function getImageUrlForSpecies(species) {
  const API_pixaBay_URL = 'https://pixabay.com/api/';
  const API_pixaBay_KEY = '46903041-e07cc1b045267ceaec4e999de';
  const url = `${API_pixaBay_URL}?key=${API_pixaBay_KEY}&q=${encodeURIComponent(species)}&image_type=photo&per_page=3`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    // Check if there are hits in the response
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].webformatURL; // Return the URL of the first image
    } else {
      return "https://via.placeholder.com/150"; // Fallback if no image is found
    }
  } catch (error) {
    console.error('Error fetching image:', error.message);
    return "https://via.placeholder.com/150"; // Fallback on error
  }
}

document.getElementById("butt").addEventListener("click", event => {
  window.history.back();
});



//So now after they select the location, we will want to update the wildlife information
