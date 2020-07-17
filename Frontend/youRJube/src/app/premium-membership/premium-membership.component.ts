import { Apollo } from 'apollo-angular';
import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import gql from 'graphql-tag';
import { parse } from 'path';

@Component({
  selector: 'app-premium-membership',
  templateUrl: './premium-membership.component.html',
  styleUrls: ['./premium-membership.component.scss']
})
export class PremiumMembershipComponent implements OnInit {

  userDB: any
  choosenPlan: String = ""

  billingHistory: any
  currentPlan: any

  doneLoading: boolean = false;

  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)
    
    console.log(this.userDB);
    console.log(this.userDB.id);
    

    this.apollo.watchQuery<any>({
      query: gql`
        query getPremiumSubscriptionByUserId($user_id: ID!){
          getPremiumSubscriptionByUserId(user_id: $user_id){
            id,
            user_id,
            start_day,
            start_month,
            start_year,
            end_day,
            end_month,
            end_year,
            plan,
          }
        }
      `,
      variables:{
        user_id: this.userDB.id
      }
    }).valueChanges.subscribe(result => {
      
      this.billingHistory = result.data.getPremiumSubscriptionByUserId
      this.getCurrentPlan()

      this.doneLoading = true
    })
  }

  getCurrentPlan():void{
    var date = new Date()
    
    var currentDay = parseInt(date.getDate().toString())
    var currentMonth = parseInt((date.getMonth() + 1).toString())
    var currentYear = parseInt(date.getFullYear().toString())

    this.billingHistory.forEach(e => {
      
      if(currentDay >= parseInt(e.start_day) && currentDay <= parseInt(e.end_day) &&
        currentMonth >= parseInt(e.start_month) && currentMonth <= parseInt(e.end_month) &&
          currentYear >= parseInt(e.start_year) && currentYear <= parseInt(e.end_year)){
            this.currentPlan = e
          }
    });
    
  }

  userHasPremium():boolean{
    if(this.billingHistory == undefined || this.billingHistory.length == 0){
      return false
    }
    return true
  }

  registerPlan():void{
    if(this.choosenPlan == ""){
      document.getElementById('error').innerHTML = "Please choose a plan!"
      document.getElementById('error').style.visibility = "visible"
    }
    else if(this.userDB == null){
      document.getElementById('error').innerHTML = "Please sign in first!"
      document.getElementById('error').style.visibility = "visible"
    }
    else{
      document.getElementById('error').style.visibility = "hidden"
      this.createPremiumSubscription()
    }
  }

  createPremiumSubscription():void{    

    this.apollo.mutate<any>({
      mutation: gql`
        mutation createPremiumSubscription($user_id: ID!, $plan: String!){
          createPremiumSubscription(input: {
            user_id: $user_id,
            plan: $plan
          }){
            id
          }
        }
      `,
      variables:{
        user_id: this.userDB.id,
        plan: this.choosenPlan
      }
    }).subscribe(result => {
      console.log(result);
    })
  }

  changePlan(e):void{
    this.choosenPlan = e.target.value
  }

  convertMonthToText(month){
    if(month == 1){
      return "Jan"
    }
    else if(month == 2){
      return "Feb"
    }
    else if(month == 3){
      return "Mar"
    }
    else if(month == 4){
      return "Apr"
    }
    else if(month == 5){
      return "May"
    }
    else if(month == 6){
      return "Jun"
    }
    else if(month == 7){
      return "Jul"
    }
    else if(month == 8){
      return "Aug"
    }
    else if(month == 9){
      return "Sep"
    }
    else if(month == 10){
      return "Oct"
    }
    else if(month == 11){
      return "Nov"
    }
    else{
      return "Dec"
    }
  }

}
