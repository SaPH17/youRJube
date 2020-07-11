import { PlaylistComponent } from './playlist/playlist.component';
import { CategoryComponent } from './category/category.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { TrendingComponent } from './trending/trending.component';
import { HomeComponent } from './home/home.component';
import { PremiumMembershipComponent } from './premium-membership/premium-membership.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {path:"", redirectTo:"/home", pathMatch: 'full'},
  {path:"home", component: HomeComponent},
  {path:"trending", component: TrendingComponent},
  {path:"subscription", component: SubscriptionComponent},
  {path:"category", component: CategoryComponent},
  {path:"playlist", component: PlaylistComponent},
  {path:"premium-membership", component: PremiumMembershipComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
