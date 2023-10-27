import { HttpClient } from '@angular/common/http';
import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  SimpleChanges,
  ElementRef,
  Renderer2,
  ViewChild,
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
  private _mapDiv:any;
  private _view: View | undefined;

  @Input() duration: number = 0;
  @Input() fillColor: string = 'rgba(255, 0, 0, 1)';
  @Input() geojsonUrl: string | undefined;
  @Input() maxZoom: number = 17;
  @Input() padding: number = 10;
  @Input() pointFillColor: string = 'rgba(255, 0, 0, 1)';
  @Input() pointRadius: number = 15;
  @Input() pointStrokeColor: string = 'rgba(255, 255, 255, 1)';
  @Input() pointStrokeWidth: number = 5;
  @Input() strokeColor: string = 'rgba(255, 255, 255, 1)';
  @Input() strokeWidth: number = 2;
  @Input() targetReference: string = 'ol-map';
  @Input() toIMG: boolean = false;
  @ViewChild('exportedImage') exportedImage: ElementRef<HTMLImageElement> | undefined;

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

  ngOnInit(): void {
    this._initMap();
    if (this.geojsonUrl != null) {
      this._http.get<any>(this.geojsonUrl).subscribe((geojson: any) => {
        this._buildGeojson(geojson);
      });
    }
    if(this.toIMG === true) {
      this.convertMapToIMG();

    }
  }

  convertMapToIMG(): void {
    this.map?.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = this.map?.getSize();
      if (size) {
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext('2d');
        if (mapContext) {
          Array.from(this.map?.getViewport().querySelectorAll('.ol-layer canvas') || [])
            .forEach((canvas: any) => {
              if (canvas.width > 0) {
                const opacity = canvas.parentElement?.style.opacity || canvas.style.opacity;
                mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
    
                const transform = canvas.style.transform;
                const matrix = transform
                  ? transform.match(/^matrix\(([^\(]*)\)$/)?.[1].split(',').map(Number)
                  : [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
                
                if (matrix) {
                  mapContext.setTransform(...matrix);
                }
                
                const backgroundColor = canvas.parentElement?.style.backgroundColor;
                if (backgroundColor) {
                  mapContext.fillStyle = backgroundColor;
                  mapContext.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                mapContext.drawImage(canvas, 0, 0);
              }
            });
    
          mapContext.globalAlpha = 1;
          mapContext.setTransform(1, 0, 0, 1, 0, 0);
    
          if (this.exportedImage && this.exportedImage.nativeElement) {
            this.exportedImage.nativeElement.src = mapCanvas.toDataURL();
          }
        }
      }
    });
    this.map?.renderSync();
    this._renderer.removeChild(this._mapDiv.parentNode, this._mapDiv);
    this._mapDiv = null;
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
    this._mapDiv = this._renderer.createElement('div');
    this._renderer.setAttribute(this._mapDiv, 'id', this.targetReference);
    this._renderer.addClass(this._mapDiv, 'map');
    this._renderer.appendChild(this._el.nativeElement, this._mapDiv);

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
            crossOrigin:'anonymous'
          }),
          visible: true,
          zIndex: 0,
          opacity: 1,
          preload: Infinity,
        }),
      ],
      target: this._mapDiv,
    });
    // console.log('Mappa inizializzata:', this.map);
  }
}
