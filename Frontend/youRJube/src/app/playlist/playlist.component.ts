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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
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
      console.log(this.playlist);
      this.doneLoading = true
      console.log(this.doneLoading);
      
      console.log("selesai");      
    })
  }

}
