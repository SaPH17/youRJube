import { AngularFirestore } from 'angularfire2/firestore';
import { finalize, tap } from 'rxjs/operators';
import {  AngularFireStorage } from 'angularfire2/storage';
import { Component, OnInit } from '@angular/core';
import { AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss']
})
export class VideoUploadComponent implements OnInit {

  file: File
  thumbnail: File
  downloadURL: any
  title: String
  description: String
  duration: String
  user_playlist = ["1", "2"]

  doneUploading:boolean = false;

  thumbnailSrc: any = "../../assets/notFound.png"

  task: AngularFireUploadTask;

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURLObserver: Observable<string> = null;
  isHovering: boolean

  constructor(private storage: AngularFireStorage, private db: AngularFirestore) { }
 
  ngOnInit(): void {
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

    if(this.file.type.split('/')[0]=='video'){

      const path = `videos/${Date.now()}_${this.file.name}`;

      const ref = this.storage.ref(path);
  
      this.task = this.storage.upload(path, this.file);
  
      this.percentage = this.task.percentageChanges();
  
      this.task.snapshotChanges().pipe(
        finalize( () =>  {
          this.downloadURLObserver = ref.getDownloadURL();
          this.downloadURLObserver.subscribe(url=>{
            if(url){
              this.downloadURL = url
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
      document.getElementById('date-input').style.opacity = "0"
    }
    else{
      document.getElementById('date-input').style.opacity = "1"
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

}
