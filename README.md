# Dependency Mapper

This is an app to view platform file interdependency through a [Cytoscape.js](https://js.cytoscape.org) visualisation.

This app is MIT-licensed, like Cytoscape.js itself.  The frontend is based on the app found here: [Wine & Cheese App](https://github.com/cytoscape/wineandcheesemap)

## Project organisation

The technologies used for this project include:
- Backend
  - Node.js and Express - API
  - MongoDB and MongoMemoryServer - In-memory database
  - Babel Parser - Parsing files and creating ASTs
- Building
  - Webpack: Bundle JS
  - PostCSS: Bundle CSS
  - Babel: Compile newer JS to older JS to support older browsers
  - CSSNext: Compile newer CSS to older CSS to support older browsers
- UI
  - Preact: Basic component support
  - Cytoscape: Graph/network visualisation
- Linting
  - ESLint: Identify common problems in JS
  - Stylelint: Identify common problems in CSS

## Building the frontend

The frontend is housed in the /dependency-webapp-client directory. The project's build targets are specified as npm scripts.  Move to the directory, run `npm install` to install dependencies, and then use `npm run <target>` for one of the following targets:

- `watch` : Do a debug build of the app, which automatically rebuilds and reloads as the code changes
- `prod` : Do a production build of the app
- `clean` : Delete all files under the dist directory
- `lint` : Run linters on the JS and CSS files

## Running the backend

The backend is housed in the /dependency-api-backend directory.  Move to the directory, run `npm install` to install dependencies, and then use `node src` to start the server.  Use `npm src save` to have the backend save the collection of ASTs to a file named elements.json located in the /dependency-api-backend directory.