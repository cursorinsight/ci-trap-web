import { Component, ElementRef, ViewChild } from '@angular/core';

// Import Trap client
import trap from 'ci-trap/dist/trap.min.js';

// Set up Trap
trap.apiKey('example-api-key');
trap.url('/set-up-trap-server-url-here');

// To set up Trap for the entire document, instead of a single element,
// leave your application as it is and uncomment the following line only:
//trap.mount(document.body);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'example';

  // Bind the specified template reference in the HTML and mount it to Trap.
  // This template reference name must match the name in the HTML -- i.e.
  // `#trapRef` in this example.
  @ViewChild('trapRef') trapRef!: ElementRef;

  ngAfterViewInit() {
    trap.mount(this.trapRef.nativeElement);
    trap.setLogDestination('log');
  }

  ngOnDestroy() {
    trap.umount(this.trapRef.nativeElement);
  }
}
