// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App as AppComponent } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),   // ✅ Enables HttpClient across the app
    provideRouter(routes)  // ✅ Your Angular routing
  ]
}).catch(err => console.error(err));
