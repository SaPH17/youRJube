import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-video-search',
  templateUrl: './video-search.component.html',
  styleUrls: ['./video-search.component.scss']
})
export class VideoSearchComponent implements OnInit {

  searchQuery:String
  rawVideos: any
  videos: any
  restrictedMode: String

  show:boolean = false

  constructor(private route: ActivatedRoute, private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {

    this.data.restrictedModeObject.subscribe(restrictedModeObject => this.restrictedMode = restrictedModeObject)

    this.route.paramMap.subscribe(params => {
      this.searchQuery = params.get('query')
      this.loadVideo()
    })
  }

  loadVideo():void{
    console.log(typeof this.searchQuery);
    console.log(this.searchQuery);
    console.log(this.restrictedMode);
    
    
    this.apollo.watchQuery<any>({
      query: gql `
        query getVideoByTitle($title: String!, $is_restrict: String!){
          getVideoByTitle(title: $title, is_restrict: $is_restrict){
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
      `,
      variables:{
        title: this.searchQuery,
        is_restrict: this.restrictedMode
      }     
    }).valueChanges.subscribe(result => {
      console.log(result);
      
      this.rawVideos = result.data.getVideoByTitle
      this.videos = this.rawVideos
    })
  }

  toggleFilterOptions():void{
    this.show = !this.show
  }

  filterThisWeek():void{
    this.videos = []

    var currDate = new Date()

    for(let i = 0; i < this.rawVideos.length; i++){
      var v = this.rawVideos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff <= 7){
        this.videos.push(this.rawVideos[i])
      }
      
    }
  }

  filterThisMonth():void{
    this.videos = []

    var currDate = new Date()

    for(let i = 0; i < this.rawVideos.length; i++){
      var v = this.rawVideos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff <= 30){
        this.videos.push(this.rawVideos[i])
      }
      
    }
  }

  filterThisYear():void{
    this.videos = []

    var currDate = new Date()

    for(let i = 0; i < this.rawVideos.length; i++){
      var v = this.rawVideos[i]

      var date = new Date(parseInt(v.upload_year), parseInt(v.upload_month) - 1, parseInt(v.upload_day))

      var diff = Math.floor((Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - 
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) /(1000 * 60 * 60 * 24))

      if(diff <= 365){
        this.videos.push(this.rawVideos[i])
      }
      
    }
  }

}
