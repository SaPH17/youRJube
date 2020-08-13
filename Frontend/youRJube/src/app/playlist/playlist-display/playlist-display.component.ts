import { getPlaylistQuery } from './../playlist.component';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { DataService } from './../../data.service';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-playlist-display',
  templateUrl: './playlist-display.component.html',
  styleUrls: ['./playlist-display.component.scss']
})
export class PlaylistDisplayComponent implements OnInit {

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

  playlistId:number
  playlist:any

  showDropdown:boolean = false

  constructor(private data: DataService, private apollo: Apollo, private route: ActivatedRoute) { }

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

    this.route.paramMap.subscribe(params => {
      this.playlistId = parseInt(params.get('id'))

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
      })
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

  removeFromPlaylist():void{
    var res = this.playlist.video_id.split(",")

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.video.id){
        res.splice(i, 1)
      }
    }

    var newStr = res.toString()

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
        title: this.playlist.title,
        privacy: this.playlist.privacy,
        thumbnail: this.playlist.thumbnail,
        view: this.playlist.view,
        video_id: newStr
      },
      refetchQueries:[{
        query: getPlaylistQuery,
        variables: { repoFullName: 'apollographql/apollo-client',
                    id: this.playlist.id},
      }]
    }).subscribe(result =>{
      console.log(result);
    }) 
  }

  moveToTop():void{
    var str = this.playlist.video_id
    var res = str.split(',')

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.video.id){
        res.splice(i, 1)
      }
    }

    var newStr = "," + this.video.id + res.toString()
    this.updatePlaylist(newStr)
  }

  moveToBottom():void{
    var str = this.playlist.video_id
    var res = str.split(',')

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.video.id){
        res.splice(i, 1)
      }
    }

    var newStr = res.toString()  + this.video.id + ","
    this.updatePlaylist(newStr)
  }

  updatePlaylist(newStr):void{
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
        title: this.playlist.title,
        privacy: this.playlist.privacy,
        thumbnail: this.playlist.thumbnail,
        view: this.playlist.view,
        video_id: newStr
      },
      refetchQueries:[{
        query: getPlaylistQuery,
        variables: { repoFullName: 'apollographql/apollo-client',
                    id: this.playlist.id},
      }]
    }).subscribe(result =>{
      console.log(result);
    }) 
  }

}
