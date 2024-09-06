import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";

import {HostAppModule} from "./hostapp/hostapp.module";


platformBrowserDynamic().bootstrapModule(HostAppModule)
  .catch(err => console.error(err));
