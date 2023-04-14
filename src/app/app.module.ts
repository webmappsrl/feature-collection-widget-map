import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, MapComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [MapComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    if (location.search.includes('web-component=true')) {
      const mapElement = createCustomElement(MapComponent, { injector });
      customElements.define('app-map', mapElement);
    }
  }

  ngDoBootstrap() {}
}
