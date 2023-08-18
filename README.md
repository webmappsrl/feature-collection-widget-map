# Feature collection widget map
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.19.

This component is a versatile and customizable map component. It allows users to display geojson data on the map and control various aspects of the map such as zoom levels, padding, and stroke width. This component also provides the ability to fetch geojson data from a URL, making it easy to integrate different data sources. Additionally, the map is built on the OpenLayers library, which offers a robust and feature-rich mapping solution. With its encapsulated styling and multiple configuration options, this component can be easily integrated into any application for a tailored user experience.

<hr>

## Development server

Run 
```bash
ng serve
``` 
for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

<hr>

## How to build the web component
First install all necessary dependencies inside the component path
```bash
npm install
```
Install angular elements
```bash
ng add @angular/elements
```

In the outputPath inside angular.json file,
you can change the destination folder of the files to be copied to use the web component
```php
"outputPath": "dist"
```

Inside the `app.module.ts` file make the following changes
```typescript
export class AppModule {
  constructor(private injector: Injector) {
    const mapElement = createCustomElement(AppComponent, { injector });
    customElements.define('feature-collection-widget-map', mapElement);
  }
  }
  ```
in `@ngModule` bootstrap indicates which component of the project will be built
```typescript
@NgModule({
  bootstrap: [AppComponent],
})
 ```
 Now launch from the terminal inside the component path
```bash
ng build --prod --output-hashing=none
```

<hr>

## Test the component
You can use surge to test the component.
Surge is a free and easy-to-use static hosting service, designed for quickly deploying web applications and static websites directly from the command line. It is ideal for developers who want to rapidly deploy frontend projects, such as websites based on HTML, CSS, and JavaScript. 
To get started with Surge, you can install the package through npm using the command:
```bash
npm install --global surge
```
Now run surge inside the dist folder
```bash
surge
```
Follow the instructions and once you reach domain rename it, better to always use the same name every time it is updated
```bash
example-name.surge.sh
```
Now your custom domain is ready to be shared

<hr>

## Usage
Once the web component has been created here's an example how to include it in an html page
```html
  <feature-collection-widget-map geojsonUrl="https://sisteco.maphub.it/api/v1/geom/cadastralparcel/664" strokeWidth="5" padding="20" maxZoom="15" duration="5" fillColor="rgba(28, 146, 51, 1)" strokeColor="rgba(58, 146, 51, 1)" pointRadius="3" pointFillColor="rgba(190, 161, 161, 1)" pointStrokeColor="rgba(29, 235, 67, 1)"></feature-collection-widget-map>
```
Copy and paste on your html code the following scripts given in the code below
```html
    <head>
    <meta charset="utf-8" />
    <title>feature collection widget map</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link rel="stylesheet" href="https://cdn.statically.io/gh/webmappsrl/feature-collection-widget-map/master/dist/styles.css">
  </head>
  <body>
    <feature-collection-widget-map
      geojsonurl="https://sisteco.maphub.it/api/v1/geom/cadastralparcel/664"
    ></feature-collection-widget-map>
    <script src="https://cdn.statically.io/gh/webmappsrl/feature-collection-widget-map/master/dist/runtime.js" defer></script>
    <script src="https://cdn.statically.io/gh/webmappsrl/feature-collection-widget-map/master/dist/polyfills.js" defer></script>
    <script src="https://cdn.statically.io/gh/webmappsrl/feature-collection-widget-map/master/dist/main.js" defer></script>
  </body>
```

<div style="overflow-x:auto;">
  <table style="width: 100%">
    <thead>
      <tr>
        <th>Property</th>
        <th>Type</th>
        <th style="width: 10%;">Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>geojsonUrl</td>
        <td>string</td>
        <td>undefined</td>
        <td >Input that allows you to provide a URL for a geojson file as a data source for the map component. By passing the URL as a string, the map will fetch the geojson data from the specified URL and display it on the map. If the input is left undefined, the map component will not load any geojson data by default. This input provides a flexible way to load and display geojson data from different sources, making the map component more versatile and adaptable to various use cases. <a href="https://sisteco.maphub.it/api/v1/geom/cadastralparcel/664" target="_blank">An example of geojson url</a></td> 
      </tr>
      <td>strokeWidth</td>
        <td>number</td>
        <td>2</td>
        <td> Input property for the component, which accepts a numeric value representing the stroke width for the parcel boundaries on the map. If a value is not provided, it defaults to 2.</td>
      <tr>
        <td>padding</td>
        <td>number</td>
        <td>10</td>
        <td>Input property for the component, which accepts a numeric value representing the padding around the parcel's bounding box when the map view is adjusted to fit the parcel. If a value is not provided, it defaults to 10.</td>
      </tr>
       <tr>
        <td>maxZoom</td>
        <td>number</td>
        <td>17</td>
        <td>Input property for the component, which accepts a numeric value representing the maximum zoom level allowed when fitting the map view to the parcel. If a value is not provided, it defaults to 17</td>
      </tr>
      <tr>
        <td>duration</td>
        <td>number</td>
        <td>0</td>
        <td>Input property for the component, which accepts a numeric value representing the duration in milliseconds for the map view to animate while adjusting to fit the parcel. If a value is not provided, it defaults to 0, meaning no animation.</td>
      </tr>
      <tr>
        <td>fillColor</td>
        <td>string</td>
        <td>rgba(255, 0, 0, 1)</td>
        <td>Input allows you to specify the fill color of the GeoJSON features on the map. It accepts a string representing a color in RGBA format. The default value is `'rgba(255, 0, 0, 1)'`, which corresponds to red. You can modify this value to change the fill color according to your needs.</td>
      </tr>
      <tr>
        <td>strokeColor</td>
        <td>string</td>
        <td>rgba(255, 255, 255, 1)</td>
        <td>Input parameter allows you to set the color of the stroke (outline) for the GeoJSON features on the map. It takes a string representing a color in RGBA format. The default stroke color is `'rgba(255, 255, 255, 1)'`, which is white. You can adjust this value to customize the stroke color as per your requirements.</td>
      </tr>
      <tr>
        <td>pointRadius</td>
        <td>number</td>
        <td>15</td>
        <td>Input allows you to set the radius of points (in pixels) for features on your map. By default, the radius is set to 15 pixels. This value can be adjusted to better suit the aesthetic and visibility requirements of your specific application.</td>
      </tr>
      <tr>
        <td>pointFillColor</td>
        <td>string</td>
        <td>rgba(255, 0, 0, 1)</td>
        <td>Input allows you to customize the fill color of the points on your map. The color is specified as an RGBA value, with the format 'rgba(r, g, b, a)', where 'r', 'g', and 'b' represent the red, green, and blue color components (ranging from 0 to 255), and 'a' represents the alpha (transparency) of the color (ranging from 0.0 to 1.0). The default color is 'rgba(255, 0, 0, 1)', which is a fully opaque red. Change this to any valid RGBA color to customize the appearance of your map points.</td>
      </tr>
      <tr>
        <td>pointStrokeColor</td>
        <td>string</td>
        <td>rgba(255, 255, 255, 1)</td>
        <td>Input determines the stroke (outline) color for the points on the map. It's specified as an RGBA value, following the format 'rgba(r, g, b, a)', where 'r', 'g', and 'b' are the red, green, and blue color components respectively (ranging from 0 to 255), and 'a' represents the alpha (transparency) level (ranging from 0.0 to 1.0). The default stroke color is 'rgba(255, 255, 255, 1)', representing white. This input allows you to customize the outline of your map points with any valid RGBA color.</td>
      </tr>
      <tr>
  <td>pointStrokeWidth</td>
  <td>number</td>
  <td>5</td>
  <td>Input to determine the stroke width of the outline for points on the map. It is specified as a numeric value, representing the stroke width in pixels. The default stroke width is 5. This input allows you to customize the thickness of the outline of your map points.</td>
</tr>

    </tbody>
  </table>
</div>

- If neither the `fillColor`, `strokeColor`, `pointRadius`, `pointFillColor` `pointStrokeWidth`, or `pointStrokeColor` input values are provided, they will each default to their pre-set values ('rgba(255, 0, 0, 1)', 'rgba(255, 255, 255, 1)', 15, 'rgba(255, 0, 0, 1)', and 'rgba(255, 255, 255, 1)' respectively). 
- However, if your GeoJSON data includes properties for 'fillColor', 'strokeColor', 'pointRadius', 'pointFillColor', and 'pointStrokeColor', these values will be used instead. 
- In case these properties are missing in the GeoJSON data, the component will fall back to using the default values.

