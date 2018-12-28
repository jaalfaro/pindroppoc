import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Location } from "./location";
import * as L from "leaflet";

import "rxjs/add/operator/map";

@Injectable()
export class GeocodingService {
  constructor(private http: HttpClient) {}

  geocode(address: string) {
    const encoded = encodeURIComponent(address);

    return this.http
      .get(
        `https://nominatim.openstreetmap.org/search.php?q=${encoded}&format=jsonv2`
      )
      .map((result: any) => {
        if (result.length === 0) {
          throw new Error(`Unable to geocode address: ${address}`);
        }

        const best = result[0];
        const location = new Location();
        location.address = best.display_name;
        location.latlng = L.latLng(best.lat, best.lon);
        location.viewBounds = L.latLngBounds(
          {
            lat: Number(best.boundingbox[0]),
            lng: Number(best.boundingbox[2])
          },
          {
            lat: Number(best.boundingbox[1]),
            lng: Number(best.boundingbox[3])
          }
        );

        return location;
      });
  }

  geocodeBing(address: string) {
    const encoded = encodeURIComponent(address);
    const BingMapsAPIKey = "AlLemtI1TtD7P0MIGzkAOwr69Xc4k3xAcCk0yfbubjse1oPWXTeQFGCotkicRuwW";
    return this.http
      .get(
        `https://dev.virtualearth.net/REST/v1/Locations?q=${encoded}&key=${BingMapsAPIKey}`
      )
      .map((result: any) => {
        if (result.length === 0) {
          throw new Error(`Unable to geocode address: ${address}`);
        }

        const best = result.resourceSets[0];
        const location = new Location();
        location.address = best.resources[0].name;
        location.latlng = L.latLng(best.resources[0].point.coordinates[0], best.resources[0].point.coordinates[1]);
        location.viewBounds = L.latLngBounds(
          {
            lat: Number(best.resources[0].bbox[0]),
            lng: Number(best.resources[0].bbox[1])
          },
          {
            lat: Number(best.resources[0].bbox[2]),
            lng: Number(best.resources[0].bbox[3])
          }
        );

        return location;
      });
  }

  getClientLocation() {
    return this.http
      // .get("http://ipv4.myexternalip.com/json")
      .get("http://api.ipapi.com/api/check?access_key=59b964d2beb2b2b966069dddd74736b2")
      // .flatMap((result: any) =>
      //   this.http.get(`https://ipapi.co/${result.ip}/json`)
      // )
      .map((result: any) => {
        const location = new Location();

        location.address =
          result.city + ", " + result.region_name + ", " + result.country_code;
        location.latlng = L.latLng(result.latitude, result.longitude);

        return location;
      });
  }
}
