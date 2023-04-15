module.exports = {
    api_json_reponse: function(message_type, http_status_response, api_message, stack, hedera_status_response, hedera_response_type, hedera_response){
        // API message and responses.
        this.message_type = message_type;
        this.http_status_response = http_status_response;
        this.api_message = api_message;
        this.stack = stack;

        // Hashgraph message and response.
        this.hedera_status_response = hedera_status_response;
        this.hedera_response_type = hedera_response_type;
        this.hedera_response = hedera_response;
    }
    ,
    error_message: function (name = null, status = null, emessage = null, statuscode = null, stack = null, message=null) {
        name = name || 'Error';
        status = status || 400;
        emessage = emessage || 'Invalid Request';
        statuscode = statuscode || 400;
        message = message || 'Invalid API endpoint';

        return {
            error: {
              'name': name,
              'status': status,
              'message':emessage,
              'statusCode': statuscode,
              'stack': stack
            },
            message: message
          };
    },
    success_message: function (name = null, status = null, smessage = null, statuscode = null, stack = null, message=null) {
        name = name || 'Success';
        status = status || 200;
        smessage = smessage || 'Successful Request';
        statuscode = statuscode || 200;
        message = message || 'Successful API request.';

        return {
            success: {
              'name': name,
              'status': status,
              'message':smessage,
              'statusCode': statuscode,
              'stack': stack
            },
            message: message
          };
    }

};