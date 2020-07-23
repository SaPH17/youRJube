import { finalize } from 'rxjs/operators';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { DataService } from './../data.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';

const getcommunityPostQuery = gql `
  query getCommunityPostByChannelId($channel_id: ID!){
    getCommunityPostByChannelId(channel_id: $channel_id){
      id,
      channel_id,
      content,
      image,
      like,
      dislike,
    }
  }
`

@Component({
  selector: 'app-channel-community',
  templateUrl: './channel-community.component.html',
  styleUrls: ['./channel-community.component.scss']
})

export class ChannelCommunityComponent implements OnInit {

  userChannel: any
  user: any
  channelId: number
  communityPosts: any

  image: File
  imageSrc: any
  imageUrl: String

  validPostInput: boolean = false
  postInput: String

  imageTask: AngularFireUploadTask
  percentage: Observable<number>;
  snapshot: Observable<any>;
  imageDownloadURL: Observable<string> = null
  haveImage:boolean = false

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private data: DataService, private router: Router, private apollo: Apollo) { }

  ngOnInit(): void {
    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)

    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])

    this.loadCommunityPost()
  }

  loadCommunityPost(){
    this.apollo.query<any>({
      query: getcommunityPostQuery,
      variables:{
        channel_id: this.channelId
      }
    }).subscribe(result => {
      this.communityPosts = result.data.getCommunityPostByChannelId
      console.log(typeof this.communityPosts);
      
    })
  }

  handleThumbnailInput(files: FileList){
    if(files[0].type.split('/')[0]=='image'){
      this.image = files[0]

      const reader = new FileReader()
      reader.onload = e => this.imageSrc = reader.result;

      reader.readAsDataURL(this.image)
      this.haveImage = true
    }
  }

  detectReplyInput(e:String){
    if(e.length == 0){
      document.getElementById('post-button').style.cursor = "not-allowed"
      document.getElementById('post-button').style.backgroundColor = "pink"
      this.validPostInput = false;
    }
    else{
      document.getElementById('post-button').style.cursor = "pointer"
      document.getElementById('post-button').style.backgroundColor = "red"
      this.validPostInput = true;
    }

    this.postInput = e    
  }

  insertNewPost():void{
    if(this.validPostInput){
      if(this.haveImage){
        this.uploadThumbnailImage()
      }
      else{        
        this.imageUrl = ""
        this.insertPostToDatabase()
      }

    }
  }

  uploadThumbnailImage(){
    if(this.image != undefined && this.image.type.split('/')[0]=='image'){

      console.log(this.image.type.split('/')[0]);
      
      const path = `community_post_image/${Date.now()}_${this.image.name}`;

      const ref = this.storage.ref(path);
  
      this.imageTask = this.storage.upload(path, this.image);
  
      this.percentage = this.imageTask.percentageChanges();
  
      this.imageTask.snapshotChanges().pipe(
        finalize( () =>  {
          this.imageDownloadURL = ref.getDownloadURL();
          this.imageDownloadURL.subscribe(url=>{
            if(url){
              this.imageUrl = url
              this.insertPostToDatabase()
            }
          })
        })
      ).subscribe()
    }
  }

  insertPostToDatabase():void{
    this.apollo.mutate<any>({
      mutation: gql`
        mutation createCommunityPost($channel_id: ID!, $content: String!, $image: String, $like: Int!, $dislike: Int!){
            createCommunityPost(input:{
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
        channel_id: this.userChannel.id,
        content: this.postInput,
        image: this.imageUrl,
        like: 1,
        dislike: 1
      },
      refetchQueries: [{
        query: getcommunityPostQuery,
        variables: { repoFullName: 'apollographql/apollo-client',
                    channel_id: this.channelId
        },
      }],
    }).subscribe(result => {
      console.log(result);      
      alert("Community post successfuly added!");
      this.communityPosts.push(result.data.createCommunityPost);
      console.log(this.communityPosts);
      
      (document.getElementById("comment-input-text") as HTMLInputElement).value = ""
      this.haveImage = false
      this.imageSrc = ""
    })
  }

}
