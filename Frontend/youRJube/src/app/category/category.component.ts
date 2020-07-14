import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  videos = [{
    id:1,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:2,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:3,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:4,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:5,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:6,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:7,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  },{
    id:8,
    vidthumbnail: "../../assets/thumbnail.jpg",
    vidpropic: "../../assets/1x1.png"
  }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
