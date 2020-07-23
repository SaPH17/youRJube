import { Apollo } from 'apollo-angular';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-category-music',
  templateUrl: './category-music.component.html',
  styleUrls: ['./category-music.component.scss']
})
export class CategoryMusicComponent implements OnInit {

  allTimeVideos: any
  thisWeekVideos = []
  thisMonthVideos = []
  recentVideos = []

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {    

    this.apollo.query<any>({
      query: gql `
        query getCategoryVideo($category: String!){
          getCategoryVideo(category: $category){
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
        category: "Music"
      }
    }).subscribe(result => {  
      this.allTimeVideos = result.data.getCategoryVideo     
             
      this.filterThisWeek()
      this.filterThisMonth()
      this.filterRecentVideos()
      
    })
  }

  filterThisWeek():void{
    var currDate = new Date()

    for(let i = 0; i < this.allTimeVideos.length; i++){
      var v = this.allTimeVideos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff <= 7){
        this.thisWeekVideos.push(v)
      }
      
    }
  }

  filterThisMonth():void{
    var currDate = new Date()

    for(let i = 0; i < this.allTimeVideos.length; i++){
      var v = this.allTimeVideos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff <= 30){
        this.thisMonthVideos.push(v)
      }
      
    }

  }

  filterRecentVideos():void{
    console.log(this.allTimeVideos);

    for(let i = 0; i < this.allTimeVideos.length; i++){
      this.recentVideos.push(this.allTimeVideos[i])
    }

    this.recentVideos.sort((a,b) => (parseInt(a.id) > parseInt(b.id)) ? -1 : 1)  
    console.log(this.allTimeVideos);
      
  }
}
