import { HttpClient } from '@angular/common/http';
import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  SimpleChanges,
  ElementRef,
} from '@angular/core';

import Map from 'ol/Map';
import View, { FitOptions } from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry, SimpleGeometry } from 'ol/geom';
import { defaults as defaultInteraction } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { default as Vector, default as VectorSource } from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
@Component({
  selector: 'app-map',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  private _view: View | undefined;

  @Input() duration: number = 0;
  @Input() maxZoom: number = 17;
  @Input() padding: number = 10;
  @Input() parcel: number | undefined;
  @Input() strokeWidth: number = 2;

  map: Map | undefined;
  vectorLayer: VectorLayer<Vector<Geometry>> | undefined;

  constructor(private _http: HttpClient, private _elementRef: ElementRef) {
    this.parcel =
      this._elementRef.nativeElement.getAttribute('parcel') ?? this.parcel;
    this.strokeWidth =
      this._elementRef.nativeElement.getAttribute('strokeWidth') ??
      this.strokeWidth;
    this.padding =
      this._elementRef.nativeElement.getAttribute('padding') ?? this.padding;
    this.maxZoom =
      this._elementRef.nativeElement.getAttribute('maxZoom') ?? this.maxZoom;
    this.duration =
      this._elementRef.nativeElement.getAttribute('duration') ?? this.duration;
  }

  fitView(
    geometryOrExtent: SimpleGeometry | Extent,
    optOptions?: FitOptions
  ): void {
    if (optOptions == null) {
      optOptions = {
        duration: 500,
      };
    }
    if (this._view != null) {
      this._view.fit(geometryOrExtent, optOptions);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngOnInit(): void {
    this._initMap();
    if (this.parcel != null) {
      this._http
        .get<any>(this._buildParcelUrl(this.parcel))
        .subscribe((geojson) => {
          this._buildGeojson(geojson);
        });
    }
  }

  private _buildGeojson(geojson: any) {
    const features = new GeoJSON({
      featureProjection: 'EPSG:3857',
    }).readFeatures(geojson);
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      features: features,
    });
    const styleFunction = (feature: any) => {
      const properties = feature.getProperties();
      return new Style({
        stroke: new Stroke({
          color: properties.strokeColor,
          width: this.strokeWidth,
        }),
        fill: new Fill({
          color: properties.fillColor,
        }),
      });
    };
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: 1,
    });
    if (this.map != null) {
      this.map.addLayer(this.vectorLayer);
      const extent = vectorSource.getExtent();
      console.log(this.maxZoom);
      if (extent != null) {
        const optOptions: FitOptions = {
          duration: this.duration,
          maxZoom: this.maxZoom,
          padding: [this.padding, this.padding, this.padding, this.padding],
        };
        this.fitView(extent, optOptions);
      }
    }
  }

  private _buildParcelUrl(parcel: number): string {
    return `https://sisteco.maphub.it/api/v1/geom/cadastralparcel/${parcel}`;
  }

  private _initMap(): void {
    this._view = new View({
      maxZoom: 22,
      zoom: 5,
      minZoom: 5,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      showFullExtent: true,
    });

    this.map = new Map({
      view: this._view,
      controls: defaultControls({
        rotate: false,
        attribution: false,
        zoom: false,
      }),
      interactions: defaultInteraction({
        mouseWheelZoom: false,
        dragPan: false,
        doubleClickZoom: false,
      }),
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://api.webmapp.it/tiles/{z}/{x}/{y}.png',
            projection: 'EPSG:3857',
            tileSize: [256, 256],
            minZoom: 7,
            maxZoom: 22,
            cacheSize: 5000,
          }),
          visible: true,
          zIndex: 0,
          opacity: 1,
          preload: Infinity,
        }),
      ],
      target: 'ol-map',
    });
  }
}
