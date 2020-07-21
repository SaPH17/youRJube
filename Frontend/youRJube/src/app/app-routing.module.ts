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


const routes: Routes = [
  {path:"", redirectTo:"/home", pathMatch: 'full'},
  {path:"home", component: HomeComponent},
  {path:"trending", component: TrendingComponent},
  {path:"subscription", component: SubscriptionComponent},
  {path:"category", component: CategoryComponent},
  {path:"playlist/:id", component: PlaylistComponent},
  {path:"premium-membership", component: PremiumMembershipComponent},
  {path:"watch/:id", component: VideoWatchComponent},
  {path:"upload", component: VideoUploadComponent},
  {path:"about-us", component: AboutUsComponent},
  {path:"terms", component: TermsComponent},
  {path:"copyright", component: CopyrightComponent},
  {path:"privacy", component: PrivacyComponent},
  {path:"channel/:id", component: ChannelComponent,
    children:[
      {path:"", redirectTo:"home", pathMatch: 'full'},
      {path:"home", component: ChannelHomeComponent},
      {path:"videos", component: ChannelVideosComponent},
      {path:"community", component: ChannelCommunityComponent},
      {path:"playlist", component: ChannelPlaylistComponent},
      {path:"about", component: ChannelAboutComponent},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
