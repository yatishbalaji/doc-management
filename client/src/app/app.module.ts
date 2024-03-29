import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ViewComponent } from './view/view.component';
import { HttpTokenInterceptor } from './http.interceptor';
import { UserComponent } from './user/user.component';
import { ShareComponent } from './share/share.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ViewComponent,
    UserComponent,
    ShareComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SharedModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatTooltipModule,
    AngularEditorModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
