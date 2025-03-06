import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private googleMapsPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.googleMapsPromise) {
      return this.googleMapsPromise; // Return existing promise if already loading
    }

    this.googleMapsPromise = new Promise<void>((resolve, reject) => {
      if (window.google && window.google.maps) {
        console.log("Google Maps API already loaded.");
        resolve();
        return;
      }

      fetch('http://localhost:5000/api/google-maps-key') // Load API key from backend
        .then(response => response.json())
        .then(data => {
          if (!data.apiKey) {
            throw new Error("Google Maps API key not found");
          }

          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log("Google Maps API loaded successfully.");
            resolve();
          };
          script.onerror = (error) => reject(error);
          document.head.appendChild(script);
        })
        .catch(error => {
          console.error("Failed to fetch Google Maps API key:", error);
          reject(error);
        });
    });

    return this.googleMapsPromise;
  }
}
