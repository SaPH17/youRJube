import { getCommentQuery2 } from './../video-watch/video-watch.component';
import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

const getReplyQuery = gql `
  query getReplyByCommentId($comment_id: ID!){
    getReplyByCommentId(comment_id: $comment_id){
      id,
      comment_id,
      channel_id,
      content,
      day,
      month,
      year,
    }
  }
`
@Component({
  selector: 'app-video-comment',
  templateUrl: './video-comment.component.html',
  styleUrls: ['./video-comment.component.scss']
})

export class VideoCommentComponent implements OnInit {

  @Input('comm')comment:{
    id,
    video_id,
    channel_id,
    like,
    dislike,
    content,
    day,
    month,
    year,
  }

  replies:any
  replyLoaded: boolean = false
  replyCountOutput: String

  commentChannel:any
  userChannel: any
  likeOutput: String
  dislikeOutput: String
  dateOutput: String
  doneLoading: boolean = false;
  validReplyInput:boolean = false;
  replyInput:String = ""

  toggleShowReply:boolean = false
  userDB: any

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    
    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)

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
        id: this.comment.channel_id
      }
    }).subscribe(result => {
      this.commentChannel = result.data.getChannelById[0]
      this.dateOutput = this.convertDate(this.comment.day, this.comment.month -1, this.comment.year)
      this.likeOutput = this.convertLikeToText(this.comment.like)
      this.dislikeOutput = this.convertLikeToText(this.comment.dislike)
      this.doneLoading = true;

      this.loadReplies()
      this.checkUserLikeOrNot()
    })

  }

  loadReplies():void{
    this.apollo.watchQuery<any>({
      query: getReplyQuery,
      variables:{
        comment_id: this.comment.id
      }
    }).valueChanges.subscribe(result => {
      this.replies = result.data.getReplyByCommentId
      this.replyCountOutput = this.convertReplyCountOutput(this.replies.length)

      this.replyLoaded = true;

    })
  }

  createReply():void{
    if(this.replyInput == ""){
      return
    }    

    this.apollo.mutate<any>({
      mutation: gql`
        mutation createReply($comment_id: ID!, $channel_id: ID!, $content: String!){
          createReply(input: {
            comment_id: $comment_id,
            channel_id: $channel_id,
            content: $content
          }){
            id
          }
        }
      `,
      variables:{
        comment_id: this.comment.id,
        channel_id: this.userChannel.id,
        content: this.replyInput
      },
      refetchQueries: [{
        query: getReplyQuery,
        variables: { repoFullName: 'apollographql/apollo-client',
                    comment_id: this.comment.id },
      }],
    }).subscribe(result => {
      alert("Reply successfuly added!")
      this.replyCountOutput = this.convertReplyCountOutput(this.replies.length)

      var id = "input-reply-" + this.comment.id
      var a = document.getElementById(id) as HTMLInputElement
      a.value = ""
    })
  }

  doesCommentHaveReplies(){    
    if(this.replies == undefined || this.replies.length == 0){      
      return false
    }
    
    return true
  }

  showReplies():void{
    if(this.toggleShowReply == false){
      var id = "replies-" + this.comment.id
      var id2 = "show-reply-button-" + this.comment.id
      var newOutput = "Hide " + this.convertReplyCountOutput(this.replies.length)

      document.getElementById(id).style.display = "flex"
      document.getElementById(id2).textContent = newOutput

      this.toggleShowReply = true
    }
    else{
      var id = "replies-" + this.comment.id
      var id2 = "show-reply-button-" + this.comment.id
      var newOutput = "Show " + this.convertReplyCountOutput(this.replies.length)

      document.getElementById(id).style.display = "none"
      document.getElementById(id2).textContent = newOutput
      
      this.toggleShowReply = false
    }
  }

  convertReplyCountOutput(length){
    if(length == 1){
      return length + " reply"
    }
    else{
      return length + " replies"
    }
  }

  detectReplyInput(e:String){
    var id = "reply-button-" + this.comment.id

    if(e.length == 0){
      document.getElementById(id).style.cursor = "not-allowed"
      document.getElementById(id).style.backgroundColor = "pink"
      this.validReplyInput = false;
    }
    else{
      document.getElementById(id).style.cursor = "pointer"
      document.getElementById(id).style.backgroundColor = "red"
      this.validReplyInput = true;
    }

    this.replyInput = e
    
  }

  enableReplyInput(){
      var id = "reply-bottom-" + this.comment.id
      document.getElementById(id).style.display = "flex"
  }

  disableReplyInput(){
    var id = "reply-bottom-" + this.comment.id

    document.getElementById(id).style.display = "none"
  }

  convertLikeToText(count): String{
    if(count > 1000){
      return ((parseInt(count) - 1) / 1000).toFixed(1) + "K"
    }
    else{
      return (count - 1).toString()
    }
  }

  convertDate(day, month, year){
    var currentDate = new Date()
    
    if(currentDate.getDate() == day){
      return "Today"
    }
    else if(currentDate.getMonth() == month && currentDate.getDate() - day < 7){
      return (currentDate.getDate() - day).toString() + " day(s) ago"
    }
    else if(currentDate.getMonth() == month && currentDate.getDate() - day > 7 ){
      return (Math.floor((currentDate.getDate() - day) / 7)).toString() + " week(s) ago"
    }
    else if(currentDate.getFullYear() == year){
      return (currentDate.getMonth() - month).toString() + " month(s) ago"
    }
    else if(currentDate.getFullYear() - year > 0){
      return (currentDate.getFullYear() - year ).toString() + " year(s) ago"
    }
  }

  likeComment():void{

    if(this.userDB.liked_comment.includes(this.comment.id)){
      console.log("A");
      
      this.removeFromUserLikedComment(false)
      this.updateCommentLike(this.comment.like - 1, false)
    }
    else if(this.userDB.disliked_comment.includes(this.comment.id)){
      console.log("B");
      
      this.removeFromUserDislikedComment(true)
      this.updateCommentDislike(this.comment.dislike - 1, true)
    }
    else{
      console.log("C");
      
      this.addToUserLikedComment()
      this.updateCommentLike(this.comment.like + 1, false)
    }

  }

  dislikeComment():void{

    if(this.userDB.disliked_comment.includes(this.comment.id)){      
      this.removeFromUserDislikedComment(false)
      this.updateCommentDislike(this.comment.dislike - 1, false)
    }
    else if(this.userDB.liked_comment.includes(this.comment.id)){      
      this.removeFromUserLikedComment(true)
      this.updateCommentLike(this.comment.like - 1, true)
    }
    else{
      this.addToUserDislikedComment()
      this.updateCommentDislike(this.comment.dislike + 1, false)
    }

  }

  checkUserLikeOrNot():void{

    var id1 = "thumbs-up-logo-" + this.comment.id
    var id2 = "thumbs-down-logo-" + this.comment.id

    console.log(id1);
    console.log(id2);
    console.log(document.getElementById(id1));
    console.log(document.getElementById(id2));

    if(this.userDB.liked_comment.includes(this.comment.id)){      
      document.getElementById(id1).style.color = "blueviolet"
    }
    else{
      document.getElementById(id1).style.color = "gray"
    }

    if(this.userDB.disliked_comment.includes(this.comment.id)){
      document.getElementById(id2).style.color = "blueviolet"
    }
    else{
      document.getElementById(id2).style.color = "gray"
    }

    // if(this.userDB.liked_comment.includes(this.comment.id)){      
    //   document.getElementById('thumbs-up-logo').querySelector("i").style.color = "blueviolet"
    // }
    // else{
    //   document.getElementById('thumbs-up-logo').querySelector("i").style.color = "gray"
    // }

    // if(this.userDB.disliked_comment.includes(this.comment.id)){
    //   document.getElementById('thumbs-down-logo').querySelector("i").style.color = "blueviolet"
    // }
    // else{
    //   document.getElementById('thumbs-down-logo').querySelector("i").style.color= "gray"
    // }
    
  }

  addToUserLikedComment():void{
    var str = this.userDB.liked_comment
    var newStr = str + this.comment.id + ","

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video,
        liked_comment: newStr,
        disliked_comment: this.userDB.disliked_comment
      },
      // refetchQueries: [{
      //   query: getUserSubsQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //               user_id: this.userDB.id,
      //               channel_id: this.channel.id,
      //             },
      // }],
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)
      this.checkUserLikeOrNot()

    })   
  }

  removeFromUserLikedComment(v):void{
    var str = this.userDB.liked_comment

    var res = str.split(",")

      for(let i = 0; i < res.length; i++){
        if(res[i] == this.comment.id){
          res.splice(i, 1)
        }
      }

    var newStr = res.toString()

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video,
        liked_comment: newStr,
        disliked_comment: this.userDB.disliked_comment
      },
      // refetchQueries: [{
      //   query: getUserSubsQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //               user_id: this.userDB.id,
      //               channel_id: this.channel.id,
      //             },
      // }],
    }).subscribe(result =>{

      console.log(result.data.updateUser);
      
      this.userDB = result.data.updateUser       
      this.data.changeUserDB(this.userDB)  
      this.checkUserLikeOrNot()

      if(v){
        this.addToUserDislikedComment()
      }
    })   
  }

  addToUserDislikedComment():void{
    var str = this.userDB.disliked_comment
    var newStr = str + this.comment.id + ","
    
    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: newStr
      },
      // refetchQueries: [{
      //   query: getUserSubsQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //               user_id: this.userDB.id,
      //               channel_id: this.channel.id,
      //             },
      // }],
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)    
      this.checkUserLikeOrNot()
    })   
  }

  removeFromUserDislikedComment(v):void{
    var str = this.userDB.disliked_comment

    var res = str.split(",")

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.comment.id){
        res.splice(i, 1)
      }
    }

    var newStr = res.toString()
      
    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment,
            
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: newStr
      },
      // refetchQueries: [{
      //   query: getUserSubsQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //               user_id: this.userDB.id,
      //               channel_id: this.channel.id,
      //             },
      // }],
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)    
      this.checkUserLikeOrNot()

      if(v){
        this.addToUserLikedComment()
      }
    })  
  }

  updateCommentLike(newLike, v):void{    

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateComment($id: ID!, $video_id: ID!, $channel_id: ID!, $like: Int!, $dislike: Int!, $content: String!){
          updateComment(id: $id, input:{
            video_id: $video_id,
            channel_id: $channel_id,
            like: $like,
            dislike: $dislike,
            content: $content,
          }){
            id,
            video_id,
            channel_id,
            like,
            dislike,
            content,
            day,
            month,
            year
          }
        }
      `,
      variables:{
        id: this.comment.id,
        video_id: this.comment.video_id,
        channel_id: this.comment.channel_id,
        like: newLike,
        dislike: this.comment.dislike,
        content: this.comment.content
      },
      refetchQueries: [{
        query: getCommentQuery2,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      video_id: this.comment.video_id
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      this.likeOutput = this.convertLikeToText(this.comment.like)
      this.dislikeOutput = this.convertLikeToText(this.comment.dislike)

      if(v){
        this.updateCommentDislike(this.comment.dislike + 1, false)
      }

    })   
  }

  updateCommentDislike(newDislike, v):void{

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateComment($id: ID!, $video_id: ID!, $channel_id: ID!, $like: Int!, $dislike: Int!, $content: String!){
          updateComment(id: $id, input:{
            video_id: $video_id,
            channel_id: $channel_id,
            like: $like,
            dislike: $dislike,
            content: $content
          }){
            id,
            video_id,
            channel_id,
            like,
            dislike,
            content,
            day,
            month,
            year
          }
        }
      `,
      variables:{
        id: this.comment.id,
        video_id: this.comment.video_id,
        channel_id: this.comment.channel_id,
        like: this.comment.like,
        dislike: newDislike,
        content: this.comment.content
      },
      refetchQueries: [{
        query: getCommentQuery2,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      video_id: this.comment.video_id
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      this.likeOutput = this.convertLikeToText(this.comment.like)
      this.dislikeOutput = this.convertLikeToText(this.comment.dislike)

      if(v){
        this.updateCommentDislike(this.comment.dislike + 1, false)
      }

    })   
  }
}

