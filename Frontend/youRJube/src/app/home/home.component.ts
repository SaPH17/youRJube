import { DataService } from './../data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

export const getVideoQuery = gql `
  query getVideo{
    getVideo{
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
      age_restricted
    }
  }
  `

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  videos: any
  lastKey: number
  observer: any

  currLocation:String

  constructor(private apollo: Apollo, private data: DataService) { }


  ngOnInit(): void {
    this.data.locationObject.subscribe(locationObject => this.currLocation = locationObject)

    this.lastKey = 8

    this.observer = new IntersectionObserver((entry)=>{
      if(entry[0].isIntersecting){
        let card = document.querySelector(".recommended-video-container")
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

    this.getVideoQuery()
  }

  getVideoQuery():void{
    this.apollo.watchQuery<any>({
      query: gql `
        query getVideo{
          getVideo{
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
            duration
          }
        }
      `
    }).valueChanges.subscribe(result => {
      this.videos = result.data.getVideo
    })
  }
}
