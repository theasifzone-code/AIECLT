// src/controllers/routeController.js - ✅ OSRM (Free - No Key)
const axios = require('axios');
const ExamCenter = require('../models/ExamCenter');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');

// ==================== HELPER FUNCTIONS ====================

const EARTH_RADIUS_KM = 6371;

const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const calculateDistance = (lat1, lng1, lat2, lng2, unit = 'km') => {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = unit === 'miles' ? 3959 : EARTH_RADIUS_KM;
  return radius * c;
};

const getRouteOSRM = async (originLat, originLng, destLat, destLng) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
  const response = await axios.get(url, { timeout: 10000 });
  if (response.data.code !== 'Ok') {
    throw new Error('OSRM route not found');
  }
  const route = response.data.routes[0];
  return {
    distance: (route.distance / 1000).toFixed(2), // km
    duration: (route.duration / 60).toFixed(0), // minutes
    distanceInMeters: route.distance,
    durationInSeconds: route.duration,
    steps: [],
    polyline: route.geometry.coordinates,
    isFallback: false,
  };
};

// ==================== CONTROLLERS ====================

const getRoute = catchAsync(async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.body;

  if (!isValidCoordinates(originLat, originLng) || !isValidCoordinates(destLat, destLng)) {
    throw new AppError('Invalid coordinates provided', 400);
  }

  try {
    const route = await getRouteOSRM(originLat, originLng, destLat, destLng);
    logger.info(`Route fetched: ${originLat},${originLng} -> ${destLat},${destLng}`);
    res.status(200).json({
      success: true,
      route,
    });
  } catch (error) {
    logger.error('Route fetch error:', error);
    // Fallback: Calculate straight-line distance
    const distance = calculateDistance(originLat, originLng, destLat, destLng);
    const estimatedDuration = distance * 2;
    res.status(200).json({
      success: true,
      route: {
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.round(estimatedDuration)} min`,
        distanceInMeters: Math.round(distance * 1000),
        durationInSeconds: Math.round(estimatedDuration * 60),
        steps: [],
        polyline: null,
        isFallback: true,
      },
    });
  }
});

const getETA = catchAsync(async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.body;
  if (!isValidCoordinates(originLat, originLng) || !isValidCoordinates(destLat, destLng)) {
    throw new AppError('Invalid coordinates provided', 400);
  }
  try {
    const route = await getRouteOSRM(originLat, originLng, destLat, destLng);
    res.status(200).json({
      success: true,
      distance: route.distance,
      duration: route.duration,
    });
  } catch (error) {
    const distance = calculateDistance(originLat, originLng, destLat, destLng);
    const estimatedDuration = distance * 2;
    res.status(200).json({
      success: true,
      distance: `${distance.toFixed(1)} km`,
      duration: `${Math.round(estimatedDuration)} min`,
    });
  }
});

const getNearbyCenters = catchAsync(async (req, res) => {
  const { lat, lng, radius = 10, limit = 20 } = req.body;
  if (!isValidCoordinates(lat, lng)) {
    throw new AppError('Invalid coordinates provided', 400);
  }
  const centers = await ExamCenter.find({ isActive: true, latitude: { $exists: true }, longitude: { $exists: true } })
    .select('centerCode name address city latitude longitude capacity contactNumber')
    .lean();
  const centersWithDistance = centers
    .map((center) => {
      const distance = calculateDistance(lat, lng, center.latitude, center.longitude);
      return { ...center, distance: distance.toFixed(1), distanceFormatted: `${distance.toFixed(1)} km` };
    })
    .filter((center) => center.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  res.status(200).json({
    success: true,
    count: centersWithDistance.length,
    centers: centersWithDistance,
  });
});

const geocodeAddress = catchAsync(async (req, res) => {
  const { address } = req.body;
  if (!address || address.trim().length < 3) {
    throw new AppError('Please provide a valid address', 400);
  }
  try {
    // Nominatim (Free) Geocoding API
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await axios.get(url, { timeout: 8000 });
    if (!response.data || response.data.length === 0) {
      throw new AppError('Address not found', 404);
    }
    const result = response.data[0];
    res.status(200).json({
      success: true,
      location: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      formattedAddress: result.display_name,
    });
  } catch (error) {
    throw new AppError('Failed to geocode address. Please try again later.', 500);
  }
});

// ==================== EXPORT ====================
module.exports = {
  getRoute,
  getETA,
  getNearbyCenters,
  geocodeAddress,
};