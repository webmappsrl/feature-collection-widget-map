import Feature from 'ol/Feature';
import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit, ViewEncapsulation, ElementRef, Renderer2} from '@angular/core';
import CircleStyle from 'ol/style/Circle';
import Map from 'ol/Map';
import {Fill, Text} from 'ol/style';
import View, {FitOptions} from 'ol/View';
import {defaults as defaultControls} from 'ol/control';
import {Extent} from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import {Geometry, SimpleGeometry, Point} from 'ol/geom';
import {defaults as defaultInteraction} from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {default as Vector, default as VectorSource} from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import {Coordinate} from 'ol/coordinate';
import {fromLonLat, toLonLat} from 'ol/proj';

@Component({
  selector: 'feature-collection-widget-map',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  private _mapDiv: any;
  private _view: View | undefined;

  @Input() dragPan: boolean = false;
  @Input() duration: number = 0;
  @Input() fillColor: string = 'rgba(255, 0, 0, 1)';
  @Input() geojsonUrl: string | undefined;
  @Input() maxZoom: number = 17;
  @Input() mouseWheelZoom: boolean = false;
  @Input() padding: number = 10;
  @Input() pointFillColor: string = 'rgba(255, 0, 0, 1)';
  @Input() pointPosition: boolean = false;
  @Input() pointRadius: number = 15;
  @Input() pointStrokeColor: string = 'rgba(255, 255, 255, 1)';
  @Input() pointStrokeWidth: number = 5;
  @Input() showControlZoom: boolean = false;
  @Input() strokeColor: string = 'rgba(255, 255, 255, 1)';
  @Input() strokeWidth: number = 2;
  @Input() targetReference: string = 'ol-map';
  @Input() toIMG: boolean = false;

  map: Map | undefined;
  vectorLayer: VectorLayer<Vector<Geometry>> | undefined;

  constructor(private _http: HttpClient, private _el: ElementRef, private _renderer: Renderer2) {
    this.geojsonUrl = this._el.nativeElement.getAttribute('geojsonUrl') ?? this.geojsonUrl;
    this.strokeWidth = this._el.nativeElement.getAttribute('strokeWidth') ?? this.strokeWidth;
    this.padding = this._el.nativeElement.getAttribute('padding') ?? this.padding;
    this.maxZoom = this._el.nativeElement.getAttribute('maxZoom') ?? this.maxZoom;
    this.duration = this._el.nativeElement.getAttribute('duration') ?? this.duration;
    this.fillColor = this._el.nativeElement.getAttribute('fillColor') ?? this.fillColor;
    this.strokeColor = this._el.nativeElement.getAttribute('strokeColor') ?? this.strokeColor;
    this.pointRadius = this._el.nativeElement.getAttribute('pointRadius') ?? this.pointRadius;
    this.pointFillColor =
      this._el.nativeElement.getAttribute('pointFillColor') ?? this.pointFillColor;
    this.pointStrokeColor =
      this._el.nativeElement.getAttribute('pointStrokeColor') ?? this.pointStrokeColor;
    this.pointStrokeWidth =
      this._el.nativeElement.getAttribute('pointStrokeWidth') ?? this.pointStrokeWidth;
    this.toIMG = this._stringToBoolean(this._el.nativeElement.getAttribute('toIMG')) ?? this.toIMG;
    this.pointPosition =
      this._stringToBoolean(this._el.nativeElement.getAttribute('pointPosition')) ??
      this.pointPosition;
    this.showControlZoom =
      this._stringToBoolean(this._el.nativeElement.getAttribute('showControlZoom')) ??
      this.showControlZoom;
    this.mouseWheelZoom =
      this._stringToBoolean(this._el.nativeElement.getAttribute('mouseWheelZoom')) ??
      this.mouseWheelZoom;
    this.dragPan =
      this._stringToBoolean(this._el.nativeElement.getAttribute('dragPan')) ?? this.dragPan;
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
          Array.from(this.map?.getViewport().querySelectorAll('.ol-layer canvas') || []).forEach(
            (canvas: any) => {
              if (canvas.width > 0) {
                const opacity = canvas.parentElement?.style.opacity || canvas.style.opacity;
                mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

                const transform = canvas.style.transform;
                const matrix = transform
                  ? transform
                      .match(/^matrix\(([^\(]*)\)$/)?.[1]
                      .split(',')
                      .map(Number)
                  : [
                      parseFloat(canvas.style.width) / canvas.width,
                      0,
                      0,
                      parseFloat(canvas.style.height) / canvas.height,
                      0,
                      0,
                    ];

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
            },
          );

          mapContext.globalAlpha = 1;
          mapContext.setTransform(1, 0, 0, 1, 0, 0);

          if (img) {
            img.src = mapCanvas.toDataURL();
          }
        }
      }
    });
    this.map?.renderSync();
    const img = this._renderer.createElement('img');
    this._renderer.setAttribute(img, 'style', 'width: 100%');
    this._renderer.appendChild(this._el.nativeElement, img);
    this._renderer.removeChild(this._mapDiv.parentNode, this._mapDiv);
    this._mapDiv = null;
  }

  fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    if (optOptions == null) {
      optOptions = {
        duration: 500,
      };
    }
    if (this._view != null) {
      this._view.fit(geometryOrExtent, optOptions);
    }
  }

  ngOnInit(): void {
    this._initMap();
    if (this.geojsonUrl != null) {
      this._http.get<any>(this.geojsonUrl).subscribe((geojson: any) => {
        this._buildGeojson(geojson);
      });
    }
    if (this.toIMG) {
      this.convertMapToIMG();
    }

    this.map?.on('click', event => {
      this.map?.forEachFeatureAtPixel(event.pixel, feature => {
        const link = feature.get('link');
        if (link) {
          window.open(link, '_blank');
        }
      });
    });

    this.map?.on('pointermove', event => {
      const pixel = this.map?.getEventPixel(event.originalEvent);
      if (pixel) {
        const hit = this.map?.hasFeatureAtPixel(pixel);
        if (hit) {
          this.map?.forEachFeatureAtPixel(pixel, feature => {
            const tooltipText = feature.get('tooltip');
            if (tooltipText) {
              this._showTooltip(event.originalEvent, tooltipText);
            }
          });
        } else {
          this._hideTooltip();
        }
      }
    });
  }

  private _arrangePointsInSpiral(
    pointsFeatures: Feature<Point>[],
    spacing: number,
    expansion: number,
  ): Feature<Point>[] {
    if (pointsFeatures.length <= 1) {
      return pointsFeatures;
    }

    let angle = 0; // Angolo iniziale
    let radius = 0;
    const arrangedPoints: Feature<Point>[] = [];
    const centroid = this._calculateCentroid(pointsFeatures);
    const centroidCoords = toLonLat(centroid.getCoordinates());
    const baseSpacing = this.pointRadius + this.pointStrokeWidth;

    pointsFeatures.forEach((pointFeature, index) => {
      // Calcola il raggio della spirale in questo punto

      radius += (baseSpacing + index) * 0.0000006;
      // Calcola le nuove coordinate rispetto al centroide
      const x = centroidCoords[0] + radius * Math.cos(angle);
      const y = centroidCoords[1] + radius * Math.sin(angle);

      // Crea una nuova feature di tipo Point con le nuove coordinate
      const newPointFeature: Feature<Point> = new Feature();
      newPointFeature.setProperties(pointFeature.getProperties());
      newPointFeature.setGeometry(new Point(fromLonLat([x, y])));

      // Aggiungi la nuova feature all'array dei punti disposti
      arrangedPoints.push(newPointFeature);

      // Incrementa l'angolo per il prossimo punto
      angle += Math.PI / (radius * index + 1.9); // Assicurati che l'incremento dell'angolo diminuisca con l'aumentare del raggio
    });

    return arrangedPoints;
  }

  private _buildGeojson(geojson: any) {
    const features: Feature<Geometry>[] = new GeoJSON({
      featureProjection: 'EPSG:3857',
    }).readFeatures(geojson);
    let otherFeatures: Feature[] = [];
    let pointFeatures: Feature<Point>[] = [];
    let adjustFeatures: Feature<Point>[] = [];
    features.forEach(f => {
      if (f.getGeometry()!.getType() === 'Point') {
        f.setProperties({position: [pointFeatures.length + 1]});
        pointFeatures.push(f as Feature<Point>);
      } else {
        otherFeatures.push(f);
      }
    });
    const clusters = this._clusterFeaturesByProximity(pointFeatures);

    clusters.forEach((cluster, index) => {
      const pointsInSpiral = this._arrangePointsInSpiral(cluster, 0.0012, 0.0004);
      adjustFeatures = [...adjustFeatures, ...pointsInSpiral];
    });
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      features: [...otherFeatures, ...adjustFeatures],
    });
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature: any, index: number) => {
        const properties = feature.getProperties();
        const geometryType = feature.getGeometry().getType();
        if (geometryType === 'Point') {
          const image = new CircleStyle({
            radius: properties.pointRadius ? properties.pointRadius : this.pointRadius,
            fill: new Fill({
              color: properties.pointFillColor ? properties.pointFillColor : this.pointFillColor,
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
          if (this.pointPosition) {
            const text = new Text({
              text: `${properties.position}`,
              fill: new Fill({
                color: 'white', // Colore del testo
              }),
            });
            return new Style({image, text});
          }
          return new Style({image});
        }
        return new Style({
          stroke: new Stroke({
            color: properties.strokeColor ? properties.strokeColor : this.strokeColor,
            width: properties.strokeWidth ? properties.strokeWidth : this.strokeWidth,
          }),
          fill: new Fill({
            color: properties.fillColor ? properties.fillColor : this.fillColor,
          }),
        });
      },
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: 1,
    });
    if (this.map != null) {
      this.map.addLayer(this.vectorLayer);
      const extent = vectorSource.getExtent();
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

  private _calculateCentroid(features: Feature<Point>[]): Point {
    let xSum = 0;
    let ySum = 0;
    const numPoints = features.length;
    features.forEach((f: Feature<Point>) => {
      const coords = toLonLat(f!.getGeometry()!.getCoordinates());
      xSum += coords[0];
      ySum += coords[1];
    });

    const centroidLon = xSum / numPoints;
    const centroidLat = ySum / numPoints;

    return new Point(fromLonLat([centroidLon, centroidLat]));
  }

  private _clusterFeaturesByProximity(features: Feature<Point>[]): Feature<Point>[][] {
    const distanceThreshold = this.pointRadius * 5;
    // Funzione per calcolare la distanza tra due punti
    const calculateDistance = (coord1: Coordinate, coord2: Coordinate) => {
      return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
    };

    // Funzione per trovare il cluster più vicino (se esiste)
    const findClosestCluster = (
      clusters: Feature<Point>[][],
      point: Feature<Point>,
    ): Feature<Point>[] | null => {
      let minDistance = Infinity;
      let closestCluster = null;

      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        for (let j = 0; j < cluster.length; j++) {
          cluster[j].setProperties({cluster: i});
          const distance = calculateDistance(
            cluster[j].getGeometry()!.getCoordinates(),
            point.getGeometry()!.getCoordinates(),
          );
          if (distance < minDistance && distance < distanceThreshold) {
            minDistance = distance;
            closestCluster = cluster;
          }
        }
      }

      return closestCluster;
    };

    let clusters: Feature<Point>[][] = [];

    // Itera su ogni feature
    features.forEach(feature => {
      // Trova un cluster esistente che sia vicino a questa feature
      const closestCluster = findClosestCluster(clusters, feature);

      // Se un cluster vicino è stato trovato, aggiungi la feature a quel cluster
      if (closestCluster) {
        closestCluster.push(feature);
      } else {
        // Altrimenti, crea un nuovo cluster con questa feature
        clusters.push([feature]);
      }
    });

    return clusters;
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
        zoom: this.showControlZoom,
      }),
      interactions: defaultInteraction({
        mouseWheelZoom: this.mouseWheelZoom,
        dragPan: this.dragPan,
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
            crossOrigin: 'anonymous',
          }),
          visible: true,
          zIndex: 0,
          opacity: 1,
          preload: Infinity,
        }),
      ],
      target: this._mapDiv,
    });
  }

  private _stringToBoolean(value: string): boolean {
    return value === 'true';
  }

  private _showTooltip(event: MouseEvent, text: string): void {
    let tooltip = document.getElementById('map-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'map-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '3px';
      tooltip.style.pointerEvents = 'none';
      document.body.appendChild(tooltip);
    }
    tooltip.innerText = text;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
    tooltip.style.display = 'block';
  }

  private _hideTooltip(): void {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}
