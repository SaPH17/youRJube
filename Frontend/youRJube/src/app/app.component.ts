import { IpServiceService } from './ip-service.service';
import { Apollo } from 'apollo-angular';
import { DataService } from './data.service';
import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import {Router} from '@angular/router';
import gql from 'graphql-tag';
// import IPinfoWrapper from "node-ipinfo";
const IPinfoWrapper = require ('node-ipinfo');

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

  userIPAddress: String

  token = "eacfce37620a0b"
  ipInfoWrapper = new IPinfoWrapper(this.token)
  userLocation: String
  restrictedMode: String

  searchQuery: String
  contentLoaded:boolean

  showNotif:boolean = false
  showUserProf:boolean = false
  showSettings:boolean = false
  showLoginModal:boolean = false
  showAllPlaylist:boolean = false
  currPlaylistCount:number = 5

  channelIds = []
  channels = []
  channelLoaded: boolean = false
  currChannelCount:number = 10
  showAllChannel:boolean = false

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

  constructor(private authService: SocialAuthService, private router: Router, private data: DataService, private apollo: Apollo
    , private ip: IpServiceService) { }

  ngOnInit(): void {
    this.data.currentUserObject.subscribe(userObject => this.user = userObject)
    this.data.locationObject.subscribe(locationObject => this.userLocation = locationObject)
    this.data.restrictedModeObject.subscribe(restrictedModeObject => this.restrictMode = restrictedModeObject)
    this.data.changeRestrictedMode("false")
    this.getLocation()

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });

    if(localStorage.getItem('user') == null){
      console.log("User is null");
      this.user == null
    }
    else{
      this.getUserFromStorage();
      this.data.changeUser(this.user)
      this.validateUserExistance()
    }

    var input = document.getElementById('searchbox')
    input.addEventListener("keydown", (e) => {
      if(e.keyCode === 13){
        this.searchVideo()
      }
    })

  }

  getLocation(){
    this.ip.getIPAddress().subscribe((res:any) =>{
      this.userIPAddress = res.ip

      this.ipInfoWrapper.lookupIp(this.userIPAddress).then((response: any) => {
        this.userLocation = response.country
        console.log(this.userLocation);
        this.data.changeLocation(this.userLocation)
        if(this.loggedIn == false){
          this.contentLoaded = true
        }
      });
    })
  }

  settingsClick(): void {
    this.showSettings = !this.showSettings
  }

  notifClick(): void {
    this.showNotif = !this.showNotif
  }

  userProfileClick():void {
    this.showUserProf = !this.showUserProf
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
      for(let i = 0; i < this.currPlaylistCount; i++){
        var id = "playlistButton-" + this.userPlaylist[i].id        
        document.getElementById(id).className = "" 
      }
      // for(let i = 0; i < this.currChannelCount; i++){
      //   var id = "channelButton-" + this.channels[i].id   
      //   console.log(id);
             
      //   document.getElementById(id).className = "" 
      // }
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
        this.loggedIn = true
        this.showLoginModal = false
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
            disliked_comment,
            liked_post,
            disliked_post
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

        this.getLocation()
        
        this.apollo.mutate<any>({
          mutation: gql`
            mutation insertUser($email: String!, $restrict_mode: String!, $location: String!, $liked_video: String!, $disliked_video: String!, $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
              createUser(input: {email: $email, restrict_mode: $restrict_mode, location: $location, liked_video: $liked_video, disliked_video: $disliked_video, liked_comment: $liked_comment, disliked_comment: $disliked_comment, liked_post: $liked_post, disliked_post: $disliked_post}){
                id,
                email,
                restrict_mode,
                location,
                liked_video,
                disliked_video,
                liked_comment,
                disliked_comment,
                liked_post,
                disliked_post
              }
            }
          `,
          variables:{
            email: this.user.email,
            restrict_mode: this.restrictMode.toString(),
            location: this.userLocation,
            liked_video: ",",
            disliked_video: ",",
            liked_comment: ",",
            disliked_comment: ",",
            liked_post: ",",
            disliked_post: ","
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

        if(this.userDB){
          this.data.changeLocation(this.userDB.location)          
        }
        else{
          this.getLocation()
        }

        if(this.userDB.restrict_mode == "false"){
          this.restrictMode = false
          this.restrictModeOutput= "OFF"
        }
        else{
          this.restrictMode = true
          this.restrictModeOutput = "ON"
        }       

        this.data.changeRestrictedMode(this.restrictMode)

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
          this.contentLoaded = true;
          this.getUserPlaylist()
          this.loadUserSubscribedChannel()
        })
      }
    })

  }

  getUserPlaylist():void{        

    this.apollo.query<any>({
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
    }).subscribe(result => {
      this.userPlaylist = result.data.getPlaylistByChannelId
      console.log(this.userPlaylist);
      this.userPlaylist.sort( a => a.privacy == "Private" ? -1 : 1)
      this.playlistLoaded = true
    })
  }

  toggleShowPlaylist():void{
    this.showAllPlaylist = !this.showAllPlaylist
    if(this.showAllPlaylist){
      this.currPlaylistCount = this.userPlaylist.length
    }
    else{
      this.currPlaylistCount = 5
    }
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
      this.contentLoaded = true;
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
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!
            $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
          updateUser(id: $id, input:{
            email: $email,
            location: $location,
            restrict_mode: $restrict_mode
            liked_video: $liked_video,
            disliked_video: $disliked_video,
            liked_comment: $liked_comment,
            disliked_comment: $disliked_comment,
            liked_post: $liked_post,
            disliked_post: $disliked_post
          }){
            id,
            email,
            location,
            restrict_mode,
            liked_video,
            disliked_video,
            liked_comment,
            disliked_comment,
            liked_post,
            disliked_post,
          }
        }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: this.userDB.location,
        restrict_mode: str,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: this.userDB.disliked_post
      },
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

    return v == this.userLocation
  }

  openLocationModal():void{
    document.getElementById('select-country').style.visibility = "visible"
  }

  hideLocationModal():void{
    document.getElementById('select-country').style.visibility = "hidden"
  }

  changeCurrentLocation(e){

    this.data.changeLocation(e)

    this.apollo.mutate<any>({
      mutation: gql`
        mutation updateUser($id: ID!, $email: String!, $location: String!, $restrict_mode: String!, $liked_video: String!, $disliked_video: String!
          $liked_comment: String!, $disliked_comment: String!, $liked_post: String!, $disliked_post: String!){
        updateUser(id: $id, input:{
          email: $email,
          location: $location,
          restrict_mode: $restrict_mode
          liked_video: $liked_video,
          disliked_video: $disliked_video,
          liked_comment: $liked_comment,
          disliked_comment: $disliked_comment,
          liked_post: $liked_post,
          disliked_post: $disliked_post
        }){
          id,
          email,
          location,
          restrict_mode,
          liked_video,
          disliked_video,
          liked_comment,
          disliked_comment,
          liked_post,
          disliked_post,
        }
      }
      `,
      variables:{
        id: this.userDB.id,
        email: this.userDB.email,
        location: e,
        restrict_mode: this.userDB.restrict_mode,
        liked_video: this.userDB.liked_video,
        disliked_video: this.userDB.disliked_video,
        liked_comment: this.userDB.liked_comment,
        disliked_comment: this.userDB.disliked_comment,
        liked_post: this.userDB.liked_post,
        disliked_post: this.userDB.disliked_post
      },
    }).subscribe(result =>{
      console.log(result.data.updateUser);
      this.userDB = result.data.updateUser
      this.data.changeUserDB(this.userDB)
    })  
  }

  searchVideo():void{
    var newUrl = 'search/' + this.searchQuery
    this.router.navigate([newUrl])
  }

  loadUserSubscribedChannel():void{
    this.apollo.watchQuery<any>({
      query: gql `
        query getUserSubscriptionByUserId($user_id: ID!){
          getUserSubscriptionByUserId(user_id: $user_id){
            id,
            user_id,
            channel_id,
            subscribe_day,
            subscribe_month,
            subscribe_year,
            should_notify
          }
        }
      `,
      variables:{
        user_id: this.userDB.id
      }
    }).valueChanges.subscribe(result =>{
      var val = result.data.getUserSubscriptionByUserId
      
      for(let i = 0; i < val.length; i++){
        this.channelIds.push(val[i].channel_id)
      }

      this.loadSubscribedChannel()

    })
  }

  loadSubscribedChannel():void{
    for(let i = 0; i < this.channelIds.length; i++){
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
          id: this.channelIds[i]
        }
      }).subscribe(result => {
        this.channels.push(result.data.getChannelById[0])
        // for(i = 0; i < 10; i++){
        //   this.channels.push(result.data.getChannelById[0])
        // }
      })
    }
    console.log(this.channels);
    this.channelLoaded = true
    
  }

  toggleShowChannel():void{
    this.showAllChannel = !this.showAllChannel
    if(this.showAllChannel){
      this.currChannelCount = this.channels.length
    }
    else{
      this.currChannelCount = 10
    }
  }
}