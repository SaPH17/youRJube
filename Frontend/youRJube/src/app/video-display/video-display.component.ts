import { Apollo } from 'apollo-angular';
import { DataService } from './../data.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import gql from 'graphql-tag';

@Component({
  selector: 'app-video-display',
  templateUrl: './video-display.component.html',
  styleUrls: ['./video-display.component.scss']
})
export class VideoDisplayComponent implements OnInit{

  // @Input('vid') video: {id:BigInteger, channel_id:BigInteger, title:string, description:string, upload_date:Date, 
  //   category:string, location:string, view: BigInteger, privacy: string, isPremium: boolean, ageRestricted: boolean}

  @Input('vid') video:{
    id:String,
    channel_id: String,
    title: String,
    description: String,
    video_url: String,
    thumbnail: String,
    upload_day: number,
    upload_month: number,
    upload_year: number,
    category: string,
    location: string,
    view: number,
    privacy: string,
    is_premium: boolean,
    age_restricted: boolean
  }

  channel: any
  doneLoading: boolean = false
  user: SocialUser
  dateOutput: String

  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit() {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
    

    this.apollo.query<any>({
      query: gql `
        query getChannelById($id: ID!){
          getChannelById(id: $id){
            id,
            user_id,
            name,
            background_image,
            icon,
            description,
            join_day,
            join_month,
            join_year
          }
        }
      `,
      variables:{
        id: this.video.channel_id
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById
      
      this.dateOutput = this.convertDate(this.video.upload_day, this.video.upload_month - 1, this.video.upload_year)
      this.doneLoading = true;
    })
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

  convertDate(day, month, year){
    var currentDate = new Date()
    
    if(currentDate.getDate() == day){
      return "Today"
    }
    else if(currentDate.getMonth() == month && currentDate.getDate() - day < 7){
      return (currentDate.getDate() - day).toString() + " day(s) ago"
    }
    else if(currentDate.getMonth() == month && currentDate.getDate() - day > 7 ){
      return (Math.floor((currentDate.getDate() - day) / 7)).toString() + " week(s) ago"
    }
    else if(currentDate.getFullYear() == year){
      return (currentDate.getMonth() - month).toString() + " month(s) ago"
    }
    else if(currentDate.getFullYear() - year > 0){
      return (currentDate.getFullYear() - year ).toString() + " year(s) ago"
    }
  }
}
