import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'youRJube';

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

  sideBarCollapse(){
    if(document.getElementById('sidebar-container').className == 'sidebar-container'){
      document.getElementById('sidebar-container').className += ' collapse'
      document.getElementById('content-container').className += ' collapse'

    }
    else{
      document.getElementById('sidebar-container').className = 'sidebar-container'
      document.getElementById('content-container').className = 'content-container'
    }
  }
}