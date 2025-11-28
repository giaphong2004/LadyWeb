import { Component, OnInit, OnDestroy, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.css'],
  standalone: false
})
export class GetStartedComponent implements OnInit, OnDestroy {

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.addClass(document.body, 'get-started-page');
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeClass(document.body, 'get-started-page');
    }
  }
}
