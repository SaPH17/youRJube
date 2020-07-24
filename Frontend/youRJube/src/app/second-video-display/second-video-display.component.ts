import { Apollo } from 'apollo-angular';
import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';
import { title } from 'process';

@Component({
  selector: 'app-second-video-display',
  templateUrl: './second-video-display.component.html',
  styleUrls: ['./second-video-display.component.scss']
})
export class SecondVideoDisplayComponent implements OnInit {

  @Input('vid')video:{
    id
    channel_id,
    thumbnail,
    title,
    description,
    view,
    upload_day,
    upload_month,
    upload_year,
  }

  dateOutput: String
  viewOutput: String
  userDB: any
  userChannel: any
  playlist_title: String
  playlist_privacy: String
  showModal: boolean = false
  userPlaylist: any
  titleOutput:String

  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    this.data.currentChannelObject.subscribe(userChannelObject => this.userChannel = userChannelObject)
    this.titleOutput = this.convertTitle(this.video.title)

    this.dateOutput  = this.convertDate(this.video.upload_day, this.video.upload_month - 1, this.video.upload_year)
    this.viewOutput = this.convertView(this.video.view - 1)
    
  }

  convertTitle(title):String{
    if(title.length >= 50){
      return title.substring(0, 50) + "..."
    }
    else{
      return title
    }
  }

  convertDate(day, month, year){
    var currDate = new Date()

    var date = new Date(parseInt(year), parseInt(month), parseInt(day))

    var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

    if(diff == 0){
      return "Today"
    }
    else if(diff < 7){
      return diff + " day(s) ago"
    }
    else if(diff >= 7 && diff <= 28){
      return Math.floor(diff/7) + " week(s) ago"
    }
    else if(diff >= 28 && diff <= 365){
      return Math.floor(diff/28) + " month(s) ago"
    }
    else if(diff > 365){
      return Math.floor(diff/365)+ "year(s) ago"
    }
  }

  convertView(view){
    if(view >= 1000 && view < 1000000){
      return (view / 1000).toFixed(1) + "K views"
    }
    else if(view <= 1){
      return view + " view"
    }
    else if(view < 1000){
      return view + " views"
    }
    else if(view >= 1000000){
      return (view / 1000000).toFixed(1) + "M views" 
    }
  }

  isUserSignedIn(){
    if(this.userDB == null){
      return false;
    }

    return true
  }

  settingsClick(): void {
    var componentId = "video-settings-dropdown-" + this.video.id.toString()
    console.log(componentId)
    if(document.getElementById(componentId).style.display == 'block'){
      document.getElementById(componentId).style.display = 'none'
    }
    else{
      document.getElementById(componentId).style.display = 'block'
    }
  }

  showPlaylistModal():void{
  
    console.log("A");
    
    this.getUserPlaylist()

  }

  hidePlaylistModal():void{
    this.showModal = false
    document.getElementById('playlist-modal4').style.visibility = "hidden"

    var id = "create-new-playlist-button4-" + this.video.id
    var id2 = "ntitle4-" + this.video.id
    var id3 = "nprivacy4-" + this.video.id
    var id4 = "nbutton4-" + this.video.id
    
    document.getElementById(id).style.display = "flex"
    document.getElementById(id2).style.display = "none"
    document.getElementById(id3).style.display = "none"
    document.getElementById(id4).style.display = "none"
  }

  addToPlaylist(e, value):void{
    var newStr: String

    if(e.target.checked == true){
      newStr = value.video_id +  this.video.id + "," 
    }
    else{
      var str = value.video_id
      var res = str.split(",")

      for(let i = 0; i < res.length; i++){
        if(res[i] == this.video.id){
          res.splice(i, 1)
        }
      }

      newStr = res.toString()
    }
    
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
        id: value.id,
        channel_id: value.channel_id,
        description: value.description,
        title: value.title,
        privacy: value.privacy,
        thumbnail: value.thumbnail,
        view: value.view,
        video_id: newStr
      },
      // refetchQueries: [{
      //   query: getComputerQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' },
      // }],
    }).subscribe(result =>{
      console.log(result);
      
      console.log(e.target.checked);
    })    

  }

  getUserPlaylist():void{            

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
        channel_id: this.userChannel.id
      }
    }).valueChanges.subscribe(result => {
      this.userPlaylist = result.data.getPlaylistByChannelId
      console.log(this.userPlaylist);
      
      this.showModal = true
      console.log(this.showModal);
      
      document.getElementById('playlist-modal4').style.visibility = "visible"
    })
  }

  checkChecked(playlist):boolean{
    if(playlist.video_id.includes((this.video.id).toString())){
      return true
    }
    return false  }

  toggleCreatePlaylist():void{    
    var id = "create-new-playlist-button4-" + this.video.id
    var id2 = "ntitle4-" + this.video.id
    var id3 = "nprivacy4-" + this.video.id
    var id4 = "nbutton4-" + this.video.id

    document.getElementById(id).style.display = "none"
    document.getElementById(id2).style.display = "block"
    document.getElementById(id3).style.display = "block"
    document.getElementById(id4).style.display = "block"

  }

  createNewPlaylist():void{
    if(this.playlist_privacy != "" && this.playlist_title != ""){      
      
      this.apollo.mutate<any>({
        mutation: gql`
          mutation createPlaylist($channel_id: ID!, $title: String!, $privacy: String!, $video_id: String!){
            createPlaylist(input: {
              channel_id: $channel_id,
              title: $title,
              description: "No description given",
              privacy: $privacy,
              thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2Fdefault_thumbnail.png?alt=media&token=d8d25ad6-7273-42f0-a059-d50af36c10ac",
              view: 1,
              video_id: $video_id
            }){
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
              video_id
            }
          }
        `,
        variables:{
          channel_id: this.userChannel.id,
          title: (this.playlist_title).toString(),
          privacy: (this.playlist_privacy).toString(),
          video_id: "," + this.video.id + ","
        }
      }).subscribe(result => {

        console.log(result)
      })
    }
  }

  changePrivacyValue(e):void{
    console.log(e);
    
    this.playlist_privacy = e.target.value
    console.log(this.playlist_privacy);
    
  }

}
