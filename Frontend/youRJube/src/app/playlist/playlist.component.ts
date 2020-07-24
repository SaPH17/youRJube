import { title } from 'process';
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

const getPlaylistQuery = gql `
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
`

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

  playlistURL:String

  isInputTitle: boolean = false
  isInputDesc: boolean = false
  inputTitle: String
  inputDesc: String

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.playlistVideos = []
      this.playlistId = parseInt(params.get('id'))
      this.playlistURL = "http://localhost:4200/playlist/" + this.playlistId
      this.loadPlaylist()
    })
  }

  toggleInputTitle():void{
    this.isInputTitle = !this.isInputTitle
  }

  toggleInputDesc():void{
    this.isInputDesc = !this.isInputDesc
  }

  toggleSortBy():void{
    if(document.getElementById('dropdown-content').style.opacity == "0"){
      document.getElementById('dropdown-content').style.opacity = "1"
    }
    else{
      document.getElementById('dropdown-content').style.opacity = "0"
    }
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

      if(this.playlist.view - 1 <= 1){
        this.viewCountOutput = this.playlist.view - 1 + " view"
      }
      else{
        this.viewCountOutput = this.playlist.view - 1 + " views"
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
        if(!this.playlistVideos.includes(result.data.getVideoById[0])){
          this.playlistVideos.push(result.data.getVideoById[0])     
        }

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

  sortDateAdded():void{

  }

  sortVideoByOldest():void{
    this.playlistVideos.sort((a, b) => (parseInt(a.id) > parseInt(b.id)) ? 1 : -1)
  }

  sortVideoByLatest():void{
    this.playlistVideos.sort((a, b) => (parseInt(a.id) > parseInt(b.id)) ? -1 : 1)    
  }

  sortPopularity():void{
    this.playlistVideos.sort((a, b)=> (parseInt(a.view) > parseInt(b.view)) ? -1 : 1)
  }

  copyURLToClipboard(){
    var copyText = document.getElementById("url") as HTMLInputElement
    copyText.select()
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy")
  }
  
  showShareModal():void{
    document.getElementById('share-modal').style.visibility = "visible"
  }

  hideShareModal():void{
    document.getElementById('share-modal').style.visibility = "hidden"
  }

  updatePlaylistTitle():void{
    this.apollo.mutate({
      mutation: gql`
        mutation updatePlaylist($id: ID!, $channel_id: ID!, $description: String!, $title: String!, $privacy: String!, $thumbnail: String!
            $view: Int!, $video_id: String!) {
          updatePlaylist(id: $id, input: { 
            channel_id: $channel_id,
            title: $title,
            description: $description,
            privacy: $privacy,
            thumbnail: $thumbnail,
            view: $view,
            video_id: $video_id
          }){
            id,
            video_id
          }
        }
      `,
      variables:{
        id: this.playlist.id,
        channel_id: this.playlist.channel_id,
        description: this.playlist.description,
        title: this.inputTitle,
        privacy: this.playlist.privacy,
        thumbnail: this.playlist.thumbnail,
        view: this.playlist.view,
        video_id: this.playlist.video_id
      },
      refetchQueries: [{
        query: getPlaylistQuery,
        variables: { repoFullName: 'apollographql/apollo-client', id: this.playlistId },
      }],
    }).subscribe(result =>{
      console.log(result);
      this.isInputTitle = false
    })   
  }

  updatePlaylistDescription():void{
    this.apollo.mutate({
      mutation: gql`
        mutation updatePlaylist($id: ID!, $channel_id: ID!, $description: String!, $title: String!, $privacy: String!, $thumbnail: String!
            $view: Int!, $video_id: String!) {
          updatePlaylist(id: $id, input: { 
            channel_id: $channel_id,
            title: $title,
            description: $description,
            privacy: $privacy,
            thumbnail: $thumbnail,
            view: $view,
            video_id: $video_id
          }){
            id,
            video_id
          }
        }
      `,
      variables:{
        id: this.playlist.id,
        channel_id: this.playlist.channel_id,
        description: this.inputDesc,
        title: this.playlist.title,
        privacy: this.playlist.privacy,
        thumbnail: this.playlist.thumbnail,
        view: this.playlist.view,
        video_id: this.playlist.video_id
      },
      refetchQueries: [{
        query: getPlaylistQuery,
        variables: { repoFullName: 'apollographql/apollo-client', id: this.playlistId },
      }],
    }).subscribe(result =>{
      console.log(result);
      this.isInputDesc = false
    })   
  }
}
