console.log(
  "------------------------------\nrun `npm run <argument>` with any of the following arguments: "
);
console.log({
  help: "shows this message",
  in: "installs dependencies in the root, server, and client directories (run this command first after cloning",
  build: "builds react app for production. run this before `prod`",
  prod: "starts our production server, connected to RDS",
  "prod-drop":
    "starts our production server and drops + resync all tables, connected to RDS",
  full: "starts full stack in development mode, connected to RDS",
  "full-drop":
    "starts full stack and drops + resync all tables, connected to RDS",
  front: "starts react in development mode",
  back: "starts node in development mode connected to RDS",
  "back-drop":
    "starts node in development mode and drops + resync all tables, connected to local PostgreSQL",
  jsdoc: "generates jsdoc for both frontend and backend",
  "jsdoc-open":
    "generates jsdoc for both frontend and backend, and opens both in the browser",
  "jsdoc-front": "generates jsdoc for the frontend",
  "jsdoc-front-open":
    "generates jsdoc for the frontend and opens them in the browser",
  "jsdoc-back": "generates jsdoc for the backend",
  "jsdoc-back-open":
    "generates jsdoc for the backend and opens them in the browser",
});
console.log(
  "\nexamples: \n npm run in \n npm run build \n------------------------------"
);
