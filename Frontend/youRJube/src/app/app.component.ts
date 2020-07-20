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
      document.getElementById('playlistButton').className = "" 
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
            disliked_video
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
            mutation insertUser($email: String!, $restrict_mode: String!, $location: String!, $liked_video: String!, $disliked_video: String!){
              createUser(input: {email: $email, restrict_mode: $restrict_mode, location: $location, liked_video: $liked_video, disliked_video: $disliked_video}){
                id,
                email,
                restrict_mode,
                location,
                liked_video,
                disliked_video
              }
            }
          `,
          variables:{
            email: this.user.email,
            restrict_mode: this.restrictMode.toString(),
            location: "Indonesia",
            liked_video: ",",
            disliked_video: ","
          }
        }).subscribe(result =>{
          this.userDB = result.data.createUser
          this.insertNewChannel()
          this.data.changeUserDB(this.userDB)
        })
      }
      else{
        console.log("AA");

        this.data.changeUserDB(this.userDB)        
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
        })
      }
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
  


}