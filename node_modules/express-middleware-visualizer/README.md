# express-middleware-visualizer

Visualize all endpoints registered within an express-app and browse all global middlewares applied to those.

<img src="https://raw.githubusercontent.com/LuiSlacker/express-visualizer/master/example_screenshot.png" alt="Drawing" style="width: 800px;"/>

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install express-middleware-visualizer --save-dev
```
## Features

* Displays all endpoints registered with an express-app
* Shows the global middleware stack applied for each endpoint
* Also works for [nested routers](http://expressjs.com/en/4x/api.html#router) in Express 4.

## Usage
### CommonJS
Simply require the package passing the global app object to it.

```
require('express-middleware-visualizer')(app);
````

You should place this line directly after you have attached all routes to your express app, but before any errorHandlers.
See a simplyfied example below:

```
const express = require('express');
const app = express();

app.get('/, (req, res, next) => {
  res.send('Hello Express-middleware-visualizer');
});

if (process.env.NODE_ENV !== 'production') {
  require('express-middleware-visualizer')(app);
}

// catch 404s
app.use((req, res, next) => {
  next(new Error(`Endpoint ${req.originalUrl} for method ${req.method} is not defined.`));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json(err);
});

const server = app.listen(process.env.PORT || 4001, () => {
  console.info(`server started, listening on port: ${server.address().port}`);
});
```

Two new endpoints will then be registered to your app and you can browse your routes at:
```
<yourHost:yourPort>/expressVisualizer/visualize
```

To see the json containing all the routes and middleware information, navigate to:
```
<yourHost:yourPort>/expressVisualizer/fetchData
```

### ES2015 Import

If you want to use the new ES2015 module loader you have to use the following to lines:
```
import expressMDWVisualizer from 'express-middleware-visualizer';
expressMDWVisualizer(app);
```

## Important Notice

If you accidentally attach the package also in production it will still only add the new endpoints if ``NODE_ENV !== production.`` Therefore your sensible data will never be leaked in production.

## License

  [MIT](LICENSE)
