public with sharing class StripeApiHandler {
    @AuraEnabled
    public static String PostMethod(String amount){
        //Query to fetch all the records of stripe api which stores in custom metadata.
       // StripeApi__mdt stripeData = [SELECT Content_Type__c,endpoint__c,method__c,secret_key__c FROM StripeApi__mdt];
        //system.debug(stripeData);
       // system.debug(stripeData.Content_Type__c);
        //system.debug('Amount-->'+amount);
        //  system.debug('cardNumber-->'+cardNumber);
        //  system.debug('cardMonth-->'+cardMonth);
        //  system.debug('cardYear-->'+cardYear);
        //  system.debug('cvv-->'+cvv);
        String secret_key = 'sk_test_51Q0FTzJi20YIDM4QnJRMxT4lBn1nw29AXLOcmpaRX6wrnLUouW2vNSxXkfG9ik6VlX9u3UA5dPbilJquaS41SaeQ00kb9PzRjt' ;
        String returnMessage = 'error';
        system.debug(amount);
        //Check that amount field is empty or not.
        if(String.isNotBlank(amount)){
            system.debug('Inside if');
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.stripe.com/v1/charges');
            request.setMethod('POST');
            request.setHeader('Authorization', 'Bearer ' + secret_key);
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            String requestBody = 'amount='+amount+'&currency=usd&source=tok_visa';/*+'&type=card' +
                                 '&card[number]='+cardnumber+'&card[exp_month]='+cardMonth+'&card [exp_year]='+cardYear+'&card[cvc]"='+cvv; */
            system.debug('requestBody->' + requestBody);
            request.setBody(requestBody);
            
            Http http = new Http();
            HTTPResponse result = http.send(request);
            // if api return success code is 200 then it returns sucess string otherwise returns error.
            if (result.getStatusCode() == 200) {
                System.debug('Payment successfully done!!: ' + result.getBody());
                System.debug(result.getStatusCode());
                returnMessage = 'success';
                
            } else {
                System.debug('Error occured: ' + result.getBody());
                System.debug(result.getStatusCode());
                returnMessage = 'error';
            }
            
        }   
        return returnMessage;
    }    
}