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

    constructor() {
        
    }
}