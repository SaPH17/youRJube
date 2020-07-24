import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private location: Location,
    private apollo: Apollo) { }

  playlist: any
  doneLoading: boolean = false
  playlistId: number
  playlistVideos: any = []
  channel:any

  playlistCountOutput: String
  viewCountOutput: String
  lastUpdatedOutput: String

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.playlistVideos = []
      this.playlistId = parseInt(params.get('id'))
      this.loadPlaylist()
    })
  }

  loadPlaylist():void{
    this.apollo.watchQuery<any>({
      query: gql `
        query getPlaylistById($id: ID!){
          getPlaylistById(id: $id){
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
        id: this.playlistId
      }
    }).valueChanges.subscribe(result =>{
      this.playlist = result.data.getPlaylistById[0]

      if(this.playlist.view <= 1){
        this.viewCountOutput = this.playlist.view + " view"
      }
      else{
        this.viewCountOutput = this.playlist.view + " views"
      }

      this.lastUpdatedOutput = "Updated " +  this.convertLastUpdated(this.playlist.last_updated_day, 
        this.playlist.last_updated_month, this.playlist.last_updated_year)

      this.loadChannelInformation()
      this.loadPLaylistVideo()
    })
  }

  convertLastUpdated(day, month, year):String{
    var currDate = new Date()

    var date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

    var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

    if(diff == 0){
      return "Today"
    }
    else if(diff == 1){
      return diff + " day ago"
    }
    else{
      return diff + " days ago"
    }
  }

  loadPLaylistVideo():void{

    var res = this.playlist.video_id.split(',')

    for(let i = 1; i < res.length - 1; i++){
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
          id: res[i]
        }
      }).valueChanges.subscribe(result => {
        this.playlistVideos.push(result.data.getVideoById[0])     

        if( this.playlistVideos.length <= 1){
          this.playlistCountOutput = this.playlistVideos.length + " video"
        }
        else{
          this.playlistCountOutput = this.playlistVideos.length + " videos"
        }
      })
    }

    this.doneLoading = true

  }

  loadChannelInformation():void{
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
        id: this.playlist.channel_id
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById[0]
    })
  }

}
