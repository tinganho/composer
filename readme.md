react-composer
================

`react-composer` is a client/server router for your react applications. A developer defines a set of declaration for a page. Like what models and views a page should have. `react-composer` then automatically render/compose pages both on the client and server on each route.

First we define some default configs:
```typescript
export default var {
    googleAnatlyticsId: 'u-1872637846324',
    styles: [
        '/public/styles/documents/default.css',
        '/public/styles/contents/styles.css'
    ],
    main: 'Documents/Mains/Application'
}
```
Then, we define a page:

```typescript
import defaultConfigs from './defaultConfigs';
import Document from './Document';
import Body_withTopBar_withFooter from './Body_withTopBar_withFooter';
import WebPlatform from './WebPlatform'

export default function(HomePage) {
    HomePage
        .onPlatform(WebPlatform)
            .hasDocument(Document, defaultConfigs, {
                
            })
            .hasLayout(Body_withTopBar_withFooter, {
                TopBar: MainMenu,
                Body: Feed,
                Footer: Footer
            });
}
```

```typescript
import {express} from 'express';
import * as composer from 'composer';

// import defined pages
import HomePage from './HomePage';
import TodoPage from './TodoPage';

var app = express();

app.use(composer.pages({
    '/': HomePage,
    '/todos': TodoPage
}));
``` 

### Initial setup
```typescript
import composer from 'composer';
var app = express();
...
composer.init({
    app,
    clientConfPath: './conf/client',
    rootPath: __dirname
});
```
