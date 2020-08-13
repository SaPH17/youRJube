import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-videos',
  templateUrl: './channel-videos.component.html',
  styleUrls: ['./channel-videos.component.scss']
})
export class ChannelVideosComponent implements OnInit {

  constructor(private apollo: Apollo, private router: Router) { }

  videos: any
  haveVideos: boolean = false
  doneLoading: boolean = false
  channelId: number

  lastKey:number
  observer: any

  ngOnInit(): void {

    var url = this.router.url

    var arr = url.split('/')
    this.channelId = parseInt(arr[2])
    this.lastKey = 8

    this.observer = new IntersectionObserver((entry)=>{
      if(entry[0].isIntersecting){
        let card = document.querySelector(".videos")        
        for(let i = 0; i < 4; i++){
          
          if(this.lastKey < this.videos.length){
            let div = document.createElement("div")
            let video = document.createElement("app-video-display")
            video.setAttribute("vid",  "this.videos[this.lastKey]")
            div.appendChild(video)
            card.appendChild(div)
            this.lastKey++
          }
        }
      }
    })

    this.observer.observe(document.querySelector(".footer"))

    this.apollo.query<any>({
      query: gql `
        query getVideoByChannelId($channel_id: ID!){
          getVideoByChannelId(channel_id: $channel_id){
            id,
            channel_id,
            title,
            description,
            video_url,
            thumbnail,
            upload_day,
            upload_month,
            upload_year,
            category,
            location,
            view,
            privacy,
            is_premium,
            age_restricted,
            duration,
          }
        }
      `,
      variables:{
        channel_id: this.channelId
      }
    }).subscribe(result => {
      
      this.videos = result.data.getVideoByChannelId

      if(this.videos.length != 0){
        this.haveVideos = true
      }

      this.doneLoading = true
    })

  }

  sortVideoByView():void{
    this.videos.sort((a, b)=> (parseInt(a.view) > parseInt(b.view)) ? -1 : 1)
  }

  sortVideoByOldest():void{
    this.videos.sort((a, b) => (parseInt(a.id) > parseInt(b.id)) ? 1 : -1)
  }

  sortVideoByLatest():void{
    this.videos.sort((a, b) => (parseInt(a.id) > parseInt(b.id)) ? -1 : 1)    
  }

  toggleSortBy():void{
    if(document.getElementById('sortby-options').style.visibility == "hidden"){
      document.getElementById('sortby-options').style.visibility = "visible"
    }
    else{
      document.getElementById('sortby-options').style.visibility = "hidden"
    }
  }

}
