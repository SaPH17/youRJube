import { Apollo } from 'apollo-angular';
import { Component, OnInit, Input } from '@angular/core';
import gql from 'graphql-tag';

@Component({
  selector: 'app-video-reply',
  templateUrl: './video-reply.component.html',
  styleUrls: ['./video-reply.component.scss']
})
export class VideoReplyComponent implements OnInit {

  @Input('rep')reply:{
    id,
    comment_id,
    channel_id,
    content,
    day,
    month,
    year,
  }

  userChannel:any
  doneLoading:boolean = false

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {

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
            join_year
          }
        }
      `,
      variables:{
        id: this.reply.channel_id
      }
    }).subscribe(result => {
      this.userChannel = result.data.getChannelById[0]

      this.doneLoading = true;
    })
  }

}
