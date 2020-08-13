import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

export const getPlaylistQuery = gql `
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

const getUserSubsQuery = gql`
  query getUserSubscriptionByUserIdAndChannelId($user_id: ID!, $channel_id: ID!){
    getUserSubscriptionByUserIdAndChannelId(user_id: $user_id, channel_id: $channel_id){
      id,
      user_id,
      channel_id,
      subscribe_day,
      subscribe_month,
      subscribe_year,
      should_notify
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
    private apollo: Apollo, private data: DataService) { }

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

  lastKey:number
  observer: any
  allLoaded:boolean = false

  userSubCondition: number = 0
  userDB: any
  userChannel:any

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.data.currentUserDBObject.subscribe(currentUserDBObject => this.userDB = currentUserDBObject)
      this.data.currentChannelObject.subscribe(currentChannelObject => this.userChannel = currentChannelObject)
      this.lastKey = 4
      this.playlistVideos = []
      this.playlistId = parseInt(params.get('id'))
      this.playlistURL = "http://localhost:4200/playlist/" + this.playlistId

      this.loadPlaylist()
    })
  }

  validatePlaylist():boolean{
    if(this.playlist.privacy == "Private" && this.playlist.channel_id != this.userChannel.id){
      return false
    }

    return true;
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
      query: getPlaylistQuery,
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

  loadPlaylistVideos(ids, length, curr, loadedVideo):void{

    if(curr == length){

      console.log("SELESAI");
      

      if( this.playlistVideos.length <= 1){
        this.playlistCountOutput = this.playlistVideos.length + " video"
      }
      else{
        this.playlistCountOutput = this.playlistVideos.length + " videos"
      }

      this.doneLoading = true

      return
    }    

    this.apollo.query<any>({
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
        id: ids[curr]
      }
    }).subscribe(result => {      
      if(!loadedVideo.includes(result.data.getVideoById[0].id)){
        this.playlistVideos.push(result.data.getVideoById[0])     
        loadedVideo.push(result.data.getVideoById[0].id)
      }
      this.loadPlaylistVideos(ids, length, curr + 1, loadedVideo)
    })
  }
  
  loadPLaylistVideo():void{
    var res = this.playlist.video_id.split(',')
    this.loadPlaylistVideos(res, res.length - 1, 1, [])
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
        id: this.playlist.channel_id
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById[0]
      this.userHasSubscribed()

    })
  }

  sortDateAdded():void{

  }

  sortVideoByOldest():void{
    this.playlistVideos.sort((a, b) => (parseInt(a.id) > parseInt(b.id)) ? 1 : -1)

    var str = ","
    for(let i = 0; i < this.playlistVideos.length; i++){
      str += this.playlistVideos[i].id + ","
    }

    this.updatePlaylist(str)
  }

  sortVideoByLatest():void{
    this.playlistVideos.sort((a, b) => (parseInt(a.id) > parseInt(b.id)) ? -1 : 1)   

    var str = ","
    for(let i = 0; i < this.playlistVideos.length; i++){
      str += this.playlistVideos[i].id + ","
    }
    this.updatePlaylist(str)
  }

  sortPopularity():void{
    this.playlistVideos.sort((a, b)=> (parseInt(a.view) > parseInt(b.view)) ? -1 : 1)

    var str = ","
    for(let i = 0; i < this.playlistVideos.length; i++){
      str += this.playlistVideos[i].id + ","
    }
    this.updatePlaylist(str)
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
    if(this.inputDesc == ""){
      this.inputDesc = "No description given"
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

  updatePlaylistPrivacy(e):void{
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
        privacy: e,
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
    }) 
  }

  showSubscribeButton():boolean{
    if(this.userChannel == undefined){
      return true
    }
    else if(this.channel.id != this.userChannel.id){
      return true
    }

    return false
  }

  subscribeToChannel():void{

    if(this.userDB){
      
      this.apollo.mutate<any>({
        mutation: gql`
          mutation createUserSubscription($user_id: ID!, $channel_id: ID!, $should_notify: String!){
            createUserSubscription(
              input: {
                user_id: $user_id,
                channel_id: $channel_id,
                should_notify: $should_notify
              }
            ){
              id
            }
          }
        `,
        variables:{
          user_id: this.userDB.id,
          channel_id: this.channel.id,
          should_notify: "false"
        },
        refetchQueries:[{
          query: getUserSubsQuery,
          variables: { repoFullName: 'apollographql/apollo-client',
                      user_id: this.userDB.id,
                      channel_id: this.channel.id, },
        }]
      }).subscribe(result => {
        console.log(result)
      })

      this.updateChannelSubs(this.channel.subscriber_count + 1)

    }
  }

  userHasSubscribed():void{
    var res

    if(this.userDB == undefined || this.userDB == null){
      this.userSubCondition = 0
    }

    console.log("AAA");
    

    this.apollo.watchQuery<any>({
      query: gql`
        query getUserSubscriptionByUserIdAndChannelId($user_id: ID!, $channel_id: ID!){
          getUserSubscriptionByUserIdAndChannelId(user_id: $user_id, channel_id: $channel_id){
            id,
            should_notify
          }
        }
      `,
      variables:{
        user_id: this.userDB.id,
        channel_id: this.channel.id,
      }
    }).valueChanges.subscribe(result => {
      console.log(result)
      res = result.data.getUserSubscriptionByUserIdAndChannelId[0]

      if(res == undefined){
        this.userSubCondition = 0
      }
      else if(res.should_notify == "false"){
        this.userSubCondition = 1
      }
      else if(res.should_notify == "true"){
        this.userSubCondition = 2
      }
      else{
        this.userSubCondition = 0
      }
      
    })

  }

  unsubscribeToChannel():void{
    if(this.userDB){
      this.apollo.mutate({
        mutation: gql`
          mutation deleteUserSubscription($user_id: ID!, $channel_id: ID!){
            deleteUserSubscription(user_id: $user_id, channel_id: $channel_id)
          }
        `,
        variables:{
          user_id: this.userDB.id,
          channel_id: this.channel.id,
        },
        refetchQueries: [{
          query: getUserSubsQuery,
          variables: { repoFullName: 'apollographql/apollo-client' ,
                      user_id: this.userDB.id,
                      channel_id: this.channel.id,
                    },
        }],
      }).subscribe(result =>{
        console.log(result);
      })    
    }

    this.updateChannelSubs(this.channel.subscriber_count - 1)

  }

  changeUserSubsNotif(value):void{

    this.apollo.mutate({
      mutation: gql`
        mutation updateUserSubscription($user_id: ID!, $channel_id: ID!, $should_notify: String!){
          updateUserSubscription(user_id: $user_id, channel_id: $channel_id, input:{
            user_id: $user_id,
            channel_id: $channel_id,
            should_notify: $should_notify,
          }){
            id
          }
        }
      `,
      variables:{
        user_id: this.userDB.id,
        channel_id: this.channel.id,
        should_notify: value
      },
      refetchQueries: [{
        query: getUserSubsQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                    user_id: this.userDB.id,
                    channel_id: this.channel.id,
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      
    })    
  }

  updateChannelSubs(newSubs){
    this.apollo.mutate<any>({
    mutation: gql`
      mutation updateChannel($id: ID!, $user_id: ID!, $name: String!, $background_image: String!, $icon: String!, $description: String!
          $subscriber_count: Int!){
        updateChannel(id: $id, input:{
          user_id: $user_id,
          name: $name,
          background_image: $background_image,
          icon: $icon,
          description: $description,
          subscriber_count: $subscriber_count
        }){
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
      id: this.channel.id,
      user_id: this.channel.user_id,
      name: this.channel.name,
      background_image: this.channel.background_image,
      icon: this.channel.icon,
      description: this.channel.description,
      subscriber_count: newSubs
    },
    // refetchQueries: [{
    //   query: getChannelQuery,
    //   variables: { repoFullName: 'apollographql/apollo-client' ,
    //                 id: this.channel.id
    //             },
    // }],
  }).subscribe(result => {
    console.log(result);
    this.channel = result.data.updateChannel
    })
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
    }).subscribe(result =>{
      console.log(result);
    }) 
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.playlistVideos, event.previousIndex, event.currentIndex);

    var str = ","
    for(let i = 0; i < this.playlistVideos.length; i++){
      str += this.playlistVideos[i].id + ","
    }

    this.updatePlaylist(str)
  }
  
}
