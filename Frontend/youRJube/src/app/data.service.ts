import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { SocialUser } from 'angularx-social-login';

@Injectable()
export class DataService {

    private userObjectSource = new BehaviorSubject<SocialUser>(null);
    currentUserObject = this.userObjectSource.asObservable();

    changeUser(newUser: SocialUser){
        this.userObjectSource.next(newUser)
    }

    private userDBObjectSource = new BehaviorSubject<any>(null);
    currentUserDBObject = this.userDBObjectSource.asObservable();

    changeUserDB(newUserDB: any){
        this.userDBObjectSource.next(newUserDB)
    }

    private channelObjectSource = new BehaviorSubject<any>(null);
    currentChannelObject = this.channelObjectSource.asObservable();

    changeChannel(newChannel: any){
        this.channelObjectSource.next(newChannel)
    }

    private locationObjectSource = new BehaviorSubject<any>(null)
    locationObject = this.locationObjectSource.asObservable();

    changeLocation(newLocation: any){
        this.locationObjectSource.next(newLocation)
    }

    constructor() {
        
    }
}