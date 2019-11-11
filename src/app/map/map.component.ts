import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs/Rx";
import * as L from "leaflet";
import { GeocodingService } from "../geocoding.service";
import { MapService } from "../map.service";
import { Location } from "../location";

import "rxjs/add/operator/catch";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit {
  address: string;

  constructor(
    private mapService: MapService,
    private geocoder: GeocodingService
  ) {
    this.address = "";
  }

  ngOnInit() {
    this.geocoder
      .getClientLocation()
      .catch(err => {
        console.error(err);

        // default map location
        const location = new Location();
        location.address = "500 C Street SW, WASHINGTON DC 20005";
        location.latlng = L.latLng(38.88558, -77.01867);
        // location.latlng = this.geocoder.geocodeBing(location.address);
        return Observable.of(location);
      })
      .subscribe((location: Location) => {
        const map = L.map("map", {
          zoomControl: false,
          center: location.latlng,
          zoom: 19,
          // minZoom: 4,
          // maxZoom: 21,
          layers: [this.mapService.baseMaps.BingRoads]
        });

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.layers(this.mapService.baseMaps).addTo(map);
        L.control.scale().addTo(map);
        this.address = location.address;
        this.mapService.map = map;
        // this.mapService.toggleMarkerEditing(true);
      });
  }
}
