import { HttpClient } from '@angular/common/http';
import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  SimpleChanges,
  ElementRef,
  Renderer2,
} from '@angular/core';
import CircleStyle from 'ol/style/Circle';
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
  selector: 'feature-collection-widget-map',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  private _view: View | undefined;

  @Input() duration: number = 0;
  @Input() geojsonUrl: string | undefined;
  @Input() maxZoom: number = 17;
  @Input() padding: number = 10;
  @Input() strokeWidth: number = 2;
  @Input() fillColor: string = 'rgba(255, 0, 0, 1)';
  @Input() strokeColor: string = 'rgba(255, 255, 255, 1)';
  @Input() pointRadius: number = 15;
  @Input() pointFillColor: string = 'rgba(255, 0, 0, 1)';
  @Input() pointStrokeColor: string = 'rgba(255, 255, 255, 1)';
  @Input() pointStrokeWidth: number = 5;
  @Input() targetReference: string = 'ol-map';

  map: Map | undefined;
  vectorLayer: VectorLayer<Vector<Geometry>> | undefined;
  constructor(
    private _http: HttpClient,
    private _el: ElementRef,
    private _renderer: Renderer2
  ) {
    this.geojsonUrl =
      this._el.nativeElement.getAttribute('geojsonUrl') ?? this.geojsonUrl;
    this.strokeWidth =
      this._el.nativeElement.getAttribute('strokeWidth') ?? this.strokeWidth;
    this.padding =
      this._el.nativeElement.getAttribute('padding') ?? this.padding;
    this.maxZoom =
      this._el.nativeElement.getAttribute('maxZoom') ?? this.maxZoom;
    this.duration =
      this._el.nativeElement.getAttribute('duration') ?? this.duration;
    this.fillColor =
      this._el.nativeElement.getAttribute('fillColor') ?? this.fillColor;
    this.strokeColor =
      this._el.nativeElement.getAttribute('strokeColor') ?? this.strokeColor;
    this.pointRadius =
      this._el.nativeElement.getAttribute('pointRadius') ?? this.pointRadius;
    this.pointFillColor =
      this._el.nativeElement.getAttribute('pointFillColor') ??
      this.pointFillColor;
    this.pointStrokeColor =
      this._el.nativeElement.getAttribute('pointStrokeColor') ??
      this.pointStrokeColor;
    this.pointStrokeWidth =
      this._el.nativeElement.getAttribute('pointStrokeWidth') ??
      this.pointStrokeWidth;

    // console.log('geojsonUrl:', this.geojsonUrl);
    // console.log('targetReference:', this.targetReference);
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
    if (this.geojsonUrl != null) {
      this._http.get<any>(this.geojsonUrl).subscribe((geojson: any) => {
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
      const geometryType = feature.getGeometry().getType();
      if (geometryType === 'Point') {
        const image = new CircleStyle({
          radius: properties.pointRadius
            ? properties.pointRadius
            : this.pointRadius,
          fill: new Fill({
            color: properties.pointFillColor
              ? properties.pointFillColor
              : this.pointFillColor,
          }),
          stroke: new Stroke({
            color: properties.pointStrokeColor
              ? properties.pointStrokeColor
              : this.pointStrokeColor,
            width: properties.pointStrokeWidth
              ? properties.pointStrokeWidth
              : this.pointStrokeWidth,
          }),
        });
        return new Style({ image });
      }
      return new Style({
        stroke: new Stroke({
          color: properties.strokeColor
            ? properties.strokeColor
            : this.strokeColor,
          width: properties.strokeWidth
            ? properties.strokeWidth
            : this.strokeWidth,
        }),
        fill: new Fill({
          color: properties.fillColor ? properties.fillColor : this.fillColor,
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
      // console.log(this.maxZoom);
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
  private _initMap(): void {
    const mapDiv = this._renderer.createElement('div');
    this._renderer.setAttribute(mapDiv, 'id', this.targetReference);
    this._renderer.addClass(mapDiv, 'map');
    this._renderer.appendChild(this._el.nativeElement, mapDiv);

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
      target: mapDiv,
    });
    // console.log('Mappa inizializzata:', this.map);
  }
}
