import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideAnimations(), importProvidersFrom()],
}).catch(err => console.error(err));

async function loadGoogleMapsApi(): Promise<void> {
  try {
    const response = await fetch('http://localhost:5000/api/google-maps-key');
    const data = await response.json();

    if (!data.apiKey) {
      throw new Error('Google Maps API key not found');
    }

    return new Promise<void>((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API loaded successfully");
        resolve();
      };
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error("Failed to load Google Maps API:", error);
  }
}

loadGoogleMapsApi();
