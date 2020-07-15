import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { finalize, tap } from 'rxjs/operators';
import {  AngularFireStorage } from 'angularfire2/storage';
import { Component, OnInit } from '@angular/core';
import { AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss']
})
export class VideoUploadComponent implements OnInit {

  file: File
  thumbnail: File

  videoURL: any
  thumbnailURL: any
  title: String = ""
  description: String = ""
  duration: String = ""
  category: String = ""
  addToPlaylist: boolean = false;
  choosenPlaylist: String = ""
  scheduledPublish: boolean = false;
  publishDate: Date = null
  restricted: String = ""
  privacy: String = ""
  premium: String = ""

  playlist_title: String = ""
  playlist_privacy: String = ""

  channelPlaylist: any
  playlistLoaded: boolean = false
  categoryList = [
    {name: "Choose an option", value: ""},
    {name: "Music", value: "Music"},
    {name: "Sport", value: "Sport"},
    {name: "Gaming", value: "Gaming"},
    {name: "Entertainment", value: "Entertainment"},
    {name: "News", value: "News"},
    {name: "Travel", value: "Travel"},
  ]

  doneUploading:boolean = false;
  thumbnailDoneUploading: boolean = false;

  thumbnailSrc: any = "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2Fdefault_thumbnail.png?alt=media&token=d8d25ad6-7273-42f0-a059-d50af36c10ac"

  task: AngularFireUploadTask;
  thumbnailTask: AngularFireUploadTask

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURLObserver: Observable<string> = null;

  thumbnailPercentage: Observable<number>;
  thumbnailSnapshot: Observable<any>;
  thumbnailDownloadURLObserver: Observable<string> = null;
  isHovering: boolean

  userChannel: any

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private apollo: Apollo, private data: DataService) { }
 
  ngOnInit(): void {

    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)

    this.apollo.query<any>({
      query: gql `
        query getPlaylistByChannelId($channel_id: ID!){
          getPlaylistByChannelId(channel_id: $channel_id){
            title,
            description,
            privacy
          }
        }
      `,
      variables:{
        channel_id: this.userChannel.id
      }
    }).subscribe(result => {
      this.channelPlaylist = result.data.getPlaylistByChannelId
      console.log(this.channelPlaylist);
      this.playlistLoaded = true
    })

  }

  toggleHover(event: boolean){
    this.isHovering = event
  }

  handleFileInput(files :FileList){
    this.file = files[0]
  }

  handleThumbnailInput(files: FileList){
    if(files[0].type.split('/')[0]=='image'){
      this.thumbnail = files[0]

      const reader = new FileReader()
      reader.onload = e => this.thumbnailSrc = reader.result;

      reader.readAsDataURL(this.thumbnail)
    }
    else{
      document.getElementById('details-error').innerHTML = "File must an image"
      document.getElementById('details-error').style.visibility = "visible"
    }
  }

  startUploadVideo():void {

    if(this.file != undefined && this.file.type.split('/')[0]=='video'){

      const path = `videos/${Date.now()}_${this.file.name}`;

      this.title = this.file.name

      const ref = this.storage.ref(path);
  
      this.task = this.storage.upload(path, this.file);
  
      this.percentage = this.task.percentageChanges();
  
      this.task.snapshotChanges().pipe(
        finalize( () =>  {
          this.downloadURLObserver = ref.getDownloadURL();
          this.downloadURLObserver.subscribe(url=>{
            if(url){
              this.videoURL = url
              this.doneUploading = true;
            }
          })
        })
      ).subscribe()

      document.getElementById('first-container').style.display = "none"
      document.getElementById('second-container').style.display = "flex"
    }
    else{
      document.getElementById('upload-error').style.visibility = "visible"
    }
  }

  isActive(snapshot){
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  isFileHasBeenUploaded(){
    if(this.file == null){
      return false
    }

    return true;
  }

  getDuration(e):void{
    this.duration = (Math.floor(e.target.duration)).toString() + " second(s)"
  }

  toggleDateTimeInput():void{
    if(document.getElementById('date-input').style.opacity === "1"){
      this.scheduledPublish = false;
      document.getElementById('date-input').style.opacity = "0"
    }
    else{
      document.getElementById('date-input').style.opacity = "1"
      this.scheduledPublish = true
    }
  }

  toggleNewPlaylistInput():void{
    if(document.getElementById('playlist-input').style.opacity === "1"){
      document.getElementById('playlist-input').style.opacity = "0"
    }
    else{
      document.getElementById('playlist-input').style.opacity = "1"
    }
  }

  changeCategoryValue(e){
    this.category = e.target.options[e.target.options.selectedIndex].value
    console.log(this.category);
    
  }

  changeRestrictedValue(e){
    this.restricted = e
  }

  changePrivacyValue(e){
    this.privacy = e
  }

  changePremiumValue(e){
    this.premium = e    
  }

  changePlaylistValue(e){

    if(e.target.options[e.target.options.selectedIndex].value == "None"){
      this.addToPlaylist = false;
      
    }
    else{
      this.addToPlaylist = true;
      this.choosenPlaylist = e.target.options[e.target.options.selectedIndex].value
    }
  }

  changeDatePublishValue(e){
    this.publishDate = new Date(e)
    console.log(this.publishDate.getDate())
  }

  createNewPlaylist():void {
    if(this.playlist_title != "" && this.playlist_privacy != ""){
      console.log(this.userChannel.id);
      
      
      this.apollo.mutate<any>({
        mutation: gql`
          mutation createPlaylist($channel_id: ID!, $title: String!, $privacy: String!){
            createPlaylist(input: {
              channel_id: $channel_id,
              title: $title,
              description: "No description given",
              privacy: $privacy,
              thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2Fdefault_thumbnail.png?alt=media&token=d8d25ad6-7273-42f0-a059-d50af36c10ac",
              view: 1
            }){
              id,
            }
          }
        `,
        variables:{
          channel_id: this.userChannel.id,
          title: (this.playlist_title).toString(),
          privacy: (this.playlist_privacy).toString()
        }
      }).subscribe(result => {
        console.log(result)
        document.getElementById('details-error').style.visibility = "hidden"
        alert("Playlist successfuly made!")
        document.getElementById('playlist-input').style.opacity = "0"
        var a = document.getElementById('new-playlist-checkbox') as HTMLInputElement
        a.checked = false;
      })
    }
    else{
      document.getElementById('details-error').style.visibility = "visible"
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
              this.thumbnailDoneUploading = true;
              console.log(this.thumbnailURL);
              
              this.insertVideoToDatabase()
            }
          })
        })
      ).subscribe()
    }
    else{
      document.getElementById('details-error').style.visibility = "visible"
    }
  }

  insertVideoToDatabase(){
    this.apollo.mutate<any>({
      mutation: gql`
        mutation createVideo($channel_id: ID!, $title: String!, $description: String!, $video_url: String!, $thumbnail: String!
            $category: String!, $location: String!, $privacy: String!, $is_premium: String!, $age_restricted: String!){
          createVideo(input: {
            channel_id: $channel_id,
            title: $title,
            description: $description,
            video_url: $video_url,
            thumbnail: $thumbnail,
            category: $category,
            location: $location,
            view: 1,
            privacy: $privacy,
            is_premium: $is_premium,
            age_restricted: $age_restricted
          }){
            id,
            title
          }
        }
      `,
      variables:{
        channel_id: this.userChannel.id,
        title: this.title,
        description: this.description,
        video_url: this.videoURL,
        thumbnail: this.thumbnailURL,
        category: this.category,
        location: "Indonesia",
        privacy: this.privacy,
        is_premium: this.premium,
        age_restricted: this.restricted
      }
    }).subscribe(result => {
      console.log(result)
      if(result){
        alert("Video succesfuly uploaded")
      }
    })
  }

  startPublishVideo(){
    if(this.validateInput()){
      document.getElementById('details-error').style.visibility = "hidden"
      this.uploadThumbnailImage()
      
    }
    else{
      document.getElementById('details-error').style.visibility = "visible"
    }
  }

  validateInput():boolean{

    if(this.title == ""){      
      return false
    }
    else if(this.restricted == ""){
      return false
    }
    else if(this.category == ""){
      return false
    }
    else if(this.privacy == ""){
      return false
    }
    else if(this.premium == ""){
      return false
    }
    else if(this.addToPlaylist == true && this.choosenPlaylist == ""){
      return false
    }
    else if(this.scheduledPublish == true && this.publishDate == null){
      return false
    }

    return true;
  }

}
