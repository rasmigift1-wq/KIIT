import Dustbin from '../models/dustbin.model.js';

import { getDistance, calculateTotalDistance, calculateCarbonEmissions, calculateEfficiencyGain } from '../utils/distance.js';



/**

 * Enhanced Traveling Salesman Algorithm for Realistic Road Navigation

 * Creates actual road-like paths between dustbins with optimal sequencing

 * Minimizes total travel distance, fuel consumption, and carbon footprint

 */

const getOptimizedCollectionRoute = (startLat, startLng, dustbins) => {

  // Filter and prioritize: Full > Mid > Skip Empty

  const eligibleDustbins = dustbins.filter(bin =>

    bin.status === 'full' || bin.status === 'mid'

  );



  if (eligibleDustbins.length === 0) {

    return [];

  }



  // Sort by priority: Full first, then by distance from current location

  const prioritizedDustbins = eligibleDustbins.sort((a, b) => {

    // Full dustbins have higher priority than mid

    if (a.status === 'full' && b.status !== 'full') return -1;

    if (b.status === 'full' && a.status !== 'full') return 1;



    // If both have same status, sort by distance from start

    const distA = getDistance(startLat, startLng, a.lat, a.lng);

    const distB = getDistance(startLat, startLng, b.lat, b.lng);

    return distA - distB;

  });



  // Apply enhanced nearest neighbor algorithm for realistic road navigation

  return enhancedNearestNeighborAlgorithm(startLat, startLng, prioritizedDustbins);

};



/**

 * Enhanced Nearest Neighbor Algorithm for Realistic Road Navigation

 * Creates sequential path visiting each dustbin in optimal order

 * Simulates actual road travel patterns (not straight lines)

 */

const enhancedNearestNeighborAlgorithm = (startLat, startLng, dustbins) => {

  if (dustbins.length === 0) return [];



  const route = [];

  const remainingDustbins = [...dustbins];

  let currentLat = startLat;

  let currentLng = startLng;



  // Visit each dustbin in optimal sequence

  while (remainingDustbins.length > 0) {

    // Find the nearest dustbin from current position

    let nearestIndex = 0;

    let nearestDistance = Infinity;



    for (let i = 0; i < remainingDustbins.length; i++) {

      const dustbin = remainingDustbins[i];

      const distance = getDistance(currentLat, currentLng, dustbin.lat, dustbin.lng);



      // Consider priority factor: full dustbins get priority bonus

      const priorityBonus = dustbin.status === 'full' ? 0.5 : 0;

      const adjustedDistance = distance - priorityBonus;



      if (adjustedDistance < nearestDistance) {

        nearestDistance = adjustedDistance;

        nearestIndex = i;

      }

    }



    // Add the nearest dustbin to route

    const nextDustbin = remainingDustbins.splice(nearestIndex, 1)[0];

    route.push(nextDustbin);



    // Update current position to this dustbin

    currentLat = nextDustbin.lat;

    currentLng = nextDustbin.lng;

  }



  return route;

};



/**

 * Generate intermediate waypoints for realistic road visualization

 * Creates curved paths that simulate actual road travel

 */

const generateRoadWaypoints = (startLat, startLng, route) => {

  if (route.length === 0) return [];



  const waypoints = [];

  let prevLat = startLat;

  let prevLng = startLng;



  // Add starting point

  waypoints.push({ lat: startLat, lng: startLng });



  // Add waypoints for each dustbin with realistic road curves

  for (const dustbin of route) {

    // Add intermediate waypoints to simulate road curves

    const intermediatePoints = generateIntermediateWaypoints(prevLat, prevLng, dustbin.lat, dustbin.lng);

    waypoints.push(...intermediatePoints);



    // Add the actual dustbin location

    waypoints.push({ lat: dustbin.lat, lng: dustbin.lng });



    prevLat = dustbin.lat;

    prevLng = dustbin.lng;

  }



  return waypoints;

};



/**

 * Generate intermediate waypoints between two points

 * Simulates realistic road travel with gentle curves

 */

const generateIntermediateWaypoints = (lat1, lng1, lat2, lng2, numPoints = 3) => {

  const waypoints = [];



  for (let i = 1; i <= numPoints; i++) {

    const fraction = i / (numPoints + 1);



    // Add slight curve to simulate road bends

    const curveOffset = Math.sin(fraction * Math.PI) * 0.002;

    const latOffset = (lat2 - lat1) * fraction + curveOffset;

    const lngOffset = (lng2 - lng1) * fraction + curveOffset;



    waypoints.push({

      lat: lat1 + latOffset,

      lng: lng1 + lngOffset

    });

  }



  return waypoints;

};



/**

 * Get optimized route for garbage truck

 * Implements enhanced algorithm for carbon footprint minimization

 */

export const



  getOptimizedRoute = async (req, res) => {

    try {

      console.log('\n🚛 [POST /api/routes/optimize] Calculating optimized collection route...');

      const { lat, lng } = req.body;



      // Validate input coordinates

      if (!lat || !lng) {

        return res.status(400).json({

          status: 'error',

          message: 'Starting latitude and longitude are required'

        });

      }



      const startLat = parseFloat(lat);

      const startLng = parseFloat(lng);



      console.log('📍 Starting location:', { lat: startLat, lng: startLng });



      // Fetch all dustbins

      // Fetch all dustbins that are not rejected (verified or pending)
      const allDustbins = await Dustbin.find({
        verificationStatus: { $ne: 'rejected' }
      }).sort({ createdAt: -1 });

      console.log(`📊 Total dustbins found: ${allDustbins.length}`);



      // Enhanced route calculation

      const optimizedRoute = getOptimizedCollectionRoute(startLat, startLng, allDustbins);

      const emptyDustbins = allDustbins.filter(bin => bin.status === 'empty');

      const eligibleDustbins = allDustbins.filter(bin =>

        bin.status === 'full' || bin.status === 'mid'

      );



      console.log(`🎯 Route optimization complete:`);

      console.log(`   📏 Total dustbins: ${allDustbins.length}`);

      console.log(`   🔴 Full dustbins: ${allDustbins.filter(b => b.status === 'full').length}`);

      console.log(`   🟡 Mid-level dustbins: ${allDustbins.filter(b => b.status === 'mid').length}`);

      console.log(`   🟢 Empty dustbins (skipped): ${emptyDustbins.length}`);

      console.log(`   📍 Collection route stops: ${optimizedRoute.length}`);



      if (optimizedRoute.length === 0) {

        return res.status(200).json({

          status: 'success',

          route: [],

          impact: {

            distanceKm: 0,

            carbonSavedKg: 0,

            efficiencyGain: "0%",

            binsSkipped: emptyDustbins.length,

            eligibleBins: eligibleDustbins.length,

            totalBins: allDustbins.length,

            message: "No dustbins need collection (all are empty or no eligible dustbins)"

          }

        });

      }



      // Calculate total route distance

      const routeWithStart = [

        { lat: startLat, lng: startLng },

        ...optimizedRoute

      ];

      const optimizedDistance = calculateTotalDistance(routeWithStart);



      // Calculate naive distance (visiting all eligible bins in order of creation)

      const naiveRoute = [

        { lat: startLat, lng: startLng },

        ...eligibleDustbins

      ];

      const naiveDistance = calculateTotalDistance(naiveRoute);



      // Calculate sustainability metrics

      const carbonSaved = calculateCarbonEmissions(naiveDistance - optimizedDistance);

      const efficiencyGain = calculateEfficiencyGain(optimizedDistance, naiveDistance);



      console.log(`   📏 Optimized distance: ${optimizedDistance} km`);

      console.log(`   📏 Naive distance: ${naiveDistance} km`);

      console.log(`   🌱 Carbon saved: ${carbonSaved} kg CO2`);

      console.log(`   ⚡ Efficiency gain: ${efficiencyGain}`);



      // Generate realistic road waypoints for visualization

      const roadWaypoints = generateRoadWaypoints(startLat, startLng, optimizedRoute);



      console.log(`   🛣️ Generated ${roadWaypoints.length} waypoints for realistic road visualization`);



      // Prepare response with enhanced dustbin data and road waypoints

      const routeResponse = optimizedRoute.map((bin, index) => ({

        _id: bin._id,

        name: bin.name,

        lat: bin.lat,

        lng: bin.lng,

        status: bin.status,

        reportedBy: bin.reportedBy,

        imageUrl: bin.imageUrl,

        createdAt: bin.createdAt,

        // Enhanced color coding for better visualization

        color: bin.status === 'full' ? '#dc2626' :

          bin.status === 'mid' ? '#f59e0b' : '#22c55e',

        priority: bin.status === 'full' ? 'HIGH' :

          bin.status === 'mid' ? 'MEDIUM' : 'LOW',

        stopNumber: index + 1

      }));



      res.status(200).json({

        status: 'success',

        route: routeResponse,

        waypoints: roadWaypoints, // Add realistic road waypoints

        impact: {

          distanceKm: optimizedDistance,

          carbonSavedKg: carbonSaved,

          efficiencyGain: efficiencyGain,

          binsSkipped: emptyDustbins.length,

          naiveDistanceKm: naiveDistance,

          eligibleBins: eligibleDustbins.length,

          totalBins: allDustbins.length,

          fullBins: allDustbins.filter(b => b.status === 'full').length,

          midBins: allDustbins.filter(b => b.status === 'mid').length,

          emptyBins: emptyDustbins.length

        }

      });



    } catch (error) {

      console.error('❌ Error in getOptimizedRoute:', error.message);

      res.status(500).json({

        status: 'error',

        message: 'Failed to calculate optimized route'

      });

    }

  };



/**

 * Nearest Neighbor Algorithm implementation

 * @param {number} startLat - Starting latitude

 * @param {number} startLng - Starting longitude

 * @param {Array} dustbins - Array of dustbin objects

 * @returns {Array} Ordered array of dustbins for optimal route

 */

const nearestNeighborAlgorithm = (startLat, startLng, dustbins) => {

  if (dustbins.length === 0) return [];



  const route = [];

  const unvisited = [...dustbins];

  let currentLat = startLat;

  let currentLng = startLng;



  while (unvisited.length > 0) {

    // Find nearest unvisited dustbin

    let nearestIndex = 0;

    let minDistance = Infinity;



    for (let i = 0; i < unvisited.length; i++) {

      const distance = getDistance(

        currentLat,

        currentLng,

        unvisited[i].lat,

        unvisited[i].lng

      );



      if (distance < minDistance) {

        minDistance = distance;

        nearestIndex = i;

      }

    }



    // Add nearest dustbin to route and remove from unvisited

    const nearestDustbin = unvisited.splice(nearestIndex, 1)[0];

    route.push(nearestDustbin);



    // Update current position

    currentLat = nearestDustbin.lat;

    currentLng = nearestDustbin.lng;

  }



  return route;

};

