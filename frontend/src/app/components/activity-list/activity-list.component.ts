// activity-list.component.ts
import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivityService } from '../../services/activity.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent implements OnInit {
  activities: any[] = [];
  selectedPolylines: { [id: number]: string } = {};

  @ViewChildren('mapContainer') mapContainers!: QueryList<ElementRef>;
  currentPage = 0;
  activitiesPerPage = 5;
  pagedActivities: any[] = [];

  constructor(private activityService: ActivityService, private googleMapsLoader: GoogleMapsLoaderService) {}

  ngOnInit() {
    this.fetchLocalActivities();
  }

  fetchLocalActivities() {
    this.activityService.getLocalActivities().subscribe({
      next: (data) => {
        console.log("Activities response:", data);
        this.activities = data;
        this.updatePagedActivities();

        this.googleMapsLoader.load().then(() => {
          this.pagedActivities.forEach(activity => {
            this.getActivityPolyline(activity.id);
          });
        });
      },
      error: (err) => {
        console.error('Error fetching activities:', err);
      }
    });
  }

  fetchLatestActivities() {
    this.activityService.getNewestActivities().subscribe({
      next: (data) => {
        console.log("Activities response:", data);
        this.activities = data;

        // ✅ Wait for Google Maps to load before rendering maps
        this.googleMapsLoader.load().then(() => {
          this.activities.forEach(activity => {
            this.getActivityPolyline(activity.id);
          });
        });
      },
      error: (err) => {
        console.error('Error fetching activities:', err);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.activitiesPerPage = event.pageSize;
    this.updatePagedActivities();

    this.googleMapsLoader.load().then(() => {
      this.pagedActivities.forEach(activity => {
        this.getActivityPolyline(activity.id);
      });
    });
  }

  updatePagedActivities() {
    const start = this.currentPage * this.activitiesPerPage;
    const end = start + this.activitiesPerPage;
    this.pagedActivities = this.activities.slice(start, end);
  }

  getActivityPolyline(activityId: number) {
    this.activityService.getActivityPolyline(activityId).subscribe({
      next: (data) => {
        if (data.polyline) {
          this.selectedPolylines[activityId] = data.polyline;
          this.renderMap(activityId);
        }
      },
      error: (err) => {
        console.error(`Error fetching polyline for activity ${activityId}:`, err);
      }
    });
  }

  async renderMap(activityId: number) {
    const polyline = this.selectedPolylines[activityId];
    if (!polyline || !window.google || !window.google.maps) return;

    const decodedPath = window.google.maps.geometry.encoding.decodePath(polyline);
    const mapElement = this.mapContainers.find(el => el.nativeElement.id === `map-${activityId}`);
    if (!mapElement) return;

    const map = new window.google.maps.Map(mapElement.nativeElement, {
      mapTypeId: window.google.maps.MapTypeId.TERRAIN
    });

    const bounds = new window.google.maps.LatLngBounds();
    decodedPath.forEach((point: any) => bounds.extend(point));
    map.fitBounds(bounds);

    new window.google.maps.Polyline({
      path: decodedPath,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map,
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes.toString().padStart(2, "0")}min` : `${minutes}min`;
  }
}
