import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-about',
  templateUrl: './channel-about.component.html',
  styleUrls: ['./channel-about.component.scss']
})
export class ChannelAboutComponent implements OnInit {

  channel: any
  channelId: number
  dateOutput: String
  videos: any
  viewCount: number = 0
  viewCountOutput: String

  links: any
  linkLoaded:boolean = false

  constructor(private router: Router, private apollo: Apollo) { }

  ngOnInit(): void {

    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])
    
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
            join_year,
            subscriber_count
          }
        }
      `,
      variables:{
        id: this.channelId
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById[0]
      this.dateOutput = this.convertMonthToText(this.channel.join_month) + " " + this.channel.join_day + ", " + this.channel.join_year
    
      this.countVideoView()
      this.loadChannelLinks()
    })
  }

  countVideoView():void{
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
        channel_id: this.channelId
      }
    }).subscribe(result => {
      this.videos = result.data.getVideoByChannelId

      for(let i = 0; i < this.videos.length; i++){
        this.viewCount += this.videos[i].view
      }

      if(this.viewCount <= 1){
        this.viewCountOutput = this.convertViewToCommaString(this.viewCount) + " view"
      }
      else{
        this.viewCountOutput = this.convertViewToCommaString(this.viewCount) + " views"
      }

    })
  }

  convertViewToCommaString(num){
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }

  loadChannelLinks():void{
    this.apollo.watchQuery<any>({
      query: gql `
      query getChannelSocialMediaByChannelId($channel_id: ID!){
        getChannelSocialMediaByChannelId(channel_id: $channel_id){
          id,
          channel_id,
          social_media,
          link,
        }
      }
    `,
      variables:{
        channel_id: this.channelId
      }
    }).valueChanges.subscribe(result => {
      this.links = result.data.getChannelSocialMediaByChannelId
      this.linkLoaded = true
    })
  }


  convertMonthToText(month):string{
    if(month == 1){
      return "Jan"
    }
    else if(month == 2){
      return "Feb"
    }
    else if(month == 3){
      return "Mar"
    }
    else if(month == 4){
      return "Apr"
    }
    else if(month == 5){
      return "May"
    }
    else if(month == 6){
      return "Jun"
    }
    else if(month == 7){
      return "Jul"
    }
    else if(month == 8){
      return "Aug"
    }
    else if(month == 9){
      return "Sep"
    }
    else if(month == 10){
      return "Oct"
    }
    else if(month == 11){
      return "Nov"
    }
    else{
      return "Dec"
    }
  }

}
