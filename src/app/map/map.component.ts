import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import Map from 'ol/Map';
import View, { FitOptions } from 'ol/View';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { transform, transformExtent } from 'ol/proj';
import { Extent } from 'ol/extent';
import { Coordinate } from 'ol/coordinate';
import { Geometry, SimpleGeometry } from 'ol/geom';
import Vector from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
  @Input() parcel: number | undefined;
  private _view: View | undefined;
  private _centerExtent = [
    705258.6107125686, 4348468.239859701, 2114145.916064937, 5975048.2017736295,
  ];
  private _geojson = {
    type: 'Feature',
    properties: { id: 680, code: 'B303_002200.392' },
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [10.60824201, 43.721957537],
            [10.608113318, 43.721887311],
            [10.608112387, 43.721926535],
            [10.608181548, 43.721962112],
            [10.608315358, 43.722068406],
            [10.608408796, 43.722090301],
            [10.608300922, 43.722000642],
            [10.60824201, 43.721957537],
          ],
        ],
        [
          [
            [10.618540408, 43.723207873],
            [10.618566137, 43.723157219],
            [10.618589915, 43.723161948],
            [10.618611127, 43.723117748],
            [10.618581352, 43.723108233],
            [10.618581926, 43.723100367],
            [10.618473503, 43.723071116],
            [10.618432021, 43.723155883],
            [10.61844306, 43.723157714],
            [10.618452923, 43.723140458],
            [10.618485742, 43.723149506],
            [10.618467104, 43.723192398],
            [10.618462578, 43.72319417],
            [10.618394092, 43.723175803],
            [10.618336386, 43.723291472],
            [10.61846844, 43.723326388],
            [10.618526686, 43.723207346],
            [10.618540408, 43.723207873],
          ],
        ],
      ],
    },
  };

  map: Map | undefined;
  vectorLayer: VectorLayer<Vector<Geometry>> | undefined;

  constructor() {}

  ngOnInit(): void {
    this._initMap();
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

    this.fitView(this._centerExtent);

    this.map = new Map({
      view: this._view,
      controls: defaultControls({
        rotate: false,
        attribution: false,
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
    this._buildGeojson();
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

  private _buildGeojson() {
    const styleFunction = function () {
      return new Style({
        stroke: new Stroke({
          color: 'yellow',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 0, 1)',
        }),
      });
    };
    const red = new Style({
      stroke: new Stroke({
        color: '#ff0000',
        width: 2.25,
      }),
      fill: new Fill({
        color: '#ff333355',
      }),
    });
    const feature = new GeoJSON({
      featureProjection: 'EPSG:3857',
    }).readFeature(this._geojson);
    feature.setStyle(red);
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      features: [feature],
    });
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 10,
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 0, 1)',
        }),
      }),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: 1,
    });
    if (this.map != null) {
      this.map.addLayer(this.vectorLayer);
      const extent = vectorSource.getExtent();
      if (extent != null) {

        const optOptions: FitOptions = {
          duration: 0,
          maxZoom: 17,
        };
        this.fitView(extent, optOptions);
      }
    }
  }
}
