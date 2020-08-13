import { Router } from '@angular/router';
import { getChannelVideoQuery } from './../channel-edit-videos.component';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-edit-videos-display',
  templateUrl: './channel-edit-videos-display.component.html',
  styleUrls: ['./channel-edit-videos-display.component.scss']
})
export class ChannelEditVideosDisplayComponent implements OnInit {

  @Input('vid') video:{
    id:String,
    channel_id: String,
    title: string,
    description: string,
    video_url: String,
    thumbnail: string,
    upload_day: number,
    upload_month: number,
    upload_year: number,
    category: string,
    location: string,
    view: number,
    privacy: string,
    is_premium: string,
    age_restricted: string,
    like:number,
    dislike:number,
    duration: number
  }

  title:string
  description:string
  privacy:string
  thumbnail:any
  thumbnailSrc:any
  thumbnailURL:any
  canUpdate:boolean = false;
  haveThumbnail:boolean = false

  thumbnailTask: AngularFireUploadTask
  thumbnailPercentage: Observable<number>;
  thumbnailSnapshot: Observable<any>;
  thumbnailDownloadURLObserver: Observable<string> = null;

  channelId:number

  constructor(private apollo: Apollo, private storage: AngularFireStorage, private db: AngularFirestore, private router: Router) { }

  ngOnInit(): void {
    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])

    this.title = this.video.title
    this.description = this.video.description
    this.privacy = this.video.privacy
    this.thumbnailSrc = this.video.thumbnail
  }

  handleThumbnailInput(files: FileList){
    if(files[0].type.split('/')[0]=='image'){
      this.thumbnail = files[0]

      const reader = new FileReader()
      reader.onload = e => this.thumbnailSrc = reader.result;

      reader.readAsDataURL(this.thumbnail)

      this.haveThumbnail = true
    }
  }

  validateButton():boolean{
    if(this.title == this.video.title && this.description == this.video.description && this.privacy == this.video.privacy
      && this.thumbnail == this.video.thumbnail){
        this.canUpdate = false
        return false
      }
      else{
        this.canUpdate = true
        return true
      }
  }

  updateVideo(){        
    if(!this.haveThumbnail){
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
          title: this.title,
          description: this.description,
          thumbnail: this.video.thumbnail,
          category: this.video.category,
          location: this.video.location,
          view: this.video.view,
          privacy: this.privacy,
          is_premium: this.video.is_premium,
          age_restricted: this.video.age_restricted,
          video_url: this.video.video_url,
          like: this.video.like,
          dislike: this.video.dislike,
          duration: this.video.duration
        },
        // refetchQueries: [{
        //   variables: { repoFullName: 'apollographql/apollo-client' ,
        //                 id: this.video.id
        //             },
        // }],
      }).subscribe(result =>{
        console.log(result);
        alert("Video succesfully updated")
      })  
    }
    else{
      this.uploadThumbnailImage()
    }
  }

  uploadThumbnailImage(){
    if(this.thumbnail != undefined && this.thumbnail.type.split('/')[0]=='image'){

      console.log(this.thumbnail.type.split('/')[0]);
      
      const path = `thumbnail/${Date.now()}_${this.thumbnail.name}`;

      const ref = this.storage.ref(path);
  
      this.thumbnailTask = this.storage.upload(path, this.thumbnail);
  
      this.thumbnailPercentage = this.thumbnailTask.percentageChanges();
  
      this.thumbnailTask.snapshotChanges().pipe(
        finalize( () =>  {
          this.thumbnailDownloadURLObserver = ref.getDownloadURL();
          this.thumbnailDownloadURLObserver.subscribe(url=>{
            if(url){
              this.thumbnailURL = url
              console.log(this.thumbnailURL);
              this.updateVideoWithThumbnail()
            }
          })
        })
      ).subscribe()
    }
    else{
      document.getElementById('details-error').style.visibility = "visible"
    }
  }

  updateVideoWithThumbnail():void{
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
        title: this.title,
        description: this.description,
        thumbnail: this.thumbnailURL,
        category: this.video.category,
        location: this.video.location,
        view: this.video.view,
        privacy: this.privacy,
        is_premium: this.video.is_premium,
        age_restricted: this.video.age_restricted,
        video_url: this.video.video_url,
        like: this.video.like,
        dislike: this.video.dislike,
        duration: this.video.duration
      },
      // refetchQueries: [{
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //                 id: this.video.id
      //             },
      // }],
    }).subscribe(result =>{
      console.log(result);
      alert("Video succesfully updated")
    })  
  }

  deleteVideo(){
    this.apollo.mutate({
      mutation: gql `
        mutation deleteVideo($id:ID!){
          deleteVideo(id: $id)
        }
      `,
      variables:{
        id : this.video.id
      },
      refetchQueries: [{
        query: getChannelVideoQuery,
        variables: { repoFullName: 'apollographql/apollo-client',
                      channel_id: this.channelId},
      }],
    }).subscribe()
  }

}
