public with sharing class StripePaymentController {
    @AuraEnabled
    public static Map<String, Object> createCharge(String tokenId, String cardName) {
        Map<String, Object> response = new Map<String, Object>();
        
        try {
            // Your secret key from the Stripe dashboard
            String stripeSecretKey = 'sk_test_51Q0FTzJi20YIDM4QnJRMxT4lBn1nw29AXLOcmpaRX6wrnLUouW2vNSxXkfG9ik6VlX9u3UA5dPbilJquaS41SaeQ00kb9PzRjt';
            
            // Set up HTTP request to Stripe API
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.stripe.com/v1/charges');
            req.setMethod('POST');
            req.setHeader('Authorization', 'Bearer ' + stripeSecretKey);
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            String params = 'amount=5000&currency=usd&description=Test Payment&source=' + tokenId;
            req.setBody(params);

            Http http = new Http();
            HttpResponse res = http.send(req);

            // Parse the response from Stripe
            if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
                response.put('success', true);
                response.put('message', 'Payment successful!');
            } else {
                response.put('success', false);
                response.put('message', res.getBody());
            }
        } catch (Exception ex) {
            response.put('success', false);
            response.put('message', ex.getMessage());
        }
        
        return response;
    }
}
