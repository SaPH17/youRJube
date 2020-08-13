import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import gql from 'graphql-tag';

export const getCommentQuery2 = gql `
  query getCommentByVideoId($video_id: ID!){
    getCommentByVideoId(video_id: $video_id){
      id,
      video_id,
      channel_id,
      content,
      like,
      dislike,
      day,
      month,
      year
    }
  }
`

const getCommentQuery = gql `
  query getCommentByVideoId($video_id: ID!){
    getCommentByVideoId(video_id: $video_id){
      id,
      video_id,
      channel_id,
      content,
      like,
      dislike,
      day,
      month,
      year
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
const getVideoQuery = gql `
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
    }
}
`

const getChannelQuery = gql `
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
`

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
  selector: 'app-playlist-watch',
  templateUrl: './playlist-watch.component.html',
  styleUrls: ['./playlist-watch.component.scss']
})

export class PlaylistWatchComponent implements OnInit {

  firstTime:boolean = true
  relatedVideos: any
  relatedVideoLoaded: boolean = false

  video: any
  viewOutput: String
  dateOutput: String
  likeOutput: String
  likeCount: number
  dislikeCount:number
  totalLikeAndDislike: number
  dislikeOutput
  doneLoading:boolean = false

  descriptionLoaded:boolean = false;
  channel:any
  subscriberCountOutput: String
  validCommentInput:boolean = false

  userDB: any
  userChannel: any

  commentInput: String = ""
  userPlaylist: any
  showModal: boolean 
  playlist_title: String
  playlist_privacy: String

  comments: any
  commentsLoaded:boolean = false
  commentCountOutput: String

  videoURL: String
  currentTime: String
  userSubCondition: number = 0

  isInput:boolean = false

  videoTime: any

  lastKey: number
  commentObserver: any

  currLocation: any
  restrictedMode:any

  autoplay:boolean = false

  currPlaylist:any
  playlistVideos = []
  index:string

  alreadyLoadedVideoIds = []

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private apollo: Apollo,
    private data: DataService,
    private elRef: ElementRef,
    private router: Router) { }

  ngOnInit(): void {

    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    this.data.locationObject.subscribe(locationObject => this.currLocation = locationObject)
    this.data.restrictedModeObject.subscribe(restrictedModeObject => this.restrictedMode = restrictedModeObject)

    this.route.paramMap.subscribe(params => {

      const playlistId = params.get('id');    
      this.index = params.get('index')

      this.lastKey = 5

      this.apollo.query<any>({
        query: getPlaylistQuery,
        variables:{
          id: playlistId.toString()
        }
      }).subscribe(result =>{
        this.currPlaylist = result.data.getPlaylistById[0]
        this.loadPLaylistVideo()
        
        var str = this.currPlaylist.video_id
        var res = str.split(',')
      
        var videoId = res[this.index]        
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
            id: videoId
          }
        }).valueChanges.subscribe(result => {
          this.video = result.data.getVideoById[0]      
          
          this.viewOutput = this.convertView(this.video.view - 1)
          this.dateOutput = this.convertMonthToText(this.video.upload_month) + " " + this.video.upload_day + ", " + this.video.upload_year
          this.likeOutput = this.convertLikeToText(this.video.like)
          this.dislikeOutput = this.convertLikeToText(this.video.dislike)
          this.likeCount = this.video.like - 1
          this.dislikeCount = this.video.dislike -1
          this.totalLikeAndDislike = this.video.like - 1 + this.video.dislike - 1
          this.videoURL = "http://localhost:4200/watch/" + this.video.id
          
  
          this.loadChannelInformation()
          if(this.firstTime){
            this.updateVideoView(this.video.view + 1)
          }
          this.loadRelatedVideo()
          
          this.doneLoading = true

          document.onkeydown = (e) => {

            var video = (document.getElementsByTagName('mat-video')[0] as HTMLVideoElement).querySelector('video')
    
            if(e.keyCode ==  74){
              e.preventDefault();
              video.currentTime -= 10
            }
            else if(e.keyCode == 75){
              e.preventDefault();
              if(video.paused){
                video.play()
              }
              else{
                video.pause()
              }
            }
            else if(e.keyCode == 76){
              e.preventDefault();
              video.currentTime += 10
            }
            else if(e.keyCode == 38){
    
              e.preventDefault();
              var currVolume = video.volume
              if(currVolume != 1){
                try {
                  var x = currVolume + 0.02;
                  video.volume = x;
                  var a = (((video.closest("mat-video").querySelector("mat-volume-control")
                  .querySelector("mat-slider").querySelector(".mat-slider-thumb-container"))) as HTMLElement);
                  var min = (1-x)*100;
                  var c = "translate(-" + min +"%)";
                  a.style.transform = c;
    
                  a.querySelector(".mat-slider-thumb-label-text").innerHTML = x.toString();
                  
                } catch (err) {
                  video.volume = 1
                }
              }
    
            }
            else if(e.keyCode == 40){
              e.preventDefault();
              var currVolume = video.volume
              if (currVolume!=0) {
                try {
                  var x = currVolume - 0.02;
                  video.volume = x;
                  var a = (((video.closest("mat-video").querySelector("mat-volume-control")
                  .querySelector("mat-slider").querySelector(".mat-slider-thumb-container"))) as HTMLElement);
                  var min = (1-x)*100;
                  var c = "translate(-" + min +"%)";
                  a.style.transform = c;
    
                  a.querySelector(".mat-slider-thumb-label-text").innerHTML = x.toString();
                }
                catch(err) {
                    video.volume = 0;
                }
                
              }
            }
          }
  
        })
      })
    })
  }

  inputTextFocus():void{
    this.isInput = true    
  }

  inputTextBlur():void{
    this.isInput = false    
  }

  changeVideoTimestamp():void{
    var tag = this.elRef.nativeElement.getElementsByTagName('video')[0]
    
    tag.onended = () => {
      if(this.autoplay){
        var res = this.currPlaylist.video_id.split(',')
        var nextIndex = parseInt(this.index ) + 1
        
        if(nextIndex == res.length - 1){
          nextIndex = 1
        }

        var url = './watch/playlist/' + this.currPlaylist.id + "/" + nextIndex 
        this.router.navigate([url]);
      }
    }

    if(this.videoTime){      
      var video = (document.getElementsByTagName('mat-video')[0] as HTMLVideoElement).querySelector('video')
      video.currentTime = parseInt(this.videoTime)
    }
  }

  isTheSameChannel():boolean{
    return this.video.channel_id == this.userChannel.id
  }

  detectReplyInput(e:String){
    if(e.length == 0){
      document.getElementById('comment-button').style.cursor = "not-allowed"
      document.getElementById('comment-button').style.backgroundColor = "pink"
      this.validCommentInput = false;
    }
    else{
      document.getElementById('comment-button').style.cursor = "pointer"
      document.getElementById('comment-button').style.backgroundColor = "red"
      this.validCommentInput = true;
    }
    this.commentInput = e    
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

  insertComment():void{
    if(this.commentInput == ""){
      return
    }

    this.apollo.mutate<any>({
      mutation: gql`
        mutation createComment($video_id: ID!, $channel_id: ID!, $content: String!){
          createComment(input: {
            video_id: $video_id, 
            channel_id: $channel_id, 
            content: $content,
            like: 1,
            dislike: 1
          }){
            id,
            video_id,
            channel_id,
            content,
            like,
            dislike
          }
        }
      `,
      variables:{
        video_id: this.video.id,
        channel_id: this.userChannel.id,
        content: this.commentInput
      },
      refetchQueries: [{
        query: getCommentQuery,
        variables: { repoFullName: 'apollographql/apollo-client', video_id: this.video.id},
      }],
    }).subscribe(result => {
      console.log(result)
      alert("Comment successfuly added!")
      this.comments.push(result.data.createComment)
      this.commentCountOutput = this.comments.length + " Comments"      
      var a = document.getElementById('comment-input-text') as HTMLInputElement
      a.value = ""
    })
  }

  loadPlaylistVideos(ids, length, curr):void{
    if(curr == length){
      return
    }

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
        id: ids[curr]
      }
    }).valueChanges.subscribe(result => {
        if(!this.alreadyLoadedVideoIds.includes(result.data.getVideoById[0].id)){
          this.playlistVideos.push(result.data.getVideoById[0])     
          this.alreadyLoadedVideoIds.push(result.data.getVideoById[0].id)
        }
        this.loadPlaylistVideos(ids, length, curr + 1)
    })
  }
  
  loadPLaylistVideo():void{
    var res = this.currPlaylist.video_id.split(',')        
    this.loadPlaylistVideos(res, res.length - 1, 1)
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
      this.subscriberCountOutput = (this.channel.subscriber_count -1) + " subscriber(s)"      
      this.descriptionLoaded = true
      if(this.userDB){
        this.checkUserLikeOrNot()
        this.userHasSubscribed()
      }
      this.changeVideoTimestamp()
      
      this.loadVideoComments()
    })
  }

  loadVideoComments():void{
    this.apollo.query<any>({
      query: gql `
        query getCommentByVideoId($video_id: ID!){
          getCommentByVideoId(video_id: $video_id){
            id,
            video_id,
            channel_id,
            content,
            like,
            dislike,
            day,
            month,
            year
          }
        }
      `,
      variables:{
        video_id: this.video.id
      }
    }).subscribe(result => {
      this.comments = result.data.getCommentByVideoId            
      this.commentCountOutput = this.comments.length + " Comments"      
      this.commentsLoaded = true

    })

    this.commentObserver = new IntersectionObserver((entry)=>{
      if(entry[0].isIntersecting){
        
        let card = document.querySelector(".comment-container")        
        for(let i = 0; i < 5; i++){
          
          if(this.lastKey < this.comments.length){
            let div = document.createElement("div")
            let comment = document.createElement("app-video-comment")
            comment.setAttribute("comm",  "this.comments[this.lastKey]")
            div.appendChild(comment)
            card.appendChild(div)
            this.lastKey++
          }
        }
      }
    })

    this.commentObserver.observe(document.querySelector(".comment-footer"))

  }

  convertLikeToText(count): String{
    if(count - 1 > 1000){      
      return Math.floor(((count - 1)/1000) * 10)/ 10 + "K"
    }
    else{
      return (count - 1).toString()
    }
  }

  convertMonthToText(month){
    if(month == 1){
      return "Jan"
    }
    else if(month == 2){
      return "Feb"
    }
    else if(month == 3){
      return "Mar"
    }
    else if(month == 4){
      return "Apr"
    }
    else if(month == 5){
      return "May"
    }
    else if(month == 6){
      return "Jun"
    }
    else if(month == 7){
      return "Jul"
    }
    else if(month == 8){
      return "Aug"
    }
    else if(month == 9){
      return "Sep"
    }
    else if(month == 10){
      return "Oct"
    }
    else if(month == 11){
      return "Nov"
    }
    else{
      return "Dec"
    }
  }

  showPlaylistModal():void{
    console.log("A");
    
    this.getUserPlaylist()

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
      document.getElementById('playlist-modal2').style.visibility = "visible"
    })
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

  hidePlaylistModal():void{
    this.showModal = false
    document.getElementById('playlist-modal2').style.visibility = "hidden"

    var id = "create-new-playlist-button2-" + this.video.id
    var id2 = "ntitle2-" + this.video.id
    var id3 = "nprivacy2-" + this.video.id
    var id4 = "nbutton2-" + this.video.id
    
    document.getElementById(id).style.display = "flex"
    document.getElementById(id2).style.display = "none"
    document.getElementById(id3).style.display = "none"
    document.getElementById(id4).style.display = "none"
  }

  toggleCreatePlaylist():void{    
    var id = "create-new-playlist-button2-" + this.video.id
    var id2 = "ntitle2-" + this.video.id
    var id3 = "nprivacy2-" + this.video.id
    var id4 = "nbutton2-" + this.video.id

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
    this.playlist_privacy = e.target.value
    console.log(this.playlist_privacy);
    
  }

  checkChecked(playlist):boolean{
    if(playlist.video_id.includes((this.video.id).toString())){
      return true
    }
    return false
  }

  copyURLToClipboard(){
    var copyText = document.getElementById("url") as HTMLInputElement
    copyText.select()
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy")
  }

  changeCurrentTime(e){
    this.currentTime = e.target.currentTime    
  }

  toggleCurrentTime(v):void{

    if(v){
      var video = (document.getElementsByTagName('mat-video')[0] as HTMLVideoElement).querySelector('video')
      this.videoURL += "/" + Math.floor(video.currentTime)
    }
    else{
      this.videoURL = "http://localhost:4200/watch/" + this.video.id
    }
  }

  showShareModal():void{
    this.currentTime = this.getDuration(Math.floor(this.elRef.nativeElement.getElementsByTagName('video')[0].currentTime))
    document.getElementById('share-modal').style.visibility = "visible"
  }

  hideShareModal():void{
    document.getElementById('share-modal').style.visibility = "hidden"
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

    this.apollo.watchQuery<any>({
      query: gql`
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

  checkUserLikeOrNot():void{
    

    if(this.userDB.liked_video.includes(this.video.id)){
      
      document.getElementById('thumbs-up-logo').style.color = "blueviolet"
    }
    else{
      document.getElementById('thumbs-up-logo').style.color = "gray"

    }

    if(this.userDB.disliked_video.includes(this.video.id)){
      document.getElementById('thumbs-down-logo').style.color = "blueviolet"
    }
    else{
      document.getElementById('thumbs-down-logo').style.color = "gray"
    }
    
  }

  likeVideo():void{

    if(this.userDB.liked_video.includes(this.video.id)){
      this.removeFromUserLikedVideo(false)
      this.updateVideoLike(this.video.like - 1, false)
    }
    else if(this.userDB.disliked_video.includes(this.video.id)){
      this.removeFromUserDislikedVideo(true)
      this.updateVideoDislike(this.video.dislike - 1, true)
    }
    else{
      this.addToUserLikedVideo()
      this.updateVideoLike(this.video.like + 1, false)
    }

  }

  dislikeVideo():void{

    if(this.userDB.disliked_video.includes(this.video.id)){      
      this.removeFromUserDislikedVideo(false)
      this.updateVideoDislike(this.video.dislike - 1, false)
    }
    else if(this.userDB.liked_video.includes(this.video.id)){      
      this.removeFromUserLikedVideo(true)
      this.updateVideoLike(this.video.like - 1, true)
    }
    else{
      this.addToUserDislikedVideo()
      this.updateVideoDislike(this.video.dislike + 1, false)
    }

  }

  addToUserDislikedVideo():void{
    var str = this.userDB.disliked_video
    var newStr = str + this.video.id + ","

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment,
            liked_post: $liked_post,
            disliked_post: $disliked_post
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment,
            liked_post,
            disliked_post
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: newStr,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)    
      this.checkUserLikeOrNot()
    })   
  }

  removeFromUserDislikedVideo(v):void{    
    var str = this.userDB.disliked_video

    var res = str.split(",")

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.video.id){
        res.splice(i, 1)
      }
    }

    var newStr = res.toString()
      
    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment,
            liked_post: $liked_post,
            disliked_post: $disliked_post
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment,
            liked_post,
            disliked_post
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: newStr,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)    
      this.checkUserLikeOrNot()

      if(v){
        this.addToUserLikedVideo()
      }
    })   
  }

  addToUserLikedVideo():void{    
    var str = this.userDB.liked_video
    var newStr = str + this.video.id + ","

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment,
            liked_post: $liked_post,
            disliked_post: $disliked_post
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment,
            liked_post,
            disliked_post
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: newStr,
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)
      this.checkUserLikeOrNot()
    })   
  }

  removeFromUserLikedVideo(v):void{
    var str = this.userDB.liked_video

    var res = str.split(",")

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.video.id){
        res.splice(i, 1)
      }
    }

    var newStr = res.toString()

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment,
            liked_post: $liked_post,
            disliked_post: $disliked_post
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment,
            liked_post,
            disliked_post
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: newStr,
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result =>{

      console.log(result.data.updateUser);
      
      this.userDB = result.data.updateUser       
      this.data.changeUserDB(this.userDB)  
      this.checkUserLikeOrNot()

      if(v){
        this.addToUserDislikedVideo()
      }
    })   
  }

  updateVideoView(newView){
    
    this.firstTime = false;

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateVideo($id: ID!, $channel_id: ID!, $title: String!, $description: String!, $thumbnail: String!, $category: String!,
            $location: String!, $view: Int!, $privacy: String!, $is_premium: String!, $age_restricted: String!, $video_url: String!,
              $like: Int!, $dislike: Int!, $duration: Int!){
            updateVideo(id: $id, input:{
              channel_id: $channel_id,
              title: $title,
              description: $description,
              thumbnail: $thumbnail,
              category: $category,
              location: $location,
              view: $view,
              privacy: $privacy,
              is_premium: $is_premium,
              age_restricted: $age_restricted,
              video_url: $video_url,
              like: $like,
              dislike: $dislike,
              duration: $duration
            }) {
              id,
              like,
              dislike
            } 
        }
      `,
      variables:{
        id: this.video.id,
        channel_id: this.video.channel_id,
        title: this.video.title,
        description: this.video.description,
        thumbnail: this.video.thumbnail,
        category: this.video.category,
        location: this.video.location,
        view: newView,
        privacy: this.video.privacy,
        is_premium: this.video.is_premium,
        age_restricted: this.video.age_restricted,
        video_url: this.video.video_url,
        like: this.video.like,
        dislike: this.video.dislike,
        duration: this.video.duration
      },
      refetchQueries: [{
        query: getVideoQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      id: this.video.id
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      
    })  
  }

  updateVideoDislike(newDislike, v):void{

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateVideo($id: ID!, $channel_id: ID!, $title: String!, $description: String!, $thumbnail: String!, $category: String!,
            $location: String!, $view: Int!, $privacy: String!, $is_premium: String!, $age_restricted: String!, $video_url: String!,
              $like: Int!, $dislike: Int!, $duration: Int!){
            updateVideo(id: $id, input:{
              channel_id: $channel_id,
              title: $title,
              description: $description,
              thumbnail: $thumbnail,
              category: $category,
              location: $location,
              view: $view,
              privacy: $privacy,
              is_premium: $is_premium,
              age_restricted: $age_restricted,
              video_url: $video_url,
              like: $like,
              dislike: $dislike,
              duration: $duration
            }) {
              id,
              like,
              dislike
            } 
        }
      `,
      variables:{
        id: this.video.id,
        channel_id: this.video.channel_id,
        title: this.video.title,
        description: this.video.description,
        thumbnail: this.video.thumbnail,
        category: this.video.category,
        location: this.video.location,
        view: this.video.view,
        privacy: this.video.privacy,
        is_premium: this.video.is_premium,
        age_restricted: this.video.age_restricted,
        video_url: this.video.video_url,
        like: this.video.like,
        dislike: newDislike,
        duration: this.video.duration
      },
      refetchQueries: [{
        query: getVideoQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      id: this.video.id
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      this.likeOutput = this.convertLikeToText(this.video.like)
      this.dislikeOutput = this.convertLikeToText(this.video.dislike)
      this.likeCount = this.video.like - 1
      this.dislikeCount = this.video.dislike -1
      this.totalLikeAndDislike = this.video.like - 1 + this.video.dislike - 1

      if(v){
        this.updateVideoLike(this.video.like + 1, false)
      }
    })  
  }

  updateVideoLike(newLike, v):void{
    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateVideo($id: ID!, $channel_id: ID!, $title: String!, $description: String!, $thumbnail: String!, $category: String!,
            $location: String!, $view: Int!, $privacy: String!, $is_premium: String!, $age_restricted: String!, $video_url: String!,
              $like: Int!, $dislike: Int!, $duration: Int!){
            updateVideo(id: $id, input:{
              channel_id: $channel_id,
              title: $title,
              description: $description,
              thumbnail: $thumbnail,
              category: $category,
              location: $location,
              view: $view,
              privacy: $privacy,
              is_premium: $is_premium,
              age_restricted: $age_restricted,
              video_url: $video_url,
              like: $like,
              dislike: $dislike,
              duration: $duration
            }) {
              id,
              like,
              dislike
            } 
        }
      `,
      variables:{
        id: this.video.id,
        channel_id: this.video.channel_id,
        title: this.video.title,
        description: this.video.description,
        thumbnail: this.video.thumbnail,
        category: this.video.category,
        location: this.video.location,
        view: this.video.view,
        privacy: this.video.privacy,
        is_premium: this.video.is_premium,
        age_restricted: this.video.age_restricted,
        video_url: this.video.video_url,
        like: newLike,
        dislike: this.video.dislike,
        duration: this.video.duration
      },
      refetchQueries: [{
        query: getVideoQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      id: this.video.id
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      
      this.likeOutput = this.convertLikeToText(this.video.like)
      this.dislikeOutput = this.convertLikeToText(this.video.dislike)
      this.likeCount = this.video.like - 1
      this.dislikeCount = this.video.dislike -1
      this.totalLikeAndDislike = this.video.like - 1 + this.video.dislike - 1

      if(v){
        this.updateVideoDislike(this.video.dislike + 1, false)
      }

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
      refetchQueries: [{
        query: getChannelQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      id: this.video.channel_id
                  },
      }],
    }).subscribe(result => {
      console.log(result);
      this.channel = result.data.updateChannel
      this.subscriberCountOutput = (this.channel.subscriber_count -1) + " subscriber(s)"      
    })
  }

  getDuration(v):String{
    // this.duration = (Math.floor(e.target.duration)).toString() + " second(s)"
    var duration
    var time = v
    var hour:number
    var minute:number
    var second: number

    if(time > 3600){
      hour = Math.floor(time / 3600)
      minute = Math.floor((time - (3600 * hour)) / 60)      
      second = Math.floor(((time - (3600 * hour)) - minute * 60))

      if(hour <= 9 ){
        duration =  "0" + hour   
      }
      else{
        duration = hour.toString()
      }

      duration += ":"

      if(minute <= 9){
        duration += "0" + minute 
      }
      else{
        duration += minute.toString()
      }

      duration += ":"

      if(second <= 9){
        duration += "0" + second
      }
      else{
        duration += second.toString()
      }
    }
    else if(time > 60){
      minute = Math.floor(time / 60)
      second = Math.floor((time - minute * 60))

      if(minute <= 9){
        duration = "0" + minute
      }
      else{
        duration = minute.toString()  
      }

      duration += ":"

      if(second <= 9){
        duration += "0" + second
      }
      else{
        duration += second.toString()
      }
    }
    else{
      second = time



      if(second <= 9){
        duration = "00:0" + second
      }
      else{
        duration = "00:" + second.toString()
      }
    }

    return duration
  }

  loadRelatedVideo():void{

    let loc:String
    let restrict:String

    if(this.userDB){            
      loc = this.userDB.location
      restrict = this.userDB.restrict_mode
    }
    else{
      loc = this.currLocation
      restrict = this.restrictedMode
    }
    
    
    this.apollo.watchQuery<any>({
      query: gql `
        query getRelatedVideo($video_id : ID!, $category: String!, $is_restrict: String!){
          getRelatedVideo(video_id: $video_id, category: $category, is_restrict: $is_restrict){
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
        video_id: this.video.id,
        category: this.video.category,
        is_restrict: restrict
      }
    }).valueChanges.subscribe(result => {
      this.relatedVideos = result.data.getRelatedVideo
      this.relatedVideos.sort(a => a.location == loc ? -1 : 1)

      this.relatedVideoLoaded = true
    })
  }

  toggleSortBy():void{
    if(document.getElementById('sortby-options').style.visibility == "hidden"){
      document.getElementById('sortby-options').style.visibility = "visible"
    }
    else{
      document.getElementById('sortby-options').style.visibility = "hidden"
    }
  }

  sortCommentByLike():void{
    this.comments.sort((a,b)=> (a.like > b.like) ? -1 : 1)
  }

  sortCommentByNewest():void{
    this.comments.sort((a,b)=> (parseInt(a.id) > parseInt(b.id)) ? -1 : 1)
  }

}
