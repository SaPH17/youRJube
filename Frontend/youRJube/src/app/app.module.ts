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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatVideoModule } from 'mat-video';
import { VideoCommentComponent } from './video-comment/video-comment.component';
import { VideoReplyComponent } from './video-reply/video-reply.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { TermsComponent } from './terms/terms.component';
import { CopyrightComponent } from './copyright/copyright.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { VideoRelatedComponent } from './video-related/video-related.component';
import { SecondVideoDisplayComponent } from './second-video-display/second-video-display.component';
import { ChannelComponent } from './channel/channel.component';
import { ChannelHomeComponent } from './channel-home/channel-home.component';
import { ChannelVideosComponent } from './channel-videos/channel-videos.component';
import { ChannelPlaylistComponent } from './channel-playlist/channel-playlist.component';
import { ChannelCommunityComponent } from './channel-community/channel-community.component';
import { ChannelAboutComponent } from './channel-about/channel-about.component';
import { ChannelPlaylistDisplayComponent } from './channel-playlist-display/channel-playlist-display.component';
import { ChannelCommunityDisplayComponent } from './channel-community-display/channel-community-display.component';
import { ChannelEditComponent } from './channel-edit/channel-edit.component';
import { CategoryMusicComponent } from './category/category-music/category-music.component';
import { CategorySportComponent } from './category/category-sport/category-sport.component';
import { CategoryGamingComponent } from './category/category-gaming/category-gaming.component';
import { CategoryEntertainmentComponent } from './category/category-entertainment/category-entertainment.component';
import { CategoryNewsComponent } from './category/category-news/category-news.component';
import { CategoryTravelComponent } from './category/category-travel/category-travel.component';


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
    VideoCommentComponent,
    VideoReplyComponent,
    AboutUsComponent,
    TermsComponent,
    CopyrightComponent,
    PrivacyComponent,
    VideoRelatedComponent,
    SecondVideoDisplayComponent,
    ChannelComponent,
    ChannelHomeComponent,
    ChannelVideosComponent,
    ChannelPlaylistComponent,
    ChannelCommunityComponent,
    ChannelAboutComponent,
    ChannelPlaylistDisplayComponent,
    ChannelCommunityDisplayComponent,
    ChannelEditComponent,
    CategoryMusicComponent,
    CategorySportComponent,
    CategoryGamingComponent,
    CategoryEntertainmentComponent,
    CategoryNewsComponent,
    CategoryTravelComponent,
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
    FormsModule,
    BrowserAnimationsModule,
    MatVideoModule
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
