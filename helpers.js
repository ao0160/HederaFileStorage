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
};