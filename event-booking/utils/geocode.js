const axios = require('axios');

/**
 * Convert an address or location string into latitude and longitude
 * Uses the free OpenStreetMap Nominatim API
 * @param {string} locationString - e.g., "Chennai", "New York", "1600 Amphitheatre Parkway"
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
const geocodeAddress = async (locationString) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: locationString,
                format: 'json',
                limit: 1
            },
            headers: {
                // Nominatim requires a user-agent
                'User-Agent': 'EventBookingApp/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
            };
        }

        throw new Error('Location not found');
    } catch (error) {
        throw new Error(`Geocoding failed: ${error.message}`);
    }
};

module.exports = { geocodeAddress };
