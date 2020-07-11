import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'youRJube';
  user : SocialUser
  loggedIn: boolean = false;

  constructor(private authService: SocialAuthService) { }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
    
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
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
    this.loggedIn = true;
  }

  signOut():void{
    this.authService.signOut(true);
    sessionStorage.clear();
    this.loggedIn = false;
  }

  switchAccount():void {
    this.signOut();
    this.signInWithGoogle();
  }

  isUserSignedIn():boolean{
    return this.loggedIn
  }
}