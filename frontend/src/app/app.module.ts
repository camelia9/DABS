import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import {NgxJsonLdModule} from '@ngx-lite/json-ld';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatStepperModule} from '@angular/material/stepper';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorModule} from '@angular/material/paginator';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgxGraphModule} from '@swimlane/ngx-graph';
import {CookieService} from 'ngx-cookie-service';
import {DabsLoginComponent} from './dabs-login.component';
import {DabsHomeComponent} from './dabs-home.component';
import {DabsSignupComponent} from './dabs-signup.component';
import {DabsRecommendComponent} from './dabs-recommend.component';
import {DabsPlaygroundComponent} from './dabs-playground.component';
import {DabsMainComponent} from './dabs-main.component';
import {UrlToStatePipe} from './pipes/url-to-state.pipe';
import {DabsAccountComponent} from './dabs-account.component';
import {NgTerminalModule} from 'ng-terminal';
import {AddTokenInterceptor} from './http.interceptor';
import {DabsJsonldComponent} from './dabs-jsonld.component';
import {PaginationPipe} from './pipes/pagination.pipe';


@NgModule({
  declarations: [
    AppComponent,
    DabsLoginComponent,
    DabsHomeComponent,
    DabsSignupComponent,
    DabsRecommendComponent,
    DabsPlaygroundComponent,
    DabsMainComponent,
    UrlToStatePipe,
    DabsAccountComponent,
    DabsJsonldComponent,
    PaginationPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    HttpClientModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatListModule,
    MatSelectModule,
    MatExpansionModule,
    NgxGraphModule,
    NgTerminalModule,
    MatStepperModule,
    NgxJsonLdModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AddTokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
