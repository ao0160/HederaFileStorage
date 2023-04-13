module.exports = {
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
        statuscode = statuscode || 400;
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