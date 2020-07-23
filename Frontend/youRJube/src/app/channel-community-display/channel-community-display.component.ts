import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-community-display',
  templateUrl: './channel-community-display.component.html',
  styleUrls: ['./channel-community-display.component.scss']
})
export class ChannelCommunityDisplayComponent implements OnInit {

  @Input('post')communityPost:{
    id,
    channel_id,
    content,
    image,
    like,
    dislike
  }

  channel: any
  channelLoaded: boolean = false

  likeOutput:String
  dislikeOutput: String

  userDB: any
  isLiked: boolean = false
  isDisliked: boolean = false;

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    this.loadChannelInformation()
    this.checkUserLikeOrNot()

    this.likeOutput = ( this.communityPost.like - 1).toString()
    this.dislikeOutput = ( this.communityPost.dislike - 1).toString()
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
        id: this.communityPost.channel_id
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById[0]
      this.channelLoaded = true
    })
  }

  likePost():void{

    if(this.userDB.liked_post.includes(this.communityPost.id)){      
      this.removeFromUserLikedPost(false)
      this.updatePostLike(this.communityPost.like - 1, false)
    }
    else if(this.userDB.disliked_post.includes(this.communityPost.id)){      
      this.removeFromUserDislikedPost(true)
      this.updatePostDislike(this.communityPost.dislike - 1, true)
    }
    else{      
      this.addToUserLikedPost()
      this.updatePostLike(this.communityPost.like + 1, false)
    }

  }

  dislikePost():void{

    if(this.userDB.disliked_post.includes(this.communityPost.id)){      
      this.removeFromUserDislikedPost(false)
      this.updatePostDislike(this.communityPost.dislike - 1, false)
    }
    else if(this.userDB.liked_post.includes(this.communityPost.id)){      
      this.removeFromUserLikedPost(true)
      this.updatePostLike(this.communityPost.like - 1, true)
    }
    else{
      this.addToUserDislikedPost()
      this.updatePostDislike(this.communityPost.dislike + 1, false)
    }

  }

  checkUserLikeOrNot():void{

    if(this.userDB.liked_post.includes(this.communityPost.id)){      
      this.isLiked = true
    }
    else{
      this.isLiked = false
    }

    if(this.userDB.disliked_post.includes(this.communityPost.id)){
      this.isDisliked = true
    }
    else{
      this.isDisliked = false
    }
    
  }

  addToUserLikedPost():void{
    var str = this.userDB.liked_post
    var newStr = str + this.communityPost.id + ","

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
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: newStr,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result => {
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)
      this.checkUserLikeOrNot()

    })   
  }

  removeFromUserLikedPost(v):void{
    var str = this.userDB.liked_post

    var res = str.split(",")

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.communityPost.id){
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
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: newStr,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result =>{

      console.log(result.data.updateUser);
      
      this.userDB = result.data.updateUser       
      this.data.changeUserDB(this.userDB)  
      this.checkUserLikeOrNot()

      if(v){
        this.addToUserDislikedPost()
      }
      
    })   
  }

  addToUserDislikedPost():void{
    var str = this.userDB.disliked_post
    var newStr = str + this.communityPost.id + ","
    
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
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: newStr
      },
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)    
      this.checkUserLikeOrNot()
    })   
  }

  removeFromUserDislikedPost(v):void{
    var str = this.userDB.disliked_post

    var res = str.split(",")

    for(let i = 0; i < res.length; i++){
      if(res[i] == this.communityPost.id){
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
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: newStr
      },
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)    
      this.checkUserLikeOrNot()

      if(v){
        this.addToUserLikedPost()
      }
      
    })  
  }

  updatePostLike(newLike, v):void{    

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateCommunityPost($id: ID!, $channel_id: ID!, $content: String!, $image: String!, $like: Int!, $dislike: Int!){
          updateCommunityPost(id: $id, input:{
            channel_id: $channel_id,
            content: $content,
            image: $image,
            like: $like,
            dislike: $dislike
          }){
            id,
            channel_id,
            content,
            image,
            like,
            dislike
          }
        }
      `,
      variables:{
        id: this.communityPost.id,
        channel_id: this.communityPost.channel_id,
        image: this.communityPost.image,
        content: this.communityPost.content,
        like: newLike,
        dislike: this.communityPost.dislike,
      },
    }).subscribe(result =>{
      console.log(result);
      this.communityPost = result.data.updateCommunityPost
      this.likeOutput = this.convertLikeToText(this.communityPost.like)
      this.dislikeOutput = this.convertLikeToText(this.communityPost.dislike)

      if(v){
        this.updatePostDislike(this.communityPost.dislike + 1, false)
      }

    })   
  }

  updatePostDislike(newDislike, v):void{

    this.apollo.mutate<any>({
      mutation: gql`
      mutation updateCommunityPost($id: ID!, $channel_id: ID!, $content: String!, $image: String!, $like: Int!, $dislike: Int!){
        updateCommunityPost(id: $id, input:{
          channel_id: $channel_id,
          content: $content,
          image: $image,
          like: $like,
          dislike: $dislike
        }){
          id,
          channel_id,
          content,
          image,
          like,
          dislike
        }
      }
      `,
      variables:{
        id: this.communityPost.id,
        channel_id: this.communityPost.channel_id,
        image: this.communityPost.image,
        content: this.communityPost.content,
        like: this.communityPost.like,
        dislike: newDislike,
      },
    }).subscribe(result =>{
      console.log(result);
      this.communityPost = result.data.updateCommunityPost
      this.likeOutput = this.convertLikeToText(this.communityPost.like)
      this.dislikeOutput = this.convertLikeToText(this.communityPost.dislike)

      if(v){
        this.updatePostLike(this.communityPost.like + 1, false)
      }

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

}
