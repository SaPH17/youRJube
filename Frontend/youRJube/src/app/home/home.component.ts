import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  videos: any

  constructor(private apollo: Apollo) { }


  ngOnInit(): void {
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
            age_restricted
          }
        }
      `
    }).valueChanges.subscribe(result => {
      this.videos = result.data.getVideo
    })
  }
}
