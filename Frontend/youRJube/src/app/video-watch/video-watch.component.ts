import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import gql from 'graphql-tag';

@Component({
  selector: 'app-video-watch',
  templateUrl: './video-watch.component.html',
  styleUrls: ['./video-watch.component.scss']
})
export class VideoWatchComponent implements OnInit {

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

  userChannel: any
  commentInput: String = ""

  //   comments = [
  //   {
  //     id: 1,
  //     video_id: 10,
  //     channel_id: 3,
  //     like: 1,
  //     dislike: 1,
  //     content: "Good!",
  //     day: 16,
  //     month: 7,
  //     year: 2020
  //   },
  //   {
  //     id: 2,
  //     video_id: 10,
  //     channel_id: 3,
  //     like: 1,
  //     dislike: 1,
  //     content: "Nice!",
  //     day: 16,
  //     month: 7,
  //     year: 2020
  //   },
  //   {
  //     id: 3,
  //     video_id: 10,
  //     channel_id: 3,
  //     like: 1234,
  //     dislike: 1,
  //     content: "Wow!",
  //     day: 16,
  //     month: 7,
  //     year: 2020
  //   },
  //   {
  //     id: 4,
  //     video_id: 10,
  //     channel_id: 3,
  //     like: 1,
  //     dislike: 1,
  //     content: "Hey!",
  //     day: 16,
  //     month: 7,
  //     year: 2020
  //   },
  //   {
  //     id: 5,
  //     video_id: 10,
  //     channel_id: 3,
  //     like: 1,
  //     dislike: 1,
  //     content: "Haha!",
  //     day: 16,
  //     month: 7,
  //     year: 2020
  //   }
  // ]

  comments: any
  commentsLoaded:boolean = false
  commentCountOutput: String

  videos=[{
    id: 1,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  },{
    id: 2,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  },{
    id: 3,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  },{
    id: 8,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  }]

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private apollo: Apollo,
    private data: DataService) { }

  ngOnInit(): void {

    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)

    const videoId = +this.route.snapshot.paramMap.get('id');    

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

      this.doneLoading = true

      this.loadChannelInformation()
    })
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
            content: $content
          }){
            id
          }
        }
      `,
      variables:{
        video_id: this.video.id,
        channel_id: this.userChannel.id,
        content: this.commentInput
      }
    }).subscribe(result => {
      console.log(result)
      alert("Comment successfuly added!")
      var a = document.getElementById('comment-input-text') as HTMLInputElement
      a.value = ""
    })
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
  }

  convertLikeToText(count): String{
    if(count > 1000){
      return ((parseInt(count) - 1) / 1000).toFixed(1) + "K"
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

}
