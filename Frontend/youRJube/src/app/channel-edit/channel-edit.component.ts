import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { getChannelQuery } from './../channel/channel.component';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

const getLinkQuery = gql `
  query getChannelSocialMediaByChannelId($channel_id: ID!){
    getChannelSocialMediaByChannelId(channel_id: $channel_id){
      id,
      channel_id,
      social_media,
      link,
    }
  }
`

@Component({
  selector: 'app-channel-edit',
  templateUrl: './channel-edit.component.html',
  styleUrls: ['./channel-edit.component.scss']
})
export class ChannelEditComponent implements OnInit {

  channelId: number
  channel: any
  links: any
  linkLoaded:boolean  = false

  //#region input
  iconUrl: any
  backgroundUrl: any
  channelDesc: String
  icon: File
  bgImage: File

  iconTask: AngularFireUploadTask
  bgImageTask: AngularFireUploadTask
  iconPercentage: Observable<number>;
  bgImagePercentage: Observable<number>;
  iconSnapshot: Observable<any>;
  bgImageSnapshot: Observable<any>
  iconDownloadURLObs: Observable<String> = null
  bgImageDownloadURLObs: Observable<String> = null
  iconDownloadURL: String
  bgImageDownloadURL: String
  //#endregion

  //#region input boolean
  haveIcon: boolean = false
  haveBgImage:boolean = false
  //#endregion

  //#region input link
  name: String
  link: String
  //#endregion

  constructor(private router: Router, private apollo: Apollo,
    private storage: AngularFireStorage, private db: AngularFirestore) { }

  ngOnInit(): void {
    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])

    this.apollo.watchQuery<any>({
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
        id: this.channelId
      }
    }).valueChanges.subscribe(result => {
      this.channel = result.data.getChannelById[0]
      this.iconUrl = this.channel.icon
      this.backgroundUrl = this.channel.background_image
      this.channelDesc = this.channel.description

      this.loadChannelLinks()
    })
  }

  loadChannelLinks():void{
    this.apollo.watchQuery<any>({
      query: getLinkQuery,
      variables:{
        channel_id: this.channelId
      }
    }).valueChanges.subscribe(result => {
      this.links = result.data.getChannelSocialMediaByChannelId
      this.linkLoaded = true
    })
  }

  createLink():void{
    this.apollo.mutate<any>({
      mutation: gql`
        mutation createChannelSocialMedia($channel_id: ID!, $social_media: String!, $link: String!){
          createChannelSocialMedia(input:{
            channel_id: $channel_id
            social_media: $social_media
            link: $link
          }){
            id,
            channel_id,
            social_media,
            link
          }
        }
      `,
      variables:{
        channel_id: this.channel.id,
        social_media: this.name,
        link: this.link
      },
      refetchQueries: [{
        query: getLinkQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      channel_id: this.channelId
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      alert("Links succesfully added")
      this.name = ""
      this.link = ""
    })  
  }

  handleIconlInput(files: FileList){
    if(files[0].type.split('/')[0]=='image'){
      this.icon = files[0]

      const reader = new FileReader()
      reader.onload = e => this.iconUrl = reader.result;

      reader.readAsDataURL(this.icon)
      this.haveIcon = true
    }
  }

  handleBgImageInput(files: FileList){
    if(files[0].type.split('/')[0]=='image'){
      this.bgImage = files[0]

      const reader = new FileReader()
      reader.onload = e => this.backgroundUrl = reader.result;

      reader.readAsDataURL(this.bgImage)
      this.haveBgImage = true
    }
  }

  uploadIconImage(){
    if(this.icon != undefined && this.icon.type.split('/')[0]=='image'){
      
      const path = `channel-icon/${Date.now()}_${this.icon.name}`;

      const ref = this.storage.ref(path);
  
      this.iconTask = this.storage.upload(path, this.icon);
  
      this.iconPercentage = this.iconTask.percentageChanges();
  
      this.iconTask.snapshotChanges().pipe(
        finalize( () =>  {
          this.iconDownloadURLObs = ref.getDownloadURL();
          this.iconDownloadURLObs.subscribe(url=>{
            if(url){
              this.iconDownloadURL = url
              if(this.haveBgImage){
                this.uploadBgImage()
              }
              else{
                this.updateDatabase()
              }
            }
          })
        })
      ).subscribe()
    }
  }

  uploadBgImage(){
    if(this.bgImage != undefined && this.bgImage.type.split('/')[0]=='image'){
      
      const path = `channel-background-image/${Date.now()}_${this.bgImage.name}`;

      const ref = this.storage.ref(path);
  
      this.bgImageTask = this.storage.upload(path, this.bgImage);
  
      this.bgImagePercentage = this.bgImageTask.percentageChanges();
  
      this.bgImageTask.snapshotChanges().pipe(
        finalize( () =>  {
          this.bgImageDownloadURLObs = ref.getDownloadURL();
          this.bgImageDownloadURLObs.subscribe(url=>{
            if(url){
              this.bgImageDownloadURL = url
              this.updateDatabase()
            }
          })
        })
      ).subscribe()
    }
  }

  updateChannel(){
    if(this.haveIcon){
      this.uploadIconImage()
    }
    else if(this.haveBgImage){
      this.uploadBgImage()
    }
    else{
      this.updateDatabase()
    }
  }

  updateDatabase():void{

    var iconn
    var bgimage
    var desc

    if(this.haveIcon){
      iconn = this.iconDownloadURL
    }
    else{
      iconn = this.channel.icon
    }

    if(this.haveBgImage){
      bgimage = this.bgImageDownloadURL
    }
    else{
      bgimage = this.channel.background_image
    }

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateChannel($id: ID!, $user_id: ID!, $name: String!, $background_image: String!, $icon: String!, 
          $description: String!, $subscriber_count: Int!){
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
            subscriber_count
          }
        }
      `,
      variables:{
        id: this.channel.id,
        user_id: this.channel.user_id,
        name: this.channel.name,
        background_image: bgimage,
        icon: iconn,
        description: this.channelDesc,
        subscriber_count: this.channel.subscriber_count
      },
      refetchQueries: [{
        query: getChannelQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                      channel_id: this.channelId
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      alert("Channel succesfully updated")
    })  
  }
}
