import { Apollo } from 'apollo-angular';
import { DataService } from './data.service';
import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import {Router} from '@angular/router';
import gql from 'graphql-tag';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  title = 'youRJube';
  user : SocialUser
  loggedIn: boolean = false;
  userDB: any
  userChannel: any

  restrictMode: boolean = false
  restrictModeOutput: String = "OFF"
  userPlaylist: any
  playlistLoaded:boolean = false

  country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua and Barbuda","Argentina","Armenia",
  "Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
  "Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo",
  "Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti",
  "Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands",
  "Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana",
  "Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras",
  "Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan",
  "Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya",
  "Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia",
  "Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman",
  "Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar",
  "Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka",
  "St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey",
  "Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan",
  "Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];



  constructor(private authService: SocialAuthService, private router: Router, private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });

    this.data.currentUserObject.subscribe(userObject => this.user = userObject)

    if(localStorage.getItem('user') == null){
      console.log("User is null");
      this.user == null
    }
    else{
      this.getUserFromStorage();
      this.data.changeUser(this.user)
      this.validateUserExistance()
    }

  }

  settingsClick(): void {
    if(document.getElementById('settings-dropdown').style.display == 'block'){
      document.getElementById('settings-dropdown').style.display = 'none'
    }
    else{
      document.getElementById('settings-dropdown').style.display = 'block'
    }
  }

  notifClick(): void {
    if(document.getElementById('notif-dropdown').style.display == 'block'){
      document.getElementById('notif-dropdown').style.display = 'none'
    }
    else{
      document.getElementById('notif-dropdown').style.display = 'block'
    }
  }

  userProfileClick():void {
    if(document.getElementById('user-dropdown').style.display == 'block'){
      document.getElementById('user-dropdown').style.display = 'none'
    }
    else{
      document.getElementById('user-dropdown').style.display = 'block'
    }

  }

  sideBarCollapse():void{
    if(document.getElementById('sidebar-container').className == 'sidebar-container'){
      document.getElementById('sidebar-container').className += ' collapse'
      document.getElementById('content-container').className += ' collapse'

    }
    else{
      document.getElementById('sidebar-container').className = 'sidebar-container'
      document.getElementById('content-container').className = 'content-container'
    }
  }

  showKeyboardShortcut(){
    document.getElementById('keyboard-shortcut').style.visibility = "visible"
  }

  hideKeyboardShortcut(){
    document.getElementById('keyboard-shortcut').style.visibility = "hidden"
  }

  deactivateAllButton():void{
    document.getElementById('homeButton').className = ""
    document.getElementById('trendingButton').className = ""
    document.getElementById('subscriptionButton').className = ""
    document.getElementById('categoryButton').className = ""
    document.getElementById('membershipButton').className = ""
    if(this.user != null){
      for(let i = 0; i < this.userPlaylist.length; i++){
        var id = "playlistButton-" + this.userPlaylist[i].id
        document.getElementById(id).className = "" 
      }
    }
  }

  changeActive(e):void{
    this.deactivateAllButton()
    if(e.target.className != "icon" && e.target.className != "title" && e.target.tagName != "I"){
      e.target.className = "active"
    }
    else if(e.target.tagName == "I"){
      e.target.parentElement.parentElement.className = "active"
    }
    else{
      e.target.parentElement.className = "active"
    }
  }

  signInWithGoogle():void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).finally(()=>{
      if(this.user){
        this.data.changeUser(this.user)
        this.loggedIn = true;
        this.addToLocalStorage(this.user)
        this.validateUserExistance()
      }
    })
  }

  validateUserExistance():void{

    console.log(this.user);
    
    this.apollo.query<any>({
      query: gql `
        query getUserByEmail($email: String!){
          getUserByEmail(email: $email){
            id,
            email,
            restrict_mode,
            location,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment
          }
        }
      `,
      variables:{
        email: this.user.email
      }
    }).subscribe(result => {
      this.userDB = result.data.getUserByEmail[0]
      console.log(this.userDB);

      if(this.userDB === undefined || this.userDB.length == 0){
        
        this.apollo.mutate<any>({
          mutation: gql`
            mutation insertUser($email: String!, $restrict_mode: String!, $location: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!){
              createUser(input: {email: $email, restrict_mode: $restrict_mode, location: $location, liked_video: $liked_video, disliked_video: $disliked_video, liked_comment: $liked_comment, disliked_comment: $disliked_comment}){
                id,
                email,
                restrict_mode,
                location,
                liked_video,
                disliked_video,
                liked_comment,
                disliked_comment
              }
            }
          `,
          variables:{
            email: this.user.email,
            restrict_mode: this.restrictMode.toString(),
            location: "Indonesia",
            liked_video: ",",
            disliked_video: ",",
            liked_comment: ",",
            disliked_comment: ","
          }
        }).subscribe(result =>{
          this.userDB = result.data.createUser
          this.insertNewChannel()
          this.data.changeUserDB(this.userDB)
          if(this.userDB.restrict_mode == "false"){
            this.restrictMode = false
            this.restrictModeOutput= "OFF"
          }
          else{
            this.restrictMode = true
            this.restrictModeOutput = "ON"
          }
        })
      }
      else{
        console.log("AA");

        this.data.changeUserDB(this.userDB) 

        if(this.userDB.restrict_mode == "false"){
          this.restrictMode = false
          this.restrictModeOutput= "OFF"
        }
        else{
          this.restrictMode = true
          this.restrictModeOutput = "ON"
        }       

        console.log(this.userDB.id)
        console.log("DB ==");
        
        this.apollo.query<any>({
          query: gql `
            query getChannelByUserID($user_id: ID!){
              getChannelByUserID(user_id: $user_id){
                id,
                user_id,
                background_image,
                icon,
                description,
                join_day,
                join_month,
                join_year,
                name
              }
            }
          `,
          variables:{
            user_id: this.userDB.id
          }
        }).subscribe(result => {
          console.log(result.data.getChannelByUserID)
          this.userChannel = result.data.getChannelByUserID[0]
          this.data.changeChannel(result.data.getChannelByUserID[0])
          this.getUserPlaylist()
        })
      }
    })

  }

  getUserPlaylist():void{        

    this.apollo.watchQuery<any>({
      query: gql `
        query getPlaylistByChannelId($channel_id: ID!){
          getPlaylistByChannelId(channel_id: $channel_id){
            id,
            channel_id,
            title,
            description,
            privacy,
            thumbnail,
            last_updated_day,
            last_updated_month,
            last_updated_year,
            view,
            video_id,
          }
        }    
      `,
      variables:{
        channel_id: this.userChannel.id
      }
    }).valueChanges.subscribe(result => {
      this.userPlaylist = result.data.getPlaylistByChannelId
      console.log(this.userPlaylist);
      this.playlistLoaded = true
    })
  }

  insertNewChannel():void{

    var currentDate = new Date()

    this.apollo.mutate<any>({
      mutation: gql`
        mutation insertChannel($user_id: ID!, $name: String! ,$icon: String!){
          createChannel(input: {
            user_id: $user_id, 
            background_image: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/channel-background-image%2Fdefault_bgimage.jpg?alt=media&token=35ea0c55-14ab-422d-9b39-643a1d332bb4",
            icon: $icon,
            description: "No description given",
            name: $name,
            subscriber_count: 1
          }){
            id,
            user_id,
          }
        }
      `,
      variables:{
        user_id: this.userDB.id,
        name: this.user.name,
        icon: this.user.photoUrl
      }
    }).subscribe(result => {
      console.log(result)
      this.data.changeChannel(result)
    })

  }

  signOut():void{
    this.authService.signOut(true);
    sessionStorage.clear();

    this.data.changeUser(null)
    this.removeUser()

    this.router.navigate(['./home']);
    this.deactivateAllButton();
    document.getElementById('homeButton').className = "active"

    this.loggedIn = false;
  }

  switchAccount():void {
    this.signOut();
    this.signInWithGoogle();
  }

  isUserSignedIn():boolean{
    return this.loggedIn
  }

  addToLocalStorage(user){
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  getUserFromStorage(){    
    this.user = JSON.parse(localStorage.getItem('user'));
    
    this.loggedIn = true;
  }

  removeUser(){
    window.localStorage.clear();
    this.loggedIn = false;
  }

  toggleRestrictedMode(){
    if(this.restrictMode){
      this.restrictMode = false;
      this.restrictModeOutput = "OFF"
    }
    else{
      this.restrictMode = true;
      this.restrictModeOutput = "ON"
    }

    if(this.userDB){
      this.updateUserRestrictMode()
    }

  }

  updateUserRestrictMode(){

    var str: string

    if(this.restrictMode){
      str = "true"
    }
    else{
      str = "false"
    }

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: str,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video
      },
      // refetchQueries: [{
      //   query: getUserSubsQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //               user_id: this.userDB.id,
      //               channel_id: this.channel.id,
      //             },
      // }],
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)
    })   
  }
  
  checkCurrentLocation(v){
    if(this.userDB){
      return v == this.userDB.location
    }

    return v == "Indonesia"
  }

  openLocationModal():void{
    document.getElementById('select-country').style.visibility = "visible"
  }

  hideLocationModal():void{
    document.getElementById('select-country').style.visibility = "hidden"
  }

  changeCurrentLocation(e){
    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: e,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video
      },
      // refetchQueries: [{
      //   query: getUserSubsQuery,
      //   variables: { repoFullName: 'apollographql/apollo-client' ,
      //               user_id: this.userDB.id,
      //               channel_id: this.channel.id,
      //             },
      // }],
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)
    })  
  }

}