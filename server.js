const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction
 } = require("@hashgraph/sdk");


require("dotenv").config();

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

// If we weren't able to grab it, we should throw a new error
if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}
 
// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey); 

var express = require("express");
const ejs = require("ejs");

const hostname = "0.0.0.0";
const port = 9090;

var bodyParser = require("body-parser");

var app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('views', 'public/views');    // Set views directory.
app.set("view engine", "ejs");  // Set views engine to ejs
app.listen(port,hostname);
console.log("[LOG] Launched server on port %d.", port);

// Views 
// This can be easily accessed via the browser.
// Useful error codes.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418
app.get("/", function (req, res){
  console.log("[LOG] GET /.");
  var listnames = ["This", "is", "a", "test", "of","dynamic","data."];

  res.render("pages/index.ejs", {
    listnames: listnames
  });

});

app.get("/*", function (req, res){
  console.log("[LOG] GET /*.");
  // Currently unsupported pages are handled with a 200 response, since there is a page to respond back with.
  res.render("pages/404.ejs");
  // If I truly wanted to send a 404, I could utilize the below status.
  //res.sendStatus(404);
});

// POSTING METHODS
// CORRECT example using cURL to post:
// Important to note that there are no quotes around the data string.
// curl -X POST -d hello=world http://localhost:9090/v1/echo
// I can acess element 'req.body.hello' as the value of world.
app.post("/v1/echo", function (req, res){
  console.log("[LOG] POST /v1/echo.");
  req.body;

  // Test for the instance of 'hello' variable being sent.
  if ( req.body.hello != null ){
    console.log("[LOG] Hello there.");
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(req.body);
});


// Post File Create.
// The SDK requires the following parameters:
//  - KEY: different than client operator.
//  - Contents: The file contents.
//  - MaxTransactionFee: This could be hardcoded in.
//  -
app.post("/v1/file-create", function ( req, res ){
  console.log("[LOG] POST /v1/file-create.");
  req.body; // I am unsure why this is reiterated?
  res.json(req.body);
});

// Post File Append.
app.post("/v1/file-append", function ( req, res ){
  console.log("[LOG] POST /v1/file-append.");
  req.body;
  res.json(req.body);
});

// Post File Update.
app.post("/v1/file-update", function ( req, res ){
  console.log("[LOG] POST /v1/file-update.");
  req.body;
  res.json(req.body);
});

// Post File Info.
app.post("/v1/file-info", function ( req, res ){
  console.log("[LOG] POST /v1/file-info.");
  req.body;
  res.json(req.body);
});

// Post File Contents.
app.post("/v1/file-contents", function ( req, res ){
  console.log("[LOG] POST /v1/file-contents.");
  req.body;
  res.json(req.body);
});

// Post File Deletion.
app.post("/v1/file-delete", function ( req, res ){
  console.log("[WARNING] POST /v1/file-delete.");
  req.body;
  res.json(req.body);
});

// MUST BE AT TAIL OF POST CASES.
// Example cURL:
// curl -X POST -d hello=world http://localhost:9090/v1/file-appendereare
app.post("/*", function (req, res){
  console.log("[LOG] POST /*.");

  res.json({
    error: {
      'name':'Error',
      'status': 400,
      'message':'Invalid Request',
      'statusCode': 400,
      'stack': req.hostname + req.originalUrl
    },
     message: 'Invalid API endpoint.'
  });

});
