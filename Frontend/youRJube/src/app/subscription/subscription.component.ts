import { DataService } from './../data.service';
import { SocialUser } from 'angularx-social-login';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  user: SocialUser

  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
  }

  isUserSignedIn():boolean {
    if(this.user == null){
      return false;
    }

    return true
  }
}
