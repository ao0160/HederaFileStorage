const {
  Client,
  PrivateKey,
  PublicKey,
  AccountInfoQuery,
  AccountUpdateTransaction,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
  FileCreateTransaction,
  FileUpdateTransaction,
  FileDeleteTransaction,
  FileContentsQuery,
  FileAppendTransaction,
  FileId,
  FileInfoQuery,
  Status,
  Key,
  KeyList
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


//-------------------------------------------------------------------------------------------------------------
// GET Requests
//  Enough endpoints should be developed to allow for the proper creation, storage, updating, and deletion of files.
//-------------------------------------------------------------------------------------------------------------
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

// Fall into 404.
app.get("/*", function (req, res){
  console.log("[LOG] GET /*.");
  // Currently unsupported pages are handled with a 200 response, since there is a page to respond back with.
  res.render("pages/404.ejs");
  // If I truly wanted to send a 404, I could utilize the below status.
  //res.sendStatus(404);
});


//-------------------------------------------------------------------------------------------------------------
// File API endpoints
//  Enough endpoints should be developed to allow for the proper creation, storage, updating, and deletion of files.
//-------------------------------------------------------------------------------------------------------------
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
    //Create the query, setup promise to output JSON.
    const fileQuery = new FileContentsQuery()
        .setFileId( FileId.fromString("102") );

    //Sign with the operator private key and submit to a Hedera network to recieve the Node Address file. Figure out how to get transaction status to return as the hedera_status_response value.
    await fileQuery.execute(client).then((contents)  => {
      res.setHeader('Content-Type', 'application/json');
      const response_json = new helpers.api_json_reponse("Success", 200, "Successfully got Node Address file.", req.originalUrl, _, "file", contents.toString());
      console.log("[LOG] Recieved data.");
      res.send(response_json);  
    })
    .catch((error) => {
      // Catch any errors related to transaction, figure out how to get transaction status to return as the hedera_status_response value.
      res.setHeader('Content-Type', 'application/json');
      const response_json = new helpers.api_json_reponse("Error", 400, "Failed to get Node Address file.", req.originalUrl, _, _, _);
      console.log("[LOG] Failed to received data.");
      res.send(response_json);  
    });

    //v2.0.7
  })();
});


// Post File Create.
// The SDK requires the following parameters:
//  - KEY: different than client operator.
//  - Contents: The file contents.
//  - MaxTransactionFee: This could be hardcoded in.

// Good Example CURL:
// The private keys could technically be a list, but its important to note that the first private key will be used. This key should correspond with the first public key!
// curl -X POST http://localhost:9090/v1/file-create -d filecontents="Hello there how are you today?" -d pubkey=<PUBKEY1>,<PUBKEY2>,..,<PUBKEYN> -d privkey=<PRIVKEY1> 

// Another example, you can post JSON.
// curl -X POST http://localhost:9090/v1/file-create -d filecontents={"id": 1234567890,"status": "Good","samples": [1,2,3]} -d pubkey=<PUBKEY1>,<PUBKEY2>,..,<PUBKEYN> -d privkey=<PRIVKEY1> 
app.post("/v1/file-create", function ( req, res ){
  console.log("[LOG] POST /v1/file-create.");
  var pub_keys = [];
  var priv_keys = [];

  // Verify all parameters.
  if ( req.body.filecontents != null && req.body.pubkey != null && req.body.privkey != null ){

    var split_pubkey = req.body.pubkey.split(',');
    var split_privkey = req.body.privkey.split(',');

    // Grab public keys.
    for( var i in split_pubkey){
      pub_keys.push(PublicKey.fromString(split_pubkey[i]));
    }

    // Grab private keys.
    for( var i in split_privkey){
      priv_keys.push(PrivateKey.fromString(split_privkey[i]));
    }

    // Create a key list where all keys are required to sign.
    const public_KeyList = new KeyList(pub_keys);

    if ( req.body.filememo != null ){
       // Create the transaction.
       const transaction = new FileCreateTransaction()
       .setKeys(public_KeyList)  // A different key then the client operator key. All public keys go here.
       .setFileMemo(req.body.filememo)
       .setContents(req.body.filecontents)
       .setMaxTransactionFee(new Hbar(2))
       .freezeWith(client);     
    }
    else{
      // Create the transaction.
      const transaction = new FileCreateTransaction()
        .setKeys(public_KeyList)  // A different key then the client operator key. All public keys go here.
        .setContents(req.body.filecontents)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);
    }
    try {
      // Always sign with the first parameter (the primary private key).
      transaction.sign(priv_keys[0])
        .then((signTx) => {
          signTx.execute(client)
            .then((submitTx) => {
              submitTx.getReceipt(client)
                .then((receipt) => {
                  // Get the file ID.
                  const newFileId = receipt.fileId;
                  console.log("[LOG] The new file ID is: " + newFileId);

                  res.setHeader('Content-Type', 'application/json');
                  const response_json = new helpers.api_json_reponse("Success", 200, "Successfully created file with id: " + newFileId + ".", req.originalUrl, _, "fileid", newFileId);
                  res.send(response_json);
                })
                .catch((error) => {
                  console.error("[ERROR] An error occurred while retrieving transaction receipt: " + error);
                  res.setHeader('Content-Type', 'application/json');
                  const response_json = new helpers.api_json_reponse("Error", 400, "Unable to create file.", req.originalUrl, _, _, _);
                  res.send(response_json);
                });
            })
            .catch((error) => {
              console.error("[ERROR] An error occurred while executing transaction: " + error);
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Error", 400, "Unable to create file.", req.originalUrl, _, _, _);
              res.send(response_json);
            });
        })
        .catch((error) => {
          console.error("[ERROR] An error occurred while signing transaction: " + error);
          res.setHeader('Content-Type', 'application/json');
          const response_json = new helpers.api_json_reponse("Error", 400, "Unable to create file.", req.originalUrl, _, _, _);
          res.send(response_json);
        });
      //v2.0.7
    } catch (err) {
      console.log("[LOG] Error in POST /v1/file-create:", err);
      res.setHeader('Content-Type', 'application/json');
      const response_json = new helpers.api_json_reponse("Error", 500, "Error creating file.", req.originalUrl, _, _, _);
      res.send(response_json);
    }

  } 
  else {
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires parameters \'filecontents\', \'pubkey\', and \'privkey\'.", req.originalUrl, _, _, _);
    res.send(response_json);
  }

});

// Post File Append.
// File created to test appending: 4127209
// curl -X post http://localhost:9090/v1/file-append -d filecontents="Hello, world! This was appended!" -d privkey=<YOUR-PRIV-KEY> -d fileid=<FILE-ID>
app.post("/v1/file-append", function ( req, res ){
  console.log("[LOG] POST /v1/file-append.");

  req.body; // I am unsure why this is reiterated?
  var priv_keys = [];

  // Verify all parameters.
  if ( req.body.filecontents != null != null && req.body.privkey != null && req.body.fileid){
    var split_privkey = req.body.privkey.split(',');

    // Grab private keys.
    for( var i in split_privkey){
      priv_keys.push(PrivateKey.fromString(split_privkey[i]));
    }

    // Create the transaction.
    const transaction = new FileAppendTransaction()
      .setFileId( FileId.fromString(req.body.fileid) )
      .setContents(req.body.filecontents)
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(client);

    try {
      // Always sign with the first parameter (the primary private key).
      transaction.sign(priv_keys[0]).then( (signTx) => {
        // Sign the transaction.
        signTx.execute(client).then( (submitTx) =>{
          // Execute the transaction.
          submitTx.getReceipt(client).then( (receipt) => {
            // Obtain the transaction's receipt.
            const transactionStatus3  = receipt.status;
            console.log("[LOG] The transaction consensus status " + transactionStatus3.toString());

            if ( transactionStatus3.toString() == "SUCCESS"){
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Success", 200, "Successfully appended to file " + req.body.fileid + ".", req.originalUrl, transactionStatus3.toString(), "file", req.body.filecontents);
              res.send(response_json);
            }
            else{
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Error", 400, "Unable to append file with id: " + req.body.fileid + ".", req.originalUrl, transactionStatus3.toString(), _, _);
              res.send(response_json);              
            }
          }).catch((error) => {
            console.log("[ERROR] Error while getting transaction receipt:", error);
            res.setHeader('Content-Type', 'application/json');
            const response_json = new helpers.api_json_reponse("Error", 500, "Unable to get transaction receipt.", req.originalUrl, error.toString(), _, _);
            res.send(response_json);
          });
        }).catch((error) => {
          console.log("[ERROR] Error while executing signed transaction:", error);
          res.setHeader('Content-Type', 'application/json');
          const response_json = new helpers.api_json_reponse("Error", 500, "Unable to execute signed transaction.", req.originalUrl, error.toString(), _, _);
          res.send(response_json);
        });
      }).catch((error) => {
        console.log("[ERROR] Error while signing transaction:", error);
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 500, "Unable to sign transaction.", req.originalUrl, error.toString(), _, _);
        res.send(response_json);
      });

      //v2.0.7
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      const response_json = new helpers.api_json_reponse("Error", 500, "Error updating file.", req.originalUrl, _, _, _);
      res.send(response_json);
    }

  } 
  else {
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires \'filecontents\', \'fileid\',  \'pubkey\', and \'privkey\'.", req.originalUrl, _, _, _);
    res.send(response_json);
  }

});

// Post File Update.
// Simpler example:
// curl -X POST http://localhost:9090/v1/file-update -d filecontents="Hello there, how are you today?" -d fileid=4078666  -d pubkey=<YOUR-PUB-KEY> -d privkey=<YOUR-PRIV-KEY>
app.post("/v1/file-update", function ( req, res ){
  console.log("[LOG] POST /v1/file-update.");
  var pub_keys = [];
  var priv_keys = [];

  // Verify all parameters.
  if ( req.body.filecontents != null && req.body.pubkey != null && req.body.privkey != null && req.body.fileid){
    var split_pubkey = req.body.pubkey.split(',');
    var split_privkey = req.body.privkey.split(',');

    // Grab public keys.
    for( var i in split_pubkey){
      pub_keys.push(PublicKey.fromString(split_pubkey[i]));
    }

    // Grab private keys.
    for( var i in split_privkey){
      priv_keys.push(PrivateKey.fromString(split_privkey[i]));
    }

    // Create a key list where all keys are required to sign.
    const public_KeyList = new KeyList(pub_keys);

    // Create the transaction.
    const transaction = new FileUpdateTransaction()
      .setKeys(public_KeyList)  // A different key then the client operator key. All public keys go here.
      .setFileId(FileId.fromString(req.body.fileid) )
      .setContents(req.body.filecontents)
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(client);

    try {
      // Always sign with the first parameter (the primary private key).
      transaction.sign(priv_keys[0]).then( (signTx) => {
        // Sign the transaction.
        signTx.execute(client).then( (submitTx) =>{
          // Execute the transaction.
          submitTx.getReceipt(client).then( (receipt) => {
            // Obtain the transaction's receipt.
            const transactionStatus3  = receipt.status;
            console.log("[LOG] The transaction consensus status " + transactionStatus3.toString());

            if ( transactionStatus3.toString() == "SUCCESS"){
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Success", 200, "Successfully updated file " + req.body.fileid + ".", req.originalUrl, transactionStatus3.toString(), "file", req.body.filecontents);
              res.send(response_json);
            }
            else{
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Error", 400, "Unable to update file with id: " + req.body.fileid + ".", req.originalUrl, transactionStatus3.toString(), _, _);
              res.send(response_json);              
            }
          }).catch((error) => {
            console.log("[ERROR] Error while getting transaction receipt:", error);
            res.setHeader('Content-Type', 'application/json');
            const response_json = new helpers.api_json_reponse("Error", 500, "Unable to get transaction receipt.", req.originalUrl, error.toString(), _, _);
            res.send(response_json);
          });
        }).catch((error) => {
          console.log("[ERROR] Error while executing signed transaction:", error);
          res.setHeader('Content-Type', 'application/json');
          const response_json = new helpers.api_json_reponse("Error", 500, "Unable to execute signed transaction.", req.originalUrl, error.toString(), _, _);
          res.send(response_json);
        });
      }).catch((error) => {
        console.log("[ERROR] Error while signing transaction:", error);
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 500, "Unable to sign transaction.", req.originalUrl, error.toString(), _, _);
        res.send(response_json);
      });

      //v2.0.7
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      const response_json = new helpers.api_json_reponse("Error", 500, "Error updating file.", req.originalUrl, _, _, _);
      res.send(response_json);
    }

  } 
  else {
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires parameters \'filecontents\', \'fileid\', \'pubkey\', and \'privkey\'.", req.originalUrl, _, _, _);
    res.send(response_json);
  }

});


// Post File Info.
// Example cURL:
//curl -X POST http://localhost:9090/v1/file-info -d fileid=4127209
app.post("/v1/file-info", function ( req, res ){
  console.log("[LOG] POST /v1/file-info.");

  if ( req.body.fileid != null ){
    ( async() => {
      //Create the query, setup promise to output JSON.
      const fileQuery = new FileInfoQuery()
          .setFileId( FileId.fromString(req.body.fileid));

      //Sign with the operator private key and submit to a Hedera network to recieve the Node Address file. Figure out how to get transaction status to return as the hedera_status_response value.
      await fileQuery.execute(client).then((contents)  => {
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Success", 200, "Successfully got file with id: " + req.body.fileid + ".", req.originalUrl, _, "file", contents);
        console.log("[LOG] Recieved data: " + contents);
        res.send(response_json);  
      })
      .catch((error) => {
        // Catch any errors related to transaction, figure out how to get transaction status to return as the hedera_status_response value.
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 400, "Failed to get specific file.", req.originalUrl, _, _, _);
        console.log("[LOG] Failed to received data.");
        res.send(response_json);
      });
      //v2.0.7
    })();
  }
  else{
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires the fileid parameter.", req.originalUrl, _, _, _);
    res.send(response_json);    
  }
});


// Post File Contents.
// Created a file with ID: 0.0.4078666
// Another file created recently: 0.0.4126769
// Another file created for appending: 0.0.4127209

// Example curl for the above file:
// curl -X POST http://localhost:9090/v1/file-contents  -d fileid=4078666 

// Same as checking node-address
// curl -X POST http://localhost:9090/v1/file-contents  -d fileid=102

app.post("/v1/file-contents", function ( req, res ){
  console.log("[LOG] POST /v1/file-contents.");
  req.body;

  if ( req.body.fileid != null ){
    ( async() => {
      //Create the query, setup promise to output JSON.
      const fileQuery = new FileContentsQuery()
          .setFileId( FileId.fromString(req.body.fileid));

      //Sign with the operator private key and submit to a Hedera network to recieve the Node Address file. Figure out how to get transaction status to return as the hedera_status_response value.
      await fileQuery.execute(client).then((contents)  => {
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Success", 200, "Successfully got file with id: " + req.body.fileid + ".", req.originalUrl, _, "file", contents.toString());
        console.log("[LOG] Recieved data: " + contents.toString());
        res.send(response_json);  
      })
      .catch((error) => {
        // Catch any errors related to transaction, figure out how to get transaction status to return as the hedera_status_response value.
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 400, "Failed to get specific file.", req.originalUrl, _, _, _);
        console.log("[LOG] Failed to received data.");
        res.send(response_json);
      });
      //v2.0.7
    })();
  }
  else{
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires the fileid parameter.", req.originalUrl, _, _, _);
    res.send(response_json);    
  }
});


// Post File Deletion.
// Example CURL:
// curl -X POST http://localhost:9090/v1/file-delete -d fileid=4078666 -d privkey=<PRIVKEY-FILE-WAS-SIGNED-WITH>
app.post("/v1/file-delete", function ( req, res ){
  console.log("[WARN] POST /v1/file-delete.");
  var priv_keys = [];

  if ( req.body.fileid != null && req.body.privkey != null ){
    console.log("[LOG] File ID is: " + FileId.fromString(req.body.fileid));   
    var split_privkey = req.body.privkey.split(',');

    // Grab private keys.
    for( var i in split_privkey){
      priv_keys.push(PrivateKey.fromString(split_privkey[i]));
    }
    // Create the transaction.
    const transaction = new FileDeleteTransaction()
      .setFileId(FileId.fromString(req.body.fileid) )
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(client);

    try {
      // Always sign with the first parameter (the primary private key).
      transaction.sign(priv_keys[0]).then( (signTx) => {
        // Sign the transaction.
        signTx.execute(client).then( (submitTx) =>{
          // Execute the transaction.
          submitTx.getReceipt(client).then( (receipt) => {
            // Obtain the transaction's receipt.
            const transactionStatus3  = receipt.status;
            console.log("[LOG] The transaction consensus status " + transactionStatus3.toString());

            if ( transactionStatus3.toString() == "FILE_DELETED"){
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Success", 200, "Successfully updated file " + req.body.fileid + ".", req.originalUrl, transactionStatus3.toString(), _, _);
              res.send(response_json);
            }
            else{
              res.setHeader('Content-Type', 'application/json');
              const response_json = new helpers.api_json_reponse("Error", 400, "Unable to update file with id: " + req.body.fileid + ".", req.originalUrl, transactionStatus3.toString(), _, _);
              res.send(response_json);              
            }
          }).catch((error) => {
            console.log("[ERROR] Error while getting transaction receipt:", error);
            res.setHeader('Content-Type', 'application/json');
            const response_json = new helpers.api_json_reponse("Error", 500, "Unable to get transaction receipt.", req.originalUrl, error.toString(), _, _);
            res.send(response_json);
          });
        }).catch((error) => {
          console.log("[ERROR] Error while executing signed transaction:", error);
          res.setHeader('Content-Type', 'application/json');
          const response_json = new helpers.api_json_reponse("Error", 500, "Unable to execute signed transaction.", req.originalUrl, error.toString(), _, _);
          res.send(response_json);
        });
      }).catch((error) => {
        console.log("[ERROR] Error while signing transaction:", error);
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 500, "Unable to sign transaction.", req.originalUrl, error.toString(), _, _);
        res.send(response_json);
      });

      //v2.0.7
    } catch (err) {
      res.setHeader('Content-Type', 'application/json');
      const response_json = new helpers.api_json_reponse("Error", 500, "Error updating file.", req.originalUrl, _, _, _);
      res.send(response_json);
    }
  }
  else{
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires parameters \'fileid\' and \'privkey\'.", req.originalUrl, _, _, _);
    res.send(response_json);    
  }
});

//-------------------------------------------------------------------------------------------------------------
// Account API endpoints
//  Enough endpoints should be developed to allow for the automatic creation of an account for a device.
//-------------------------------------------------------------------------------------------------------------

// Post Get Account.
// Example cURL:
//curl -X POST http://localhost:9090/v1/get-account -d accountid=<AccountID>
// The format of accountID can be either <shard>.<realm>.<accountnum>  or <accountNum>
// The system returns a JSON object, members of use to the devices are:
// "accountId" a string with <shard>.<realm>.<accountnum> (at least till realms and shards are implemented).
// "key" a string of the public key of the account. 
// "accountMemo" a memo string, one the extra accounts I utilize has "auto-created account".
//    - I may provide a specific memo, perhaps to associate it with a specific device, maybe MAC ADDR, or a combination of MAC and something else? 
app.post("/v1/get-account", function ( req, res ){
  console.log("[LOG] POST /v1/get-account.");

  if ( req.body.accountid != null ){
    ( async() => {
      //Create the query, setup promise to output JSON.
      const query  = new AccountInfoQuery()
          .setAccountId(req.body.accountid);

      //Sign with the operator private key and submit to a Hedera network to recieve the Node Address file. Figure out how to get transaction status to return as the hedera_status_response value.
      await query .execute(client).then((contents)  => {
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Success", 200, "Successfully got account with id: " + req.body.accountid + ".", req.originalUrl, _, "account", contents);
        console.log("[LOG] Recieved data: " + contents);
        res.send(response_json);  
      })
      .catch((error) => {
        // Catch any errors related to transaction, figure out how to get transaction status to return as the hedera_status_response value.
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 400, "Failed to get specific account.", req.originalUrl, _, _, _);
        console.log("[LOG] Failed to received data.");
        res.send(response_json);
      });
      //v2.0.7
    })();
  }
  else{
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires the accountid parameter.", req.originalUrl, _, _, _);
    res.send(response_json);    
  }
});



// Post Set Account.
// Example cURL:
//curl -X POST http://localhost:9090/v1/set-account/memo -d accountid=<AccountID> -d privkey=<PrivateKeyForAccountID> -d memo=<MEMO>
// The format of accountID can be either <shard>.<realm>.<accountnum>  or <accountNum>
// Memo is simply a string to set the account Memo to.
// This will primarily be used to set an existing account's memo to something for the ESP devices, but its logic should be reusable for a generic
// method.

// "accountMemo" a memo string, one the extra accounts I utilize has "auto-created account".
//    - I may provide a specific memo, perhaps to associate it with a specific device, maybe MAC ADDR, or a combination of MAC and something else? 
app.post("/v1/set-account/memo", function ( req, res ){
  console.log("[LOG] POST /v1/set-account/memo.");
  var priv_keys = [];

  if ( req.body.accountid != null && req.body.memo != null  && req.body.privkey != null){
    var split_privkey = req.body.privkey.split(',');

    // Grab private keys.
    for( var i in split_privkey){
      priv_keys.push(PrivateKey.fromString(split_privkey[i]));
    }

    ( async() => {
      // Set Transaction parameters, mainly accountid and memo.
      const transaction  = new AccountUpdateTransaction()
          .setAccountId(req.body.accountid)
          .setAccountMemo(req.body.memo)
          .freezeWith(client);

      // Always sign with the first parameter (the primary private key).
      transaction.sign(priv_keys[0]).then( (signTx) => {
        // Sign the transaction.
        signTx.execute(client).then( (submitTx) =>{
          // Execute the transaction.
          submitTx.getReceipt(client).then( (receipt) => {
            // Obtain the transaction's receipt.
            const transactionStatus3  = receipt.status;
            console.log("[LOG] The transaction consensus status " + transactionStatus3.toString());
            res.setHeader('Content-Type', 'application/json');
            const response_json = new helpers.api_json_reponse("Success", 200, "Successfully updated account with id: " + req.body.accountid + ".", req.originalUrl, transactionStatus3.toString(),"account", receipt);
            res.send(response_json);

          }).catch((error) => {
            console.log("[ERROR] Error while getting transaction receipt:", error);
            res.setHeader('Content-Type', 'application/json');
            const response_json = new helpers.api_json_reponse("Error", 500, "Unable to get transaction receipt.", req.originalUrl, error.toString(), _, _);
            res.send(response_json);
          });
        }).catch((error) => {
          console.log("[ERROR] Error while executing signed transaction:", error);
          res.setHeader('Content-Type', 'application/json');
          const response_json = new helpers.api_json_reponse("Error", 500, "Unable to execute signed transaction.", req.originalUrl, error.toString(), _, _);
          res.send(response_json);
        });
      }).catch((error) => {
        console.log("[ERROR] Error while signing transaction:", error);
        res.setHeader('Content-Type', 'application/json');
        const response_json = new helpers.api_json_reponse("Error", 500, "Unable to sign transaction.", req.originalUrl, error.toString(), _, _);
        res.send(response_json);
      });
    })();
  }
  else{
    res.setHeader('Content-Type', 'application/json');
    const response_json = new helpers.api_json_reponse("Error", 400, "API call requires accountid, memo, and privkey parameters.", req.originalUrl, _, _, _);
    res.send(response_json);    
  }
});



// Post Get Account By Memo.
// Example cURL:
//curl -X POST http://localhost:9090/v1/get-account/memo -d accountid=<AccountId> -d memo=<Memo>
// The format of accountID  is just <accountnum>, it should be a number as this is the index number the search will start at. 

// The system returns a JSON object, members of use to the devices are:
// "accountId" a string with <shard>.<realm>.<accountnum> (at least till realms and shards are implemented).
// "key" a string of the public key of the account. 
// "accountMemo" a memo string, one the extra accounts I utilize has "auto-created account".
//    - I may provide a specific memo, perhaps to associate it with a specific device, maybe MAC ADDR, or a combination of MAC and something else? 
app.post("/v1/get-account/memo", function ( req, res ){
  console.log("[LOG] POST /v1/get-account/memo.");
  var response_json;
  var accountFound = null;
  var end_search = false;
  res.setHeader('Content-Type', 'application/json');

  if ( req.body.accountid != null && req.body.memo != null){
    var account_iterator = Number(req.body.accountid);
    var initial_count = account_iterator;

    // Only printout for IoT devices.
    if ( req.get('user-agent') == "IoT" ){
      console.log("[LOG] User-Agent: " + req.get('user-agent'));
      console.log("[LOG] Requesting Account: %d, with memo: %s.", req.body.accountid, req.body.memo);
    }

    ( async() => {
      // Create the query, setup promise to output JSON.
      // I am only able to call be ID. Does that mean I must iterate through entries?
      while ( !accountFound && !end_search ){
        const query = await new AccountInfoQuery()
            .setAccountId(account_iterator.toString());

        account_iterator = account_iterator + 1;

        //Sign with the operator private key and submit to a Hedera network to recieve the Node Address file. Figure out how to get transaction status to return as the hedera_status_response value.
        await query.execute(client).then((contents)  => {
            if ( contents.accountMemo == req.body.memo ){
              accountFound = contents;
            }
        })
        .catch((error) => {
          // Catch any errors related to transaction, figure out how to get transaction status to return as the hedera_status_response value.
          //res.setHeader('Content-Type', 'application/json');
          response_json = new helpers.api_json_reponse("Error", 400, "Failed to get account with memo: " + req.body.memo + ".", req.originalUrl, _, _, _);
          console.log("[LOG] Failed to receive data.");
          //res.send(response_json);
        });

        if ( account_iterator - initial_count >= 100 ){
          end_search = true;
        }

      }
      //v2.0.7

      if( accountFound != null ){
        response_json = new helpers.api_json_reponse("Success", 200, "Successfully got account with memo: " + req.body.memo + ".", req.originalUrl, _, "account", accountFound);
        console.log("[LOG] Recieved data: " + accountFound);
        res.send(response_json);
      }
      else {
        console.log("[LOG] Failed to receive data.");
        res.send(response_json);
      }

    })();
  }
  else{
    //res.setHeader('Content-Type', 'application/json');
    response_json = new helpers.api_json_reponse("Error", 400, "API call requires the accountid parameter.", req.originalUrl, _, _, _);
    //res.send(response_json);    
  }

});

// Post Espirometer
// Example cURL:
// curl -X POST -A "IoT" http://localhost:9090/v1/espirometer -d fileid=<fileID> -d memo=<Memo> -d filecontents=<FileContents> -d pubkey=<PublicKey> -d privkey=<PrivateKey>

// Required DATA:
// fileid: The explicit ID.
// pubkey: The public key of the account that generated the file (should just be one).
// privkey: The private key of the account that generated the file.
//  - At the moment these keys are statically defined on the EDGE device. Ideally an account will be created if one does not exist and the keys
//  - would be shared with the device, and stored in the non-volatile memory of the device. Since there is still work being done on the edge device
//  - this is being skipped for now.
// filecontents: The contents to add to the file, the API endpoint should selectively create a new file or append to an old file.
//  - Since the filecontents is the message from the edge device, and the edge device is providing the SHA-MAC-HASH in the JSON payload,
//  - we could pull it from the payload OR we could just provide an optional parameter for the MEMO (I may just do this.).

// Was using Memo, unecessary since MESSAGE PAYLOAD contains it as indentifier.
// memo: The SHA-MAC-HASH of the device. This may or may not be implemented depending on what I decide to do.
//  - If I create another parameter for the MEMO this is more data that has to be sent by the EDGE device, the JSON payload of the EDGE device should
//  - already have the SHA-MAC-HASH as the eSpirometer uses this in its initialization. However, I could omit this in the DATA payload and only use it
//  - for the MEMO parameter. In which case the data size remains the same. 
app.post("/v1/send-espirometer-data", function ( req, res ){
  var response_json;
  var edge_data;

  console.log("[LOG] POST /v1/send-espirometer-data.");
  res.setHeader('Content-Type', 'application/json');

  if ( req.get('user-agent') != "IoT" ){
    response_json = new helpers.api_json_reponse("Error", 400, "Only specific user-agents can POST here.", req.originalUrl, _, _, _);
    console.log("[LOG] POSTer failed precheck.");
  }
  else{
    if ( req.body.fileid != null  && req.body.filecontents != null && req.body.pubkey != null && req.body.privkey != null ){

      // Check if FILE exists
      // If it does APPEND
        // If not create or ERROR out? For now since I am premaking items it may just have to be that way for proof of concept.
      // Backend
      // When appending or creating, tack on a comma to end of data being sent. 
      // I will append a singular comma to the tail of the string to create the 'inside' value of an array of JSON objects.
      edge_data = req.body.filecontents + ",";
      console.log("[LOG] File ID: " + req.body.fileid);
      console.log("[LOG] Contents: " + edge_data);

      app.connect("/v1/file-contents")

      // Frontend obtaining the contents of the file some preprocesssing is needed:
      // File contents obtained, will need to parse. 
      // When parsing, obtain the string and remove the tail character (should be comma) and tack on [ ] brackets to the front and back respsectively.
      // This is not ideal but provides the [ {JSON1}, {JSON2} ]. 
      // Then any further front end rendering would be easy peasy. 


      response_json = new helpers.api_json_reponse("Success", 200, "Successfully updated espirometer data.", req.originalUrl, _, _, _);
      console.log("[LOG] Successfully update espirometer data.");
    }
    else{
      response_json = new helpers.api_json_reponse("Error", 400, "API call requires fileid, memo, filecontents, pubkey, and privkey parameters.", req.originalUrl, _, _, _);
      console.log("[LOG] Failed parameter check.");
    }
  }

res.send(response_json);


});


//-------------------------------------------------------------------------------------------------------------
// Catch All
//-------------------------------------------------------------------------------------------------------------
// MUST BE AT TAIL OF POST CASES.
// Example cURL:
// curl -X POST http://localhost:9090/v1/*
// If POST made it this far, it doesn't exist.
app.post("/*", function (req, res){
  console.log("[LOG] POST /*.");

  const response_json = new helpers.api_json_reponse("Error", 400, "Invalid API endpoint.", req.originalUrl, _, _, _);
  res.json(response_json);
});