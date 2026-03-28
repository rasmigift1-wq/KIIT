export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

export const calculateTotalDistance = (route) => {
  if (!route || route.length < 2) return 0;
  
  let totalDistance = 0;
  
  for (let i = 0; i < route.length - 1; i++) {
    const current = route[i];
    const next = route[i + 1];
    
    totalDistance += getDistance(
      current.lat, 
      current.lng, 
      next.lat, 
      next.lng
    );
  }
  
  return Math.round(totalDistance * 100) / 100;
};

export const calculateCarbonEmissions = (distanceKm, emissionFactor = 0.12) => {
  return Math.round(distanceKm * emissionFactor * 100) / 100;
};

export const calculateEfficiencyGain = (optimizedDistance, naiveDistance) => {
  if (naiveDistance === 0) return "0%";
  
  const savings = ((naiveDistance - optimizedDistance) / naiveDistance) * 100;
  return `${Math.round(savings)}%`;
};


export const calculateGetter = async()=>{
    if (naiveDistance === 0) return "0%";
  
  const savings = ((naiveDistance - optimizedDistance) / naiveDistance) * 100;
  return `${Math.round(savings)}%`;
}




const toRadians143 = (degrees) => {
  return degrees * (Math.PI / 180);
};