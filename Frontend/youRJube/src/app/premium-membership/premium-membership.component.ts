import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';
import { SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-premium-membership',
  templateUrl: './premium-membership.component.html',
  styleUrls: ['./premium-membership.component.scss']
})
export class PremiumMembershipComponent implements OnInit {

  user: SocialUser

  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
  }

}
