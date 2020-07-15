import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';
import { SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-premium-membership',
  templateUrl: './premium-membership.component.html',
  styleUrls: ['./premium-membership.component.scss']
})
export class PremiumMembershipComponent implements OnInit {

  user: SocialUser
  choosenPlan: String = ""

  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
  }

  registerPlan():void{
    if(this.choosenPlan == ""){
      document.getElementById('error').innerHTML = "Please choose a plan!"
      document.getElementById('error').style.visibility = "visible"
    }
    else if(this.user == null){
      document.getElementById('error').innerHTML = "Please sign in first!"
      document.getElementById('error').style.visibility = "visible"
    }
    else{
      document.getElementById('error').style.visibility = "hidden"
      console.log("SUCCESS")
    }
  }

  changePlan(e):void{
    this.choosenPlan = e.target.value
  }

}
