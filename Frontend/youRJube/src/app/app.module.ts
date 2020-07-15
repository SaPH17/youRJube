import { environment } from './../environments/environment.prod';
import { DataService } from './data.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { SubscriptionComponent } from './subscription/subscription.component';
import { PremiumMembershipComponent } from './premium-membership/premium-membership.component';
import { HomeComponent } from './home/home.component';
import { TrendingComponent } from './trending/trending.component';
import { CategoryComponent } from './category/category.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
} from 'angularx-social-login';
import { VideoDisplayComponent } from './video-display/video-display.component';
import { VideoWatchComponent } from './video-watch/video-watch.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore'
import { AngularFireStorageModule } from 'angularfire2/storage';
import { DropZoneDirective } from './drop-zone.directive'
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    SubscriptionComponent,
    PremiumMembershipComponent,
    HomeComponent,
    TrendingComponent,
    CategoryComponent,
    PlaylistComponent,
    VideoDisplayComponent,
    VideoWatchComponent,
    VideoUploadComponent,
    DropZoneDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    GraphQLModule,
    HttpClientModule,
    SocialLoginModule,
    FormsModule      
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '790937637143-3b1ko5iodr9t18f047ugog87sp6erhji.apps.googleusercontent.com'
            ),
          }
        ],
      } as SocialAuthServiceConfig,
    },
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
