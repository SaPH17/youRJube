import { Apollo } from 'apollo-angular';
import { DataService } from './../data.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import gql from 'graphql-tag';

const getPlaylistByChannelId = gql `
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
  `
  
@Component({
  selector: 'app-video-display',
  templateUrl: './video-display.component.html',
  styleUrls: ['./video-display.component.scss']
})

export class VideoDisplayComponent implements OnInit{

  @Input('vid') video:{
    id:String,
    channel_id: String,
    title: String,
    description: String,
    video_url: String,
    thumbnail: String,
    upload_day: number,
    upload_month: number,
    upload_year: number,
    category: string,
    location: string,
    view: number,
    privacy: string,
    is_premium: boolean,
    age_restricted: boolean,
    duration: number
  }

  viewOutput:any
  channel: any
  doneLoading: boolean = false
  user: SocialUser
  userChannel: any
  dateOutput: String

  userPlaylist:any
  showModal:boolean = false
  playlist_title: String
  playlist_privacy: String

  duration: String ="AA"

  settingsOpen:boolean = false;

  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit() {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)
    this.viewOutput = this.convertView(this.video.view - 1)
     this.getDuration(this.video.duration)

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
        id: this.video.channel_id
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById
      
      this.dateOutput = this.convertDate(this.video.upload_day, this.video.upload_month - 1, this.video.upload_year)
      this.doneLoading = true;
    })
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

  settingsClick(): void {
    this.settingsOpen = !this.settingsOpen
  }

  isUserSignedIn(){
    if(this.user == null){
      return false;
    }

    return true
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
      return diff/7 + " week(s) ago"
    }
    else if(diff >= 28 && diff <= 365){
      return diff/28 + " month(s) ago"
    }
    else if(diff > 365){
      return diff/365 + "year(s) ago"
    }
  }

  showPlaylistModal():void{
  
    this.getUserPlaylist()

  }

  hidePlaylistModal():void{
    this.showModal = false
    document.getElementById('playlist-modal').style.visibility = "hidden"

    var id = "create-new-playlist-button-" + this.video.id
    var id2 = "ntitle-" + this.video.id
    var id3 = "nprivacy-" + this.video.id
    var id4 = "nbutton-" + this.video.id
    
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
      document.getElementById('playlist-modal').style.visibility = "visible"
    })
  }

  checkChecked(playlist):boolean{
    if(playlist.video_id.includes((this.video.id).toString())){
      return true
    }
    return false  
  }

  toggleCreatePlaylist():void{    
    var id = "create-new-playlist-button-" + this.video.id
    var id2 = "ntitle-" + this.video.id
    var id3 = "nprivacy-" + this.video.id
    var id4 = "nbutton-" + this.video.id

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

  getDuration(v):void{

    var time = v
    var hour:number
    var minute:number
    var second: number

    if(time > 3600){
      hour = Math.floor(time / 3600)
      minute = Math.floor((time - (3600 * hour)) / 60)      
      second = Math.floor(((time - (3600 * hour)) - minute * 60))

      if(hour <= 9 ){
        this.duration =  "0" + hour   
      }
      else{
        this.duration = hour.toString()
      }

      this.duration += ":"

      if(minute <= 9){
        this.duration += "0" + minute 
      }
      else{
        this.duration += minute.toString()
      }

      this.duration += ":"

      if(second <= 9){
        this.duration += "0" + second
      }
      else{
        this.duration += second.toString()
      }
    }
    else if(time > 60){
      minute = Math.floor(time / 60)
      second = Math.floor((time - minute * 60))

      if(minute <= 9){
        this.duration = "0" + minute
      }
      else{
        this.duration = minute.toString()  
      }

      this.duration += ":"

      if(second <= 9){
        this.duration += "0" + second
      }
      else{
        this.duration += second.toString()
      }
    }
    else{
      second = Math.floor(time)

      if(second <= 9){
        this.duration = "00:0" + second
      }
      else{
        this.duration = "00:" + second.toString()
      }
    }
  }

}
