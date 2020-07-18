import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit {

  channel: any
  subsCountOutput: String
  doneLoading: boolean = false;
  userChannel:any

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private apollo: Apollo,
    private data: DataService
  ) { }

  ngOnInit(): void {
    const channelId = +this.route.snapshot.paramMap.get('id');    
    this.data.currentChannelObject.subscribe(userChannelObject => this.userChannel = userChannelObject)
    
    this.apollo.query<any>({
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
        id: channelId
      }
    }).subscribe(result => {
      this.channel = result.data.getChannelById[0]

      this.subsCountOutput = this.convertSubs(this.channel.subscriber_count - 1)

      this.doneLoading = true;
    })
  }

  showSubscribeButton():boolean{
    if(this.userChannel == undefined){
      return true
    }
    else if(this.channel.id != this.userChannel.id){
      return true
    }

    return false
  }

  convertSubs(subs){
    if(subs >= 1000 && subs < 1000000){
      return (subs / 1000).toFixed(1) + "K subscribers"
    }
    else if(subs <= 1){
      return subs + " subscriber"
    }
    else if(subs < 1000){
      return subs + " subscribers"
    }
    else if(subs >= 1000000){
      return (subs / 1000000).toFixed(1) + "M subscribers" 
    }
  }

}
