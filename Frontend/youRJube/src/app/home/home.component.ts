import { DataService } from './../data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

export const getVideoQuery = gql `
  query getHomeVideo($location: String!, $is_restrict: String!){
    getHomeVideo(location: $location, is_restrict: $is_restrict){
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
  userDB: any

  constructor(private apollo: Apollo, private data: DataService) { }


  ngOnInit(): void {
    this.data.locationObject.subscribe(locationObject => this.currLocation = locationObject)
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)

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

    var loc: String
    var restrict: String

    if(this.userDB){
      loc = this.userDB.location
      restrict = this.userDB.restrict_mode
    }
    else{
      console.log("Ga ada user");
      
      loc = this.currLocation
      restrict = "false"
    }

    console.log(loc);
    console.log(restrict);

    this.apollo.watchQuery<any>({
      query: gql `
        query getHomeVideo($is_restrict: String!){
          getHomeVideo(is_restrict: $is_restrict){
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
      `,variables:{
        is_restrict: restrict
      }     
    }).valueChanges.subscribe(result => {
      this.videos = result.data.getHomeVideo
      this.shuffle(this.videos)
      console.log(loc);
      
      this.videos.sort(a => a.location == loc ? -1 : 1)
    });
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
