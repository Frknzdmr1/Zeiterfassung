import { useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface GeolocationHook {
  getLocation: () => Promise<Location>;
  isLoading: boolean;
  error: string | null;
}

export default function useGeolocation(): GeolocationHook {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        const errorMsg = "Geolokalisierung wird von Ihrem Browser nicht unterstützt.";
        setError(errorMsg);
        setIsLoading(false);
        reject(new Error(errorMsg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          let errorMsg: string;
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = "Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff auf Ihren Standort.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = "Standortinformationen sind derzeit nicht verfügbar.";
              break;
            case err.TIMEOUT:
              errorMsg = "Die Anfrage nach Ihrem Standort ist abgelaufen.";
              break;
            default:
              errorMsg = "Ein unbekannter Fehler ist aufgetreten.";
          }
          
          setError(errorMsg);
          setIsLoading(false);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return { getLocation, isLoading, error };
}
