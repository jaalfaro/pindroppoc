import { Component, OnInit, Input } from "@angular/core";
import { LatLng } from "leaflet";
import * as L from "leaflet";
import { MapService } from "../map.service";
import { GeocodingService } from "../geocoding.service";
import { Location } from "../location";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-navigator",
  templateUrl: "./navigator.component.html",
  styleUrls: ["./navigator.component.scss"]
})
export class NavigatorComponent implements OnInit {
  @Input() address: string;
  airportsOn: boolean;
  markersOn: boolean;

  constructor(
    private mapService: MapService,
    private geocoder: GeocodingService,
    private snackBar: MatSnackBar
  ) {
    this.address = "";
    this.airportsOn = false;
    this.markersOn = true;
  }

  ngOnInit() {
    this.mapService.disableMouseEvent("map-navigator");
  }

  private getPopupText(latlng: LatLng): string {
    const shortLat = Math.round(latlng.lat * 1000000) / 1000000;
    const shortLng = Math.round(latlng.lng * 1000000) / 1000000;
    const popup = `<div>Latitude: ${shortLat}<div><div>Longitude: ${shortLng}<div>`;
    return popup;
  }

  goto(address: string) {
    if (!address) {
      return;
    }

    this.geocoder.geocodeBing(address).subscribe(
      (location: Location) => {
        this.mapService.fitBounds(location.viewBounds);
        this.address = location.address;

        const popup = this.getPopupText(location.latlng);
        const icon = L.icon({
          iconUrl: "assets/marker-icon.png",
          shadowUrl: "assets/marker-shadow.png",
          iconAnchor: [12, 40]
        });
        const marker = L.marker(location.latlng, {
          draggable: true,
          icon,
        })
          .bindPopup(popup, {
            offset: L.point(0, -35),
            closeButton: false,
            autoClose: false,
            closeOnClick: false,
          })
          .addTo(this.mapService.map)
          .openPopup();

        // marker.on("click", () => marker.remove());
        marker.on("mouseover  ", () => {
          if (!marker.isPopupOpen()) {
            marker.openPopup();
          }
        });
        marker.on("dragend ", () => {
          marker.setPopupContent(this.getPopupText(marker.getLatLng()));
          marker.openPopup();
        });
      },
      err => {
        this.snackBar.open(err.message, "OK", {
          duration: 5000
        });
      }
    );
  }

  toggleAirports(on: boolean) {
    this.airportsOn = on;
    this.mapService.toggleAirPortLayer(this.airportsOn);
  }

  toggleMarkers(on: boolean) {
    this.markersOn = on;
    this.mapService.toggleMarkerEditing(this.markersOn);
  }
}
