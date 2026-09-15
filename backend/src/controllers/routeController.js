const axios = require('axios');
const ExamCenter = require('../models/ExamCenter');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MILES = 3959;

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
  const radius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;
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
    distance: (route.distance / 1000).toFixed(2),
    duration: (route.duration / 60).toFixed(0),
    distanceInMeters: route.distance,
    durationInSeconds: route.duration,
    steps: [],
    polyline: route.geometry.coordinates,
    isFallback: false,
  };
};

const getRoute = catchAsync(async (req, res) => {
  const { originLat, originLng, destLat, destLng, unit = 'km' } = req.body;

  if (
    !isValidCoordinates(originLat, originLng) ||
    !isValidCoordinates(destLat, destLng)
  ) {
    throw new AppError('Invalid coordinates provided', 400);
  }

  try {
    const route = await getRouteOSRM(originLat, originLng, destLat, destLng);
    logger.info(`Route fetched: ${originLat},${originLng} -> ${destLat},${destLng}`);

    return res.status(200).json({
      success: true,
      route: {
        ...route,
        unit,
      },
    });
  } catch (error) {
    logger.error('Route fetch error:', error);
    const distance = calculateDistance(
      originLat,
      originLng,
      destLat,
      destLng,
      unit
    );
    const estimatedDuration = distance * 2;

    res.status(200).json({
      success: true,
      route: {
        distance: `${distance.toFixed(1)} ${unit}`,
        duration: `${Math.round(estimatedDuration)} min`,
        distanceInMeters: Math.round(distance * (unit === 'miles' ? 1609.34 : 1000)),
        durationInSeconds: Math.round(estimatedDuration * 60),
        steps: [],
        polyline: null,
        isFallback: true,
        unit,
      },
    });
  }
});


const getETA = catchAsync(async (req, res) => {
  const { originLat, originLng, destLat, destLng, unit = 'km' } = req.body;

  if (
    !isValidCoordinates(originLat, originLng) ||
    !isValidCoordinates(destLat, destLng)
  ) {
    throw new AppError('Invalid coordinates provided', 400);
  }

  try {
    const route = await getRouteOSRM(originLat, originLng, destLat, destLng);

    res.status(200).json({
      success: true,
      distance: route.distance,
      duration: route.duration,
      unit,
      isFallback: false,
    });
  } catch (error) {
    logger.error('ETA fetch error:', error);

    const distance = calculateDistance(
      originLat,
      originLng,
      destLat,
      destLng,
      unit
    );
    const estimatedDuration = distance * 2;

    res.status(200).json({
      success: true,
      distance: `${distance.toFixed(1)} ${unit}`,
      duration: `${Math.round(estimatedDuration)} min`,
      unit,
      isFallback: true,
    });
  }
});



const getNearbyCenters = catchAsync(async (req, res) => {
  const { lat, lng, radius = 10, limit = 20, unit = 'km' } = req.body;

  if (!isValidCoordinates(lat, lng)) {
    throw new AppError('Invalid coordinates provided', 400);
  }

  const centers = await ExamCenter.find({
    isActive: true,
    deletedAt: null,
    latitude: { $exists: true, $ne: null },
    longitude: { $exists: true, $ne: null },
  })
    .select(
      'centerCode name address city latitude longitude capacity totalStudents contactNumber isVerified'
    )
    .lean();

  const centersWithDistance = centers
    .map((center) => {
      const distance = calculateDistance(
        lat,
        lng,
        center.latitude,
        center.longitude,
        unit
      );
      return {
        ...center,
        distance: parseFloat(distance.toFixed(1)),
        distanceFormatted: `${distance.toFixed(1)} ${unit}`,
      };
    })
    .filter((center) => center.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, parseInt(limit));

  logger.info(`Nearby centers: ${centersWithDistance.length} found within ${radius} ${unit}`);

  res.status(200).json({
    success: true,
    count: centersWithDistance.length,
    radius,
    unit,
    centers: centersWithDistance,
  });
});



const geocodeAddress = catchAsync(async (req, res) => {
  const { address } = req.body;

  if (!address || address.trim().length < 3) {
    throw new AppError('Please provide a valid address', 400);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;

    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'AI-ECLT/1.0 (Exam Center Locator)',
      },
    });

    if (!response.data || response.data.length === 0) {
      throw new AppError('Address not found', 404);
    }

    const result = response.data[0];

    logger.info(`Geocoded: "${address}" → ${result.lat},${result.lon}`);

    res.status(200).json({
      success: true,
      location: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      formattedAddress: result.display_name,
      addressType: result.type || '',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Geocoding error:', error.message);
    throw new AppError('Failed to geocode address. Please try again later.', 500);
  }
});


const getRouteToCenter = catchAsync(async (req, res) => {
  const { originLat, originLng, centerId, unit = 'km' } = req.body;

  if (!isValidCoordinates(originLat, originLng)) {
    throw new AppError('Invalid origin coordinates', 400);
  }

  if (!centerId) {
    throw new AppError('Please provide a center ID', 400);
  }

  const center = await ExamCenter.findById(centerId).select(
    'centerCode name address city latitude longitude'
  );

  if (!center || center.deletedAt || !center.isActive) {
    throw new AppError('Center not found', 404);
  }

  if (!center.latitude || !center.longitude) {
    throw new AppError('Center location not available', 400);
  }

  try {
    const route = await getRouteOSRM(
      originLat,
      originLng,
      center.latitude,
      center.longitude
    );

    logger.info(`Route to center: ${center.centerCode}`);

    res.status(200).json({
      success: true,
      center: {
        _id: center._id,
        centerCode: center.centerCode,
        name: center.name,
        address: center.address,
        city: center.city,
      },
      route: { ...route, unit },
    });
  } catch (error) {
    logger.error('Route to center error:', error);

    const distance = calculateDistance(
      originLat,
      originLng,
      center.latitude,
      center.longitude,
      unit
    );
    const estimatedDuration = distance * 2;

    res.status(200).json({
      success: true,
      center: {
        _id: center._id,
        centerCode: center.centerCode,
        name: center.name,
        address: center.address,
        city: center.city,
      },
      route: {
        distance: `${distance.toFixed(1)} ${unit}`,
        duration: `${Math.round(estimatedDuration)} min`,
        distanceInMeters: Math.round(distance * (unit === 'miles' ? 1609.34 : 1000)),
        durationInSeconds: Math.round(estimatedDuration * 60),
        steps: [],
        polyline: null,
        isFallback: true,
        unit,
      },
    });
  }
});


const getMultiCenterRoute = catchAsync(async (req, res) => {
  const { originLat, originLng, centerIds = [], unit = 'km' } = req.body;

  if (!isValidCoordinates(originLat, originLng)) {
    throw new AppError('Invalid origin coordinates', 400);
  }

  if (!Array.isArray(centerIds) || centerIds.length === 0) {
    throw new AppError('Please provide at least one center ID', 400);
  }

  if (centerIds.length > 5) {
    throw new AppError('Maximum 5 centers allowed for multi-stop route', 400);
  }

  const centers = await ExamCenter.find({
    _id: { $in: centerIds },
    deletedAt: null,
    isActive: true,
  }).select('centerCode name address city latitude longitude');

  if (centers.length === 0) {
    throw new AppError('No valid centers found', 404);
  }

  const results = centers.map((center) => ({
    center: {
      _id: center._id,
      centerCode: center.centerCode,
      name: center.name,
      city: center.city,
    },
    distance: parseFloat(
      calculateDistance(originLat, originLng, center.latitude, center.longitude, unit).toFixed(1)
    ),
  }));

  results.sort((a, b) => a.distance - b.distance);

  res.status(200).json({
    success: true,
    origin: { lat: originLat, lng: originLng },
    unit,
    count: results.length,
    results,
  });
});


module.exports = {
  getRoute,
  getETA,
  getNearbyCenters,
  geocodeAddress,
  getRouteToCenter,
  getMultiCenterRoute,
};