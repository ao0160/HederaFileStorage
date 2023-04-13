const {
  Client,
  PrivateKey,
  PublicKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
  FileCreateTransaction,
  FileContentsQuery,
  FileId
 } = require("@hashgraph/sdk");


require("dotenv").config();

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;
const USER_DER_PUB_KEY = process.env.USER_DER_PUB_KEY;
const USER_DER_PRV_KEY = process.env.USER_DER_PRV_KEY;

// Syntatic sugar for functions.
const _ = undefined;
// If we weren't able to grab it, we should throw a new error
if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}
 
// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey); 

var express = require("express");
var helpers = require("./helpers");
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

// This is always fallen into. However, the render is not handled.
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

// POSTING METHODS
// CORRECT example using cURL to post:
// Important to note that there are no quotes around the data string.
// curl -X POST http://localhost:9090/v1/node-address
app.post("/v1/node-address", function (req, res){
  console.log("[LOG] POST /v1/node-address.");
  req.body;

  ( async() => {
    //Create the query
    const fileQuery = new FileContentsQuery()
        .setFileId( FileId.fromString("102"));

    //Sign with the operator private key and submit to a Hedera network
    const contents = await fileQuery.execute(client);

    console.log("[LOG] " + contents.toString());

    //v2.0.7
  })();

  res.setHeader('Content-Type', 'application/json');
  res.json(helpers.success_message(
    _,
    _,
    _,
    _,
    req.hostname + req.originalUrl,
    'Successfully obtained node-address file.')
  );
});


// Post File Create.
// The SDK requires the following parameters:
//  - KEY: different than client operator.
//  - Contents: The file contents.
//  - MaxTransactionFee: This could be hardcoded in.
// Good Example CURL:
// curl -X POST -d filecontents="Hello there how are you today?" -d keys=10,11,12 http://localhost:9090/v1/file-create
// curl -X POST -d filecontents="Hello there how are you today?" -d keys=302d300706052b8104000a0322000359d854a5321270d2269b5618086ffa8c3a778561f266f43980861655a961822b http://localhost:9090/v1/file-create
// Bad Example CURL:
// curl -X POST -d file-contents="Hello there how are you today?" -d keys=10,11,12 http://localhost:9090/v1/file-create
app.post("/v1/file-create", function ( req, res ){
  console.log("[LOG] POST /v1/file-create.");
  req.body; // I am unsure why this is reiterated?
  var key_array = []

  if ( req.body.filecontents != null ){
    // File Contents Variable is set.

    // Optional parameter of a key can be included. This should be a list.
    if ( req.body.keys != null ){
      key_array = req.body.keys.split(',');
    }
    else{
      console.log("[LOG] No keys provided.");
    }

    //Create the transaction with the provided keys. Wrapped in async.
    ( async() => {
      // Hardcoded account keys. 
      var filePublicKey = PublicKey.fromString(USER_DER_PUB_KEY);
      var fileKey = PrivateKey.fromString(USER_DER_PRV_KEY);

      const transaction = await new FileCreateTransaction()
          //.setKeys(key_array) // A different key then the client operator key.
          .setKeys([filePublicKey])
          .setContents(req.body.filecontents)
          .setMaxTransactionFee(new Hbar(2))
          .freezeWith(client);

      // Sign with the file private key
      //const signTx =  transaction.sign(fileKey);
      const signTx = await transaction.sign(fileKey);

      //Sign with the client operator private key and submit to a Hedera network
      const submitTx = await signTx.execute(client);

      //Request the receipt
      const receipt = await submitTx.getReceipt(client);

      //Get the file ID
      const newFileId = receipt.fileId;

      console.log("[LOG] The new file ID is: " + newFileId);

      //v2.0.7
    })();

    res.json(req.body);
  }
  else {
    console.log("[WARN] No file contents provided.");
    res.json(helpers.error_message(
      _,
      _,
      'File create requires at minimum \'filecontents\' parameter to be set.'
      ,_,
      req.hostname + req.originalUrl,
      "")
    );

  }

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
// Created a file with ID: 0.0.4064129
// Example curl:
// curl -X POST -d fileid=4064129 http://localhost:9090/v1/file-contents
app.post("/v1/file-contents", function ( req, res ){
  console.log("[LOG] POST /v1/file-contents.");
  req.body;
  if ( req.body.fileid != null){
    ( async() => {
      //Create the query
      const fileQuery = new FileContentsQuery()
          .setFileId( FileId.fromString("4064129"));  // Hardcoded for now.

      //Sign with the operator private key and submit to a Hedera network
      const contents = await fileQuery.execute(client);

      // We are going to busy wait. Very bad, but at the moment I just need a working implementation.
      while( contents == undefined );

      console.log("[LOG] " + contents.toString());

      res.setHeader('Content-Type', 'application/json');
      res.json(helpers.success_message(_,
        _,
        'Successfully obtained file.',
        _,
        req.hostname + req.originalUrl,
        contents.toString())
      );

      //v2.0.7
    })();
  }
  else{
    // Failed to provide file identifier.
    res.json(helpers.error_message(_,
      _,
      'File contents requires \'fileid\' parameter to be set.',
      _,
      req.hostname + req.originalUrl,
      "" )
    );
  }
});

// Post File Deletion.
app.post("/v1/file-delete", function ( req, res ){
  console.log("[WARN] POST /v1/file-delete.");
  req.body;
  res.json(req.body);
});

// MUST BE AT TAIL OF POST CASES.
// Example cURL:
// curl -X POST -d hello=world http://localhost:9090/v1/file-appendereare
app.post("/*", function (req, res){
  console.log("[LOG] POST /*.");
  // Default error message.
  res.json( helpers.error_message(_,
    _,
    _,
    _,
    req.hostname + req.originalUrl,
    _ )
    );

});
