import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgD3UsColormapModule } from 'ng-d3-us-colormap';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgD3UsColormapModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
