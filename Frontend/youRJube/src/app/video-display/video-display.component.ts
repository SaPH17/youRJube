import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';
import { SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-video-display',
  templateUrl: './video-display.component.html',
  styleUrls: ['./video-display.component.scss']
})
export class VideoDisplayComponent implements OnInit {

  // @Input('vid') video: {id:BigInteger, channel_id:BigInteger, title:string, description:string, upload_date:Date, 
  //   category:string, location:string, view: BigInteger, privacy: string, isPremium: boolean, ageRestricted: boolean}

  @Input('vid') video:{
    id:BigInteger, vidthumbnail:string, vidpropic:string
  }
  user: SocialUser

  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
  }

  settingsClick(): void {
    var componentId = "video-settings-dropdown-" + this.video.id.toString()
    console.log(componentId)
    if(document.getElementById(componentId).style.display == 'block'){
      document.getElementById(componentId).style.display = 'none'
    }
    else{
      document.getElementById(componentId).style.display = 'block'
    }
  }

  isUserSignedIn(){
    if(this.user == null){
      return false;
    }

    return true
  }

}
