import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StravaService } from '../../services/strava.service';
import * as L from 'leaflet';
import { Subscription, combineLatest, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent implements OnInit, AfterViewInit, OnDestroy {
  activities: any[] = [];
  maps: Record<number, L.Map> = {};
  private subscriptions: Subscription = new Subscription();

  constructor(private stravaService: StravaService) { }

  ngOnInit(): void {
    this.loadActivities();
  }

  ngAfterViewInit(): void {
    const apiKeySub = this.stravaService.waitForApiKey()
      .pipe(
        switchMap(isLoaded => {
          if (isLoaded && this.activities.length > 0) {
            return of(true);
          }
          return of(false);
        })
      )
      .subscribe(canRenderMaps => {
        if (canRenderMaps) {
          this.renderAllMaps();
        } else {
          console.warn('API key not loaded yet, will render maps when available');
        }
      });

    this.subscriptions.add(apiKeySub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    Object.values(this.maps).forEach(map => {
      if (map) {
        map.remove();
      }
    });
  }

  loadActivities(): void {
    const activitySub = this.stravaService.getLocalActivities().subscribe({
      next: (data) => {
        this.activities = data.map((activity: any[]) => ({
          id: activity[0],
          name: activity[1],
          distance: activity[2],
          moving_time: activity[3],
          elevation_gain: activity[14],
          polyline: activity[20],
          polylineDecoded: this.decodePolyline(activity[20] || '')
        }));

        if (this.stravaService.thunderforestApiKey && this.activities.length > 0) {
          setTimeout(() => this.renderAllMaps(), 100);
        }
      },
      error: (err) => console.error('Error loading activities:', err)
    });

    this.subscriptions.add(activitySub);
  }

  renderAllMaps(): void {
    this.activities.forEach((activity) => {
      if (activity.polylineDecoded && activity.polylineDecoded.length > 0) {
        this.renderMap(activity.id, activity.polylineDecoded);
      }
    });
  }

  renderMap(activityId: number, polylineDecoded: any[]): void {
    const mapId = `map-${activityId}`;

    if (!polylineDecoded || polylineDecoded.length === 0) {
      console.warn(`Skipping map render for activity ${activityId} due to empty polyline.`);
      return;
    }

    if (!this.stravaService.thunderforestApiKey) {
      console.error("Cannot render map: Thunderforest API key not loaded.");
      return;
    }

    // Ensure the container exists before initializing Leaflet
    const checkContainer = setInterval(() => {
      const mapContainer = document.getElementById(mapId);
      if (mapContainer) {
        clearInterval(checkContainer);
        this.initializeMap(activityId, mapId, polylineDecoded);
      }
    }, 300);
  }


  initializeMap(activityId: number, mapId: string, polylineDecoded: any[]): void {
    if (!this.stravaService.thunderforestApiKey) {
      console.error("Cannot render map: Thunderforest API key not loaded.");
      return;
    }
  
    if (this.maps[activityId]) {
      this.maps[activityId].remove();
    }
  
    try {
      const map = L.map(mapId).setView(polylineDecoded[0], 13);
      this.maps[activityId] = map;
  
      console.log(`Loading tile layer: https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${this.stravaService.thunderforestApiKey}`);
  
      L.tileLayer(
        `https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${this.stravaService.thunderforestApiKey}`,
        {
          attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a> contributors',
          crossOrigin: true // Ensures CORS compatibility
        }
      ).addTo(map);
  
      if (polylineDecoded.length > 1) {
        const polyline = L.polyline(polylineDecoded, { color: 'blue', weight: 4 }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
      }
  
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    } catch (err) {
      console.error(`Error rendering map for activity ${activityId}:`, err);
    }
  }
  

  decodePolyline(encoded: string): L.LatLngLiteral[] {
    if (!encoded || encoded.length === 0) {
      console.warn("Empty or invalid polyline received.");
      return [];
    }

    let points: L.LatLngLiteral[] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += (result & 1 ? ~(result >> 1) : result >> 1);

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result & 1 ? ~(result >> 1) : result >> 1);

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
  }
}
