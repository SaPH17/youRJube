import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

export const getChannelVideoQuery = gql `
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
      like,
      dislike,
      duration,
    }
  }
`

@Component({
  selector: 'app-channel-edit-videos',
  templateUrl: './channel-edit-videos.component.html',
  styleUrls: ['./channel-edit-videos.component.scss']
})
export class ChannelEditVideosComponent implements OnInit {

  channelId: number
  videos:any
  haveVideos:boolean = false
  doneLoading:boolean = true

  constructor(private apollo: Apollo, private router: Router) { }

  ngOnInit(): void {
    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])

    this.apollo.watchQuery<any>({
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
            like,
            dislike,
            duration,
          }
        }
      `,
      variables:{
        channel_id: this.channelId
      }
    }).valueChanges.subscribe(result => {
      
      this.videos = result.data.getVideoByChannelId
      console.log(this.videos);
      

      if(this.videos.length != 0){
        this.haveVideos = true
      }

      this.doneLoading = true
    })
  }

}
