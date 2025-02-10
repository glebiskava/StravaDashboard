import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StravaService } from '../../services/strava.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  activities: any[] = [];
  maps: any;

  constructor(private stravaService: StravaService) { }

  ngOnInit(): void {
    this.loadActivities();
  }

  ngAfterViewInit(): void {
    // Wait for API key and activities to load
    this.stravaService.apiKeyLoaded.subscribe((isLoaded) => {
      if (isLoaded) {
        setTimeout(() => {
          this.activities.forEach((activity) => {
            if (activity.polylineDecoded.length > 0) {
              this.renderMap(activity.id, activity.polylineDecoded);
            }
          });
        }, 500);
      } else {
        console.error('Thunderforest API key is not loaded yet.');
      }
    });
  }  

  loadActivities(): void {
    this.stravaService.getLocalActivities().subscribe((data) => {
      this.activities = data.map((activity: any[]) => ({
        id: activity[0],
        name: activity[1],
        distance: activity[2],
        moving_time: activity[3],
        elevation_gain: activity[14],
        polyline: activity[20],
        polylineDecoded: this.decodePolyline(activity[20] || '') // Decode polyline
      }));
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h${remainingMinutes.toString().padStart(2, '0')}min` : `${minutes}min`;
  }

  fetchNewActivities(): void {
    this.stravaService.getActivities().subscribe(() => {
      this.loadActivities();
    });
  }

  renderMap(activityId: number, polylineDecoded: any[]): void {
    const mapId = `map-${activityId}`;
    const mapContainer = document.getElementById(mapId);
  
    if (!mapContainer) {
      console.error(`Map container not found for ${mapId}`);
      return;
    }
  
    if (this.maps[activityId]) {
      this.maps[activityId].remove(); // Destroy old map instance
    }
  
    const map = L.map(mapId).setView(polylineDecoded[0], 13);
    this.maps[activityId] = map; // Store reference to the map instance
  
    L.tileLayer(
      `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${this.stravaService.thunderforestApiKey}`,
      { attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a> contributors' }
    ).addTo(map);
  
    L.polyline(polylineDecoded, { color: 'blue', weight: 4 }).addTo(map);
    map.fitBounds(L.polyline(polylineDecoded).getBounds(), { padding: [20, 20] });
  
    setTimeout(() => {
      map.invalidateSize(); // Forces Leaflet to properly resize the map
    }, 500);
  }  

  decodePolyline(encoded: string): L.LatLngLiteral[] {
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
