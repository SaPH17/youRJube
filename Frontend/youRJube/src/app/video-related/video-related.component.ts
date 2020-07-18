import { DataService } from './../data.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-video-related',
  templateUrl: './video-related.component.html',
  styleUrls: ['./video-related.component.scss']
})
export class VideoRelatedComponent implements OnInit {

  @Input('vid')video:{
    id
    channel_id,
    thumbnail,
    title,
    view,
    upload_day,
    upload_month,
    upload_year,
  }

  viewOutput: String
  dateOutput: String
  userDB: any

  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.data.currentUserDBObject.subscribe(userDBObject => this.userDB = userDBObject)

    this.viewOutput = this.convertView(this.video.view)
    this.dateOutput = this.convertDate(this.video.upload_day, this.video.upload_month - 1, this.video.upload_year)
  }

  convertDate(day, month, year){
    var currentDate = new Date()
    
    if(currentDate.getDate() == day){
      return "Today"
    }
    else if(currentDate.getMonth() == month && currentDate.getDate() - day < 7){
      return (currentDate.getDate() - day).toString() + " day(s) ago"
    }
    else if(currentDate.getMonth() == month && currentDate.getDate() - day > 7 ){
      return (Math.floor((currentDate.getDate() - day) / 7)).toString() + " week(s) ago"
    }
    else if(currentDate.getFullYear() == year){
      return (currentDate.getMonth() - month).toString() + " month(s) ago"
    }
    else if(currentDate.getFullYear() - year > 0){
      return (currentDate.getFullYear() - year ).toString() + " year(s) ago"
    }
  }

  convertView(view){
    if(view >= 1000 && view < 1000000){
      return (view / 1000).toFixed(1) + "K views"
    }
    else if(view <= 1){
      return view + " view"
    }
    else if(view < 1000){
      return view + " views"
    }
    else if(view >= 1000000){
      return (view / 1000000).toFixed(1) + "M views" 
    }
  }

  isUserSignedIn(){
    if(this.userDB == null){
      return false;
    }

    return true
  }

  settingsClick(): void {
    var componentId = "video-settings-dropdown-" + this.video.id.toString()
    console.log(componentId)
    if(document.getElementById(componentId).style.display == 'block'){
      document.getElementById(componentId).style.display = 'none'
    }
    else{
      document.getElementById(componentId).style.display = 'block'
    }
  }
}
