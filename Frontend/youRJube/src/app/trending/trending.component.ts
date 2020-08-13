import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent implements OnInit {

  videos: any
  channel: any
  doneLoading: boolean = false

  billingHistory: any
  userHavePremium: boolean = false
  userDB: any

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)

    this.apollo.watchQuery<any>({
      query: gql`
        query getPremiumSubscriptionByUserId($user_id: ID!){
          getPremiumSubscriptionByUserId(user_id: $user_id){
            id,
            user_id,
            start_day,
            start_month,
            start_year,
            end_day,
            end_month,
            end_year,
            plan,
          }
        }
      `,
      variables:{
        user_id: this.userDB.id
      }
    }).valueChanges.subscribe(result => {
      
      this.billingHistory = result.data.getPremiumSubscriptionByUserId
      this.getCurrentPlan()

    })

  }

  loadVideo():void{
    this.apollo.query<any>({
      query: gql `
        query getTrendingVideo($is_premium: String!){
          getTrendingVideo(is_premium: $is_premium){
            id,
            channel_id,
            title,
            description,
            video_url,
            thumbnail,
            upload_day,
            upload_month,
            upload_year
            category,
            location,
            view,
            privacy,
            is_premium,
            age_restricted,
            like,
            dislike,
            duration
          }
        }
      `,
      variables:{
        is_premium: this.userHavePremium.toString()
      }
    }).subscribe(result =>{
      this.videos = result.data.getTrendingVideo
      this.videos.filter(a => this.getDayDiff(a) < 7)
      console.log(this.videos);
      this.doneLoading = true
    })
  }

  getCurrentPlan():void{
    var date = new Date()

    this.billingHistory.forEach(e => {

      var from = new Date(parseInt(e.start_year), parseInt(e.start_month) - 1, parseInt(e.start_day))
      var to = new Date(parseInt(e.end_year), parseInt(e.end_month) - 1, parseInt(e.end_day))
      
      if(date > from && date < to){
        this.userHavePremium = true
      }
    });  

    this.loadVideo()
    
  }
  
  getDayDiff(v):number{
    var currDate = new Date()
    var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

    var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

    return diff
  }

}
