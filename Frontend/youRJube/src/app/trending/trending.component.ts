import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent implements OnInit {

  videos: any

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.apollo.watchQuery<any>({
      query: gql `
        query getTrendingVideo{
          getTrendingVideo{
            id,
            channel_id,
            title,
            description,
            video_url,
            thumbnail,
            upload_day,
            upload_month,
            upload_year
            category,
            location,
            view,
            privacy,
            is_premium,
            age_restricted,
            like,
            dislike,
            duration
          }
        }
      `
    }).valueChanges.subscribe(result =>{
      this.videos = result.data.getTrendingVideo
      this.filterVideo()
    })
  }

  filterVideo():void{
    var currDate = new Date()

    for(let i = 0; i < this.videos.length; i++){
      var v = this.videos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff > 7){
        this.videos.splice(i, 1)
      }
    }
  }

}
