import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  videos: any
  private querySubs: Subscription

  constructor(private apollo: Apollo) { }

  ngOnDestroy(): void{
    this.querySubs.unsubscribe()
  }

  ngOnInit(): void {
    this.querySubs = this.apollo.watchQuery<any>({
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
      `,
    }).valueChanges.subscribe(({data, loading}) => {
      this.videos = data.getVideo
    })
  }
}
