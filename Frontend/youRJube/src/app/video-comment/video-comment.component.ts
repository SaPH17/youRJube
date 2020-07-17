import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

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

  // replies =[
  //   {
  //     id: 1,
  //     comment_id: 1,
  //     channel_id: 3,
  //     content: "Agree!"
  //   },{
  //     id: 2,
  //     comment_id: 1,
  //     channel_id: 3,
  //     content: "Yes!"
  //   }
  // ]

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

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {

    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)

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
    })
  }

  loadReplies():void{
    this.apollo.watchQuery<any>({
      query: gql `
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
      `,
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
      }
    }).subscribe(result => {
      alert("Reply successfuly added!")

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

}
