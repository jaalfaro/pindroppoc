import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as esri from "esri-leaflet";
import * as L from "leaflet";
import { LatLng } from "leaflet";
import * as Bing from "leaflet-bing-layer";

@Injectable()
export class MapService {
  public map: L.Map;
  public baseMaps: any;
  private vtLayer: any;

  constructor(private http: HttpClient) {
    const osmAttr =
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, " +
      "Tiles courtesy of <a href='http://hot.openstreetmap.org/' target='_blank'>Humanitarian OpenStreetMap Team</a>";

    const esriAttr =
      "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, " +
      "iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, " +
      "Esri China (Hong Kong), and the GIS User Community";

    const cartoAttr =
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> " +
      "&copy; <a href='http://cartodb.com/attributions'>CartoDB</a>";

    this.baseMaps = {
      OpenStreetMap: L.tileLayer(
        "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          zIndex: 1,
          attribution: osmAttr
        }
      ),
      CartoDB: L.tileLayer(
        "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        {
          zIndex: 1,
          attribution: cartoAttr
        }
      ),
      // "BingArial": new Bing("AlLemtI1TtD7P0MIGzkAOwr69Xc4k3xAcCk0yfbubjse1oPWXTeQFGCotkicRuwW"),
      BingRoads: new Bing({
        bingMapsKey:
          "AlLemtI1TtD7P0MIGzkAOwr69Xc4k3xAcCk0yfbubjse1oPWXTeQFGCotkicRuwW",
        imagerySet: "AerialWithLabelsOnDemand",
        culture: "en-US",
        minZoom: 10,
        maxZoom: 25,
        minNativeZoom: 1,
        maxNativeZoom: 21
      }),
      Google: L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
      })
    };

    Object.getOwnPropertyNames(esri.BasemapLayer.TILES).forEach(tile => {
      this.baseMaps["Esri" + tile] = esri.basemapLayer(tile);
    });
    // this.baseMaps = esri.BasemapLayer.TILES;
  }

  disableMouseEvent(elementId: string) {
    const element = <HTMLElement>document.getElementById(elementId);

    L.DomEvent.disableClickPropagation(element);
    L.DomEvent.disableScrollPropagation(element);
  }

  toggleAirPortLayer(on: boolean) {
    if (on) {
      this.http.get("assets/airports.min.geojson").subscribe(result => {
        this.vtLayer = L.vectorGrid.slicer(result, {
          zIndex: 1000
        });
        this.vtLayer.addTo(this.map);
      });
    } else if (this.vtLayer) {
      this.map.removeLayer(this.vtLayer);
      delete this.vtLayer;
    }
  }

  toggleMarkerEditing(on: boolean) {
    if (on) {
      this.map.on("click", this.addMarker.bind(this));
    } else {
      this.map.off("click");
    }
  }

  fitBounds(bounds: L.LatLngBounds) {
    this.map.fitBounds(bounds, {});
  }

  private getPopupText(latlng: LatLng): string {
    const shortLat = Math.round(latlng.lat * 1000000) / 1000000;
    const shortLng = Math.round(latlng.lng * 1000000) / 1000000;
    const popup = `<div>Latitude: ${shortLat}<div><div>Longitude: ${shortLng}<div>`;
    return popup;
  }

  private addMarker(e: L.LeafletMouseEvent) {
    // const shortLat = Math.round(e.latlng.lat * 1000000) / 1000000;
    // const shortLng = Math.round(e.latlng.lng * 1000000) / 1000000;
    // const popup = `<div>Latitude: ${shortLat}<div><div>Longitude: ${shortLng}<div>`;
    const popup = this.getPopupText(e.latlng);
    const icon = L.icon({
      iconUrl: "assets/marker-icon.png",
      shadowUrl: "assets/marker-shadow.png",
      iconAnchor: [12, 40]
    });

    const marker = L.marker(e.latlng, {
      draggable: true,
      icon
    })
      .bindPopup(popup, {
        offset: L.point(0, -35),
        closeButton: false,
        autoClose: false,
        closeOnClick: false
      })
      .addTo(this.map)
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
  }
}
