import { Apollo } from 'apollo-angular';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-playlist-display',
  templateUrl: './channel-playlist-display.component.html',
  styleUrls: ['./channel-playlist-display.component.scss']
})
export class ChannelPlaylistDisplayComponent implements OnInit {

  @Input('playlist')playlist:{
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

  videoCountOutput: String
  playlistThumbnail: String
  doneLoading:boolean

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    var split = this.playlist.video_id.split(",")

    this.videoCountOutput = (split.length - 2).toString()

    if(split.length > 2){      
      this.apollo.watchQuery<any>({
        query: gql `
          query getVideoById($id : ID!){
            getVideoById(id : $id){
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
          id: parseInt(split[1])
        }
      }).valueChanges.subscribe(result => {
        this.playlistThumbnail = result.data.getVideoById[0].thumbnail
        this.doneLoading = true
      })
    }
  }

}
