export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    // Try multiple approaches for better success rate
    const attempts = [
      // Fast attempt with cached location
      {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 300000 // 5 minutes cache
      },
      // Medium accuracy attempt
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000 // 1 minute cache
      },
      // High accuracy attempt (last resort)
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0 // No cache
      }
    ];

    let attemptIndex = 0;

    const tryGetLocation = () => {
      const options = attempts[attemptIndex];
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!position.coords) {
            reject(new Error('Unable to get coordinates from geolocation.'));
            return;
          }
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error(`Geolocation attempt ${attemptIndex + 1} failed:`, err);
          
          if (attemptIndex < attempts.length - 1) {
            // Try next approach
            attemptIndex++;
            tryGetLocation();
          } else {
            // All attempts failed
            if (err.code === 1) {
              reject(new Error('Location access denied. Please allow location access in your browser settings.'));
            } else if (err.code === 2) {
              reject(new Error('Location unavailable. Please check your GPS or network connection.'));
            } else if (err.code === 3) {
              reject(new Error('Location request timed out after multiple attempts. Using default location for demo.'));
            } else {
              reject(new Error('Unable to get your location: ' + err.message));
            }
          }
        },
        options
      );
    };

    tryGetLocation();
  });
}
