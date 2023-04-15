# HederaFileStorage
This system is to represent a proof of concept for storing data to the hedera file store. It is meant to utilized by embedded devices to store its sensor data, 
primarily eSpirometer data, so most of the functionality is provided via POST. 

Additional work should be done to allow for front end interfacing, preferably allowing users to login with their Hedera accounts and associate devices with their
account. I am unsure if this will implemented as the goal is to only utilize the hedera ecosystem and many papers utilize supplemental databased to manage that information.
Other factors involve the maintaince of the files, as Hedera Hashgraph does have a timeout period of files, they can be updated, but that requires additional transactions.

## To-Do
- Update eSpirometer to push to HFS.
- Make the API more robust.
- Make add a 'USER-AGENT' so that embedded devices can switch off the verbosity and only receive what is needed from the system.
- Add more frontend functionality.
