import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-home',
  templateUrl: './channel-home.component.html',
  styleUrls: ['./channel-home.component.scss']
})
export class ChannelHomeComponent implements OnInit {

  channelId: number
  videos: any
  randomVideos: any = []
  takenVideo = []
  playlist: any
  randomPlaylist = []
  takenPlaylist = []

  constructor(private router: Router, private apollo: Apollo) { }

  ngOnInit(): void {
    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])

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
      this.getRandomVideos()
    })

    this.getPlaylist()
  }

  getPlaylist(){
    this.apollo.watchQuery<any>({
      query: gql `
        query getPlaylistByChannelId($channel_id: ID!){
          getPlaylistByChannelId(channel_id: $channel_id){
            id,
            channel_id,
            title,
            description,
            privacy,
            thumbnail,
            last_updated_day,
            last_updated_month,
            last_updated_year,
            view,
            video_id,
          }
        }    
      `,
      variables:{
        channel_id: this.channelId
      }
    }).valueChanges.subscribe(result =>{
      this.playlist = result.data.getPlaylistByChannelId
      this.getRandomPLaylist()
    })
  }

  getRandomPLaylist():void{
    for(let i = 0; i < 3; i++){
      let random = Math.floor(Math.random() * this.playlist.length)

      if(i == this.playlist.length){
        break
      }

      if(!this.takenPlaylist.includes(this.playlist[random].id)){        
        this.randomPlaylist.push(this.playlist[random])
        this.takenPlaylist.push(this.playlist[random].id)
      }
      else{
        i--
      }
    }
  }

  getRandomVideos():void{
    for(let i = 0; i < 5; i++){
      let random = Math.floor(Math.random() * this.videos.length)
      
      if(i == this.videos.length){
        break
      }

      if(!this.takenVideo.includes(this.videos[random].id)){        
        this.randomVideos.push(this.videos[random])
        this.takenVideo.push(this.videos[random].id)
      }
      else{
        i--
      }
    }
  }

}
