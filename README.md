# Sisteco Widget Map
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.19.

This component is an Angular-based map component that displays a parcel with a specified ID on an interactive map. The component has customizable input properties, including the parcel ID, stroke width, padding, maximum zoom level, and animation duration. Once initialized, the component fetches the GeoJSON data for the parcel from a specified API endpoint and renders the parcel on the map using OpenLayers.

<hr>

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

<hr>

## How to build the web component
first launch from the terminal inside the component path
`ng add @angular/elements`

In the outputPath inside angular.json file,
you can change the destination folder of the files to be copied to use the web component
```php
"outputPath": "dist/sisteco-sisteco-widget-map"
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
`ng build --prod --output-hashing=none`

Now inside the `dist` folder (or the one that was initially indicated via `outputPath`in `angular.json`) we will find the files to be used in order to include the web component in an html page (`main.js, polifyll.js, runtime.js, style.css`)

<hr>

## Usage
Once the web component has been created here's how to include it in an html page
```html
  <feature-collection-widget-map parcel="529" strokeWidth="5" padding="20" maxZoom="15" duration="5"></feature-collection-widget-map>
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
        <td>parcel</td>
        <td>number</td>
        <td>undefined</td>
        <td>Input property for the component, which accepts a numeric value representing the parcel identifier. When a value is provided for this input, the component retrieves and displays the corresponding parcel's data on the map.</td>
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
    </tbody>
  </table>
</div>