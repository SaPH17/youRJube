import { Apollo } from 'apollo-angular';
import { DataService } from './../data.service';
import { SocialUser } from 'angularx-social-login';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  videos = []
  user: SocialUser
  userDB: any
  channelIds = []
  doneLoading: boolean = false
  todayVideos = []
  thisWeekVideos = []
  thisMonthVideos = []

  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    console.log(this.userDB);
    
    if(this.userDB != undefined){      
      this.loadUserSubscribedChannel()
    }
  }

  loadUserSubscribedChannel():void{
    this.apollo.watchQuery<any>({
      query: gql `
        query getUserSubscriptionByUserId($user_id: ID!){
          getUserSubscriptionByUserId(user_id: $user_id){
            id,
            user_id,
            channel_id,
            subscribe_day,
            subscribe_month,
            subscribe_year,
            should_notify
          }
        }
      `,
      variables:{
        user_id: this.userDB.id
      }
    }).valueChanges.subscribe(result =>{
      var val = result.data.getUserSubscriptionByUserId
      console.log(result);
      
      for(let i = 0; i < val.length; i++){
        this.channelIds.push(val[i].channel_id)
      }

      this.loadSubscribedVideo()

    })
  }

  loadSubscribedVideo():void{
    for(let i = 0; i < this.channelIds.length; i++){
      this.apollo.query<any>({
        query: gql `
          query getVideoByChannelId($channel_id: ID!){
            getVideoByChannelId(channel_id: $channel_id){
              id,
              channel_id,
              title,
              description,
              video_url,
              thumbnail,
              upload_day,
              upload_month,
              upload_year,
              category,
              location,
              view,
              privacy,
              is_premium,
              age_restricted,
              duration,
            }
          }
        `,
        variables:{
          channel_id: this.channelIds[i]
        }
      }).subscribe(result => {
        console.log(result);
        
        this.videos = this.videos.concat(result.data.getVideoByChannelId)
        console.log(this.videos);
        
        this.filterTodayVideo()    
        this.filterThisWeekVideo()
        this.filterThisMonthVideo()   
        
        this.doneLoading = true;
      })
    }
  }

  filterTodayVideo():void{
    var currDate = new Date()

    for(let i = 0; i < this.videos.length; i++){
      var v = this.videos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff == 0){
        this.todayVideos.push(v)
      }
    }
  }

  filterThisWeekVideo():void{
    var currDate = new Date()

    for(let i = 0; i < this.videos.length; i++){
      var v = this.videos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff =(currDate.getTime() - date.getTime()) / 1000;
      diff = Math.floor(diff /= (60 * 60 * 24 * 7))

      if(diff == 0){
        this.thisWeekVideos.push(v)
      }
    }
  }

  filterThisMonthVideo():void{
    var currDate = new Date()

    for(let i = 0; i < this.videos.length; i++){
      var v = this.videos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff;
      diff = (currDate.getFullYear() - date.getFullYear()) * 12;
      diff -= date.getMonth();
      diff += currDate.getMonth();

      if(diff == 0){
        this.thisMonthVideos.push(v)
      }
    }
  }

  isUserSignedIn():boolean {
    if(this.user == null){
      return false;
    }

    return true
  }
}
