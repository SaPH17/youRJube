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

  videos = [{
      id:1,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:2,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:3,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:4,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:5,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:6,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:7,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    },{
      id:8,
      vidthumbnail: "../../assets/thumbnail.jpg",
      vidpropic: "../../assets/1x1.png"
    }
  ]

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
