import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-playlist',
  templateUrl: './channel-playlist.component.html',
  styleUrls: ['./channel-playlist.component.scss']
})
export class ChannelPlaylistComponent implements OnInit {

  channelId: number
  channelPlaylist: any
  playlistLoaded: boolean
  channelHavePlaylist:boolean = false

  constructor(private apollo: Apollo, private router: Router) { }

  ngOnInit(): void {
    
    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])

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
    }).valueChanges.subscribe(result => {
      this.channelPlaylist = result.data.getPlaylistByChannelId

      if(this.channelPlaylist.length != 0){
        this.channelHavePlaylist = true
      }

      for(let i = 0; i < this.channelPlaylist.length; i++){
        if(this.channelPlaylist[i].privacy == "Private"){
          this.channelPlaylist.splice(i,1)
        }
      }

      this.playlistLoaded = true
    })
  }

}
