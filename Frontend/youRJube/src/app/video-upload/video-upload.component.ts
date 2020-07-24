import { Router } from '@angular/router';
import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { finalize, tap } from 'rxjs/operators';
import {  AngularFireStorage } from 'angularfire2/storage';
import { Component, OnInit } from '@angular/core';
import { AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { getVideoQuery } from '../home/home.component'
import gql from 'graphql-tag';

const getPlaylistQuery =  gql `
  query getPlaylistByChannelId($channel_id: ID!){
    getPlaylistByChannelId(channel_id: $channel_id){
      title,
      description,
      privacy
    }
  }
`

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
  rawDuration: number
  selectedPlaylistIndex: number
  currLocation: String

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private apollo: Apollo, private data: DataService
    , private router:Router) { }
 
  ngOnInit(): void {

    this.data.currentChannelObject.subscribe(channelObject => this.userChannel = channelObject)
    this.data.locationObject.subscribe(locationObject => this.currLocation = locationObject)

    this.apollo.watchQuery<any>({
      query: gql `
        query getPlaylistByChannelId($channel_id: ID!){
          getPlaylistByChannelId(channel_id: $channel_id){
            id,
            channel_id,
            description,
            title,
            privacy,
            thumbnail,
            view,
            video_id,
          }
        }
      `,
      variables:{
        channel_id: this.userChannel.id
      }
    }).valueChanges.subscribe(result => {
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
    // this.duration = (Math.floor(e.target.duration)).toString() + " second(s)"
    this.rawDuration = e.target.duration
    var time = e.target.duration
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
      this.selectedPlaylistIndex = -1
      
    }
    else{      
      this.addToPlaylist = true;
      this.choosenPlaylist = e.target.options[e.target.options.selectedIndex].value
      this.selectedPlaylistIndex = e.target.options.selectedIndex - 1
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
            }
          }
        `,
        variables:{
          channel_id: this.userChannel.id,
          title: (this.playlist_title).toString(),
          privacy: (this.playlist_privacy).toString(),
          video_id: ","
        },
        refetchQueries: [{
          query: getPlaylistQuery,
          variables: { repoFullName: 'apollographql/apollo-client' ,
                        channel_id: this.userChannel.id
                    },
        }],
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
            $category: String!, $location: String!, $privacy: String!, $is_premium: String!, $age_restricted: String!, $duration: Int!){
          createVideo(input: {
            channel_id: $channel_id,
            title: $title,
            description: $description,
            video_url: $video_url,
            thumbnail: $thumbnail,
            category: $category,
            location: $location,
            view: 1
            privacy: $privacy,
            is_premium: $is_premium,
            age_restricted: $age_restricted,
            like: 1,
            dislike: 1,
            duration: $duration
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
        location: this.currLocation,
        privacy: this.privacy,
        is_premium: this.premium,
        age_restricted: this.restricted,
        duration: Math.floor(this.rawDuration)
      },
      refetchQueries: [{
        query: getVideoQuery,
        variables: { repoFullName: 'apollographql/apollo-client' },
      }],
    }).subscribe(result => {
      console.log(result)
      if(this.addToPlaylist){
        this.addVidToPlaylist(result.data.createVideo.id)
      }
      if(result){
        alert("Video succesfuly uploaded")
        this.router.navigate(['home']);
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

  addVidToPlaylist(id):void{
    var newStr: String

    var selectedPlaylist = this.channelPlaylist[this.selectedPlaylistIndex]
    
    var str = selectedPlaylist.video_id

    newStr = str + id + "," 
    
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
        id: selectedPlaylist.id,
        channel_id: selectedPlaylist.channel_id,
        description: selectedPlaylist.description,
        title: selectedPlaylist.title,
        privacy: selectedPlaylist.privacy,
        thumbnail: selectedPlaylist.thumbnail,
        view: selectedPlaylist.view,
        video_id: newStr
      },
    }).subscribe(result =>{
      console.log(result);

    })    

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
    else if(this.addToPlaylist == true && this.selectedPlaylistIndex == -1){      
      return false
    }
    else if(this.scheduledPublish == true && this.publishDate == null){
      return false
    }
    else if(!this.doneUploading){
      return false
    }

    return true;
  }

}
