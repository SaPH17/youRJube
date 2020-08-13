import { DataService } from './../data.service';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import gql from 'graphql-tag';

export const getChannelQuery = gql `
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
`

const getUserSubsQuery = gql`
  query getUserSubscriptionByUserIdAndChannelId($user_id: ID!, $channel_id: ID!){
    getUserSubscriptionByUserIdAndChannelId(user_id: $user_id, channel_id: $channel_id){
      id,
      user_id,
      channel_id,
      subscribe_day,
      subscribe_month,
      subscribe_year,
      should_notify
    }
  }
`

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

  userSubCondition: number
  userDB: any

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private apollo: Apollo,
    private data: DataService
  ) { }

  ngOnInit(): void {
    const channelId = +this.route.snapshot.paramMap.get('id');    
    this.data.currentChannelObject.subscribe(userChannelObject => this.userChannel = userChannelObject)
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    
    this.apollo.watchQuery<any>({
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
    }).valueChanges.subscribe(result => {
      this.channel = result.data.getChannelById[0]

      this.subsCountOutput = this.convertSubs(this.channel.subscriber_count - 1)

      this.doneLoading = true;

      this.userHasSubscribed()
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

  subscribeToChannel():void{

    if(this.userDB){
      
      this.apollo.mutate<any>({
        mutation: gql`
          mutation createUserSubscription($user_id: ID!, $channel_id: ID!, $should_notify: String!){
            createUserSubscription(
              input: {
                user_id: $user_id,
                channel_id: $channel_id,
                should_notify: $should_notify
              }
            ){
              id
            }
          }
        `,
        variables:{
          user_id: this.userDB.id,
          channel_id: this.channel.id,
          should_notify: "false"
        },
        refetchQueries:[{
          query: getUserSubsQuery,
          variables: { repoFullName: 'apollographql/apollo-client',
                      user_id: this.userDB.id,
                      channel_id: this.channel.id, },
        }]
      }).subscribe(result => {
        console.log(result)
      })

      this.updateChannelSubs(this.channel.subscriber_count + 1)

    }
  }

  userHasSubscribed():void{
    var res

    if(this.userDB == undefined || this.userDB == null){
      this.userSubCondition = 0
    }

    this.apollo.watchQuery<any>({
      query: gql`
        query getUserSubscriptionByUserIdAndChannelId($user_id: ID!, $channel_id: ID!){
          getUserSubscriptionByUserIdAndChannelId(user_id: $user_id, channel_id: $channel_id){
            id,
            should_notify
          }
        }
      `,
      variables:{
        user_id: this.userDB.id,
        channel_id: this.channel.id,
      }
    }).valueChanges.subscribe(result => {
      console.log(result)
      res = result.data.getUserSubscriptionByUserIdAndChannelId[0]

      if(res == undefined){
        this.userSubCondition = 0
      }
      else if(res.should_notify == "false"){
        this.userSubCondition = 1
      }
      else if(res.should_notify == "true"){
        this.userSubCondition = 2
      }
      else{
        this.userSubCondition = 0
      }
      
    })

  }

  unsubscribeToChannel():void{
    if(this.userDB){
      this.apollo.mutate({
        mutation: gql`
          mutation deleteUserSubscription($user_id: ID!, $channel_id: ID!){
            deleteUserSubscription(user_id: $user_id, channel_id: $channel_id)
          }
        `,
        variables:{
          user_id: this.userDB.id,
          channel_id: this.channel.id,
        },
        refetchQueries: [{
          query: getUserSubsQuery,
          variables: { repoFullName: 'apollographql/apollo-client' ,
                      user_id: this.userDB.id,
                      channel_id: this.channel.id,
                    },
        }],
      }).subscribe(result =>{
        console.log(result);
      })    
    }

    this.updateChannelSubs(this.channel.subscriber_count - 1)

  }

  changeUserSubsNotif(value):void{

    this.apollo.mutate({
      mutation: gql`
        mutation updateUserSubscription($user_id: ID!, $channel_id: ID!, $should_notify: String!){
          updateUserSubscription(user_id: $user_id, channel_id: $channel_id, input:{
            user_id: $user_id,
            channel_id: $channel_id,
            should_notify: $should_notify,
          }){
            id
          }
        }
      `,
      variables:{
        user_id: this.userDB.id,
        channel_id: this.channel.id,
        should_notify: value
      },
      refetchQueries: [{
        query: getUserSubsQuery,
        variables: { repoFullName: 'apollographql/apollo-client' ,
                    user_id: this.userDB.id,
                    channel_id: this.channel.id,
                  },
      }],
    }).subscribe(result =>{
      console.log(result);
      
    })    
  }

  updateChannelSubs(newSubs){
    this.apollo.mutate<any>({
    mutation: gql`
      mutation updateChannel($id: ID!, $user_id: ID!, $name: String!, $background_image: String!, $icon: String!, $description: String!
          $subscriber_count: Int!){
        updateChannel(id: $id, input:{
          user_id: $user_id,
          name: $name,
          background_image: $background_image,
          icon: $icon,
          description: $description,
          subscriber_count: $subscriber_count
        }){
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
      id: this.channel.id,
      user_id: this.channel.user_id,
      name: this.channel.name,
      background_image: this.channel.background_image,
      icon: this.channel.icon,
      description: this.channel.description,
      subscriber_count: newSubs
    },
    refetchQueries: [{
      query: getChannelQuery,
      variables: { repoFullName: 'apollographql/apollo-client' ,
                    id: this.channel.id
                },
    }],
  }).subscribe(result => {
    console.log(result);
    this.channel = result.data.updateChannel
    this.subsCountOutput = (this.channel.subscriber_count -1) + " subscriber(s)"      
    })
  }

}
