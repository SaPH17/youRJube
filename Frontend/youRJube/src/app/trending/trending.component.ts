import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent implements OnInit {

  videos=[{
    id: 1,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    description: "Test2",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  },{
    id: 2,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    description: "Test2",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  },{
    id: 3,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    description: "Test2",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  },{
    id: 8,
    channel_id: 3,
    thumbnail: "https://firebasestorage.googleapis.com/v0/b/yourjube-b27a9.appspot.com/o/thumbnail%2F1594898707760_thumbnail3.png?alt=media&token=35930348-0bf3-4f54-8868-621773015922",
    title: "Test",
    description: "Test2",
    view: 100,
    upload_day: 18,
    upload_month: 7,
    upload_year: 2020
  }]

  constructor() { }

  ngOnInit(): void {
  }

}
