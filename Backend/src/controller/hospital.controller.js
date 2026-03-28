// hospital.controller.js
import axios from 'axios';

export const getAllRegionHospitals = async (req, res) => {
    try {
        const bbox = "20.0,85.4,20.4,85.9";
        const osmQuery = `
            [out:json];
            (
              node["amenity"="hospital"](${bbox});
              way["amenity"="hospital"](${bbox});
              relation["amenity"="hospital"](${bbox});
            );
            out center;
        `;

        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`);
        
        if (!response.data || !response.data.elements) {
            console.error('❌ Overpass API returned invalid data:', response.data);
            return res.status(500).json({ success: false, error: "Invalid data from Overpass API" });
        }

        const hospitals = formatOSMData(response.data.elements);
        console.log(`Fetched ${hospitals.length} hospitals in the region`);
        res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        console.error('❌ Error in getAllRegionHospitals:', error);
        if (error.response) {
            console.error('   Response data:', error.response.data);
            console.error('   Response status:', error.response.status);
        }
        res.status(500).json({ success: false, error: "Failed to fetch region hospitals" });
    }
};

export const getNearbyRadiusHospitals = async (req, res) => {
    try {
        const { lat, lon, radius = 10000 } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: "Lat and Lon required" });

        const osmQuery = `
            [out:json];
            (
              node["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
              way["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
              relation["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
            );
            out center;
        `;

        console.log(`Searching nearby hospitals: lat=${lat}, lon=${lon}, radius=${radius}`);

        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`);
        
        if (!response.data || !response.data.elements) {
            console.error('❌ Overpass API returned invalid data for nearby search:', response.data);
            return res.status(500).json({ success: false, error: "Invalid data from Overpass API" });
        }

        const hospitals = formatOSMData(response.data.elements);
        res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        console.error('❌ Error in getNearbyRadiusHospitals:', error);
        if (error.response) {
            console.error('   Response data:', error.response.data);
            console.error('   Response status:', error.response.status);
        }
        res.status(500).json({ success: false, error: "Nearby search failed" });
    }
};

const formatOSMData = (elements) => {
    return elements.map(h => ({
        id: h.id,
        name: h.tags?.name || "Medical Center",
        address: h.tags?.["addr:full"] || h.tags?.["addr:street"] || "Location unavailable",
        phone: h.tags?.phone || h.tags?.["contact:phone"] || "N/A",
        lat: h.lat || h.center?.lat,
        lon: h.lon || h.center?.lon,
    }));
};