import { ChannelEditVideosComponent } from './channel-edit-videos/channel-edit-videos.component';
import { VideoSearchComponent } from './video-search/video-search.component';
import { CategorySportComponent } from './category/category-sport/category-sport.component';
import { CategoryMusicComponent } from './category/category-music/category-music.component';
import { ChannelEditComponent } from './channel-edit/channel-edit.component';
import { ChannelVideosComponent } from './channel-videos/channel-videos.component';
import { ChannelHomeComponent } from './channel-home/channel-home.component';
import { ChannelComponent } from './channel/channel.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { CopyrightComponent } from './copyright/copyright.component';
import { TermsComponent } from './terms/terms.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { CategoryComponent } from './category/category.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { TrendingComponent } from './trending/trending.component';
import { HomeComponent } from './home/home.component';
import { PremiumMembershipComponent } from './premium-membership/premium-membership.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoWatchComponent } from './video-watch/video-watch.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { ChannelCommunityComponent } from './channel-community/channel-community.component';
import { ChannelPlaylistComponent } from './channel-playlist/channel-playlist.component';
import { ChannelAboutComponent } from './channel-about/channel-about.component';
import { CategoryGamingComponent } from './category/category-gaming/category-gaming.component';
import { CategoryEntertainmentComponent } from './category/category-entertainment/category-entertainment.component';
import { CategoryNewsComponent } from './category/category-news/category-news.component';
import { CategoryTravelComponent } from './category/category-travel/category-travel.component';


const routes: Routes = [
  {path:"", redirectTo:"/home", pathMatch: 'full'},
  {path:"home", component: HomeComponent},
  {path:"trending", component: TrendingComponent},
  {path:"subscription", component: SubscriptionComponent},
  {path:"category", component: CategoryComponent,
    children:[
      {path:"", redirectTo:"music", pathMatch: 'full'},
      {path:"music", component: CategoryMusicComponent},
      {path:"sport", component: CategorySportComponent},
      {path:"gaming", component: CategoryGamingComponent},
      {path:"entertainment", component: CategoryEntertainmentComponent},
      {path:"news", component: CategoryNewsComponent},
      {path:"travel", component: CategoryTravelComponent},
  ]},
  {path:"playlist/:id", component: PlaylistComponent},
  {path:"premium-membership", component: PremiumMembershipComponent},
  {path:"watch/:id", component: VideoWatchComponent},
  {path:"watch/:id/:time", component: VideoWatchComponent},
  {path:"watch/playlist/:id/index", component: VideoWatchComponent},
  {path:"upload", component: VideoUploadComponent},
  {path:"about-us", component: AboutUsComponent},
  {path:"terms", component: TermsComponent},
  {path:"copyright", component: CopyrightComponent},
  {path:"privacy", component: PrivacyComponent},
  {path:"search/:query", component: VideoSearchComponent},
  {path:"channel/:id", component: ChannelComponent,
    children:[
      {path:"", redirectTo:"home", pathMatch: 'full'},
      {path:"home", component: ChannelHomeComponent},
      {path:"videos", component: ChannelVideosComponent},
      {path:"community", component: ChannelCommunityComponent},
      {path:"playlist", component: ChannelPlaylistComponent},
      {path:"about", component: ChannelAboutComponent},
      {path:"edit", component: ChannelEditComponent},
      {path:"edit-videos", component: ChannelEditVideosComponent},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
