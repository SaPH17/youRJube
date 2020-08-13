import { Apollo } from 'apollo-angular';
import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-second-video-display',
  templateUrl: './second-video-display.component.html',
  styleUrls: ['./second-video-display.component.scss']
})
export class SecondVideoDisplayComponent implements OnInit {

  @Input('vid')video:{
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
    is_premium: string,
    age_restricted: string,
    duration: number
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
  channel: any
  duration: string
  descOutput: String

  billingHistory: any
  userHavePremium: boolean = false
  premiumValidation:boolean = false

  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    this.data.currentChannelObject.subscribe(userChannelObject => this.userChannel = userChannelObject)
    this.titleOutput = this.convertTitle(this.video.title)
    this.getDuration(this.video.duration)
    this.loadChannelInformation()

    this.dateOutput  = this.convertDate(this.video.upload_day, this.video.upload_month - 1, this.video.upload_year)
    this.viewOutput = this.convertView(this.video.view - 1)
    this.descOutput = this.convertDescription(this.video.description)

    this.apollo.watchQuery<any>({
      query: gql`
        query getPremiumSubscriptionByUserId($user_id: ID!){
          getPremiumSubscriptionByUserId(user_id: $user_id){
            id,
            user_id,
            start_day,
            start_month,
            start_year,
            end_day,
            end_month,
            end_year,
            plan,
          }
        }
      `,
      variables:{
        user_id: this.userDB.id
      }
    }).valueChanges.subscribe(result => {
      
      this.billingHistory = result.data.getPremiumSubscriptionByUserId
      this.getCurrentPlan()

    })
  }

  validatePremium():void{
    if(this.video.is_premium == "true" && this.userHavePremium){
      this.premiumValidation = true
    }
    else if(this.video.is_premium == "false"){
      this.premiumValidation = true
    }
    else{
      this.premiumValidation = false
    }
  }

  getCurrentPlan():void{
    var date = new Date()

    this.billingHistory.forEach(e => {

      var from = new Date(parseInt(e.start_year), parseInt(e.start_month) - 1, parseInt(e.start_day))
      var to = new Date(parseInt(e.end_year), parseInt(e.end_month) - 1, parseInt(e.end_day))
      
      if(date > from && date < to){
        this.userHavePremium = true
      }
    });  
    
    this.validatePremium()
  }

  convertDescription(v):String{
    if(v.length > 150){
      return v.substring(0, 150) + "..."
    }
    return v
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
            join_year,
            subscriber_count
          }
        }
      `,
      variables:{
        id: this.video.channel_id
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById[0]
    })
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
    return false  
  }

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
