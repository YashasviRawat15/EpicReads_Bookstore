public with sharing class OrderController {

    // Method to create an order and process payment using Stripe
    @AuraEnabled
    public static String createOrderWithPayment(String contactId, Decimal amount, String paymentMethodId) {
        try {
            // Step 1: Update contact details
            Contact contact = [SELECT Id, Name, Email FROM Contact WHERE Id = :contactId LIMIT 1];
            
            // Assuming contact details may be updated elsewhere in the LWC
            update contact;

            // Step 2: Create a new order associated with the contact
            Order__c newOrder = new Order__c(
                Contact__c = contactId, 
                Total_Amount__c = amount, 
                Status__c = 'Pending'
            );
            insert newOrder;

            // Step 3: Process Stripe payment by making an HTTP callout
            String paymentStatus = processStripePayment(paymentMethodId, amount);

            // Step 4: If the payment is successful, update the order and create a payment record
            if (paymentStatus == 'succeeded') {
                // Update order status
                newOrder.Status__c = 'Completed';
                update newOrder;

                // Create a Payment record
                Payment__c paymentRecord = new Payment__c(
                    Payment_Method__c = 'Credit Card',
                    Payment_Status__c = 'Completed',
                    Order__c = newOrder.Id
                    
                );
                insert paymentRecord;

                return 'Order and payment successfully created!';
            } else {
                // Handle payment failure
                newOrder.Status__c = 'Failed';
                update newOrder;

                throw new AuraHandledException('Payment failed. Please try again.');
            }

        } catch (Exception e) {
            // Handle any exceptions and provide a meaningful message to the LWC
            throw new AuraHandledException('Error processing payment: ' + e.getMessage());
        }
    }

    // Method to process Stripe payments via HTTP callout
    public static String processStripePayment(String paymentMethodId, Decimal amount) {
        try {
            // Create an HTTP request to Stripe's Payment Intent API
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.stripe.com/v1/charges');
            req.setMethod('POST');
            req.setHeader('Authorization', 'sk_test_51Q0FTzJi20YIDM4QnJRMxT4lBn1nw29AXLOcmpaRX6wrnLUouW2vNSxXkfG9ik6VlX9u3UA5dPbilJquaS41SaeQ00kb9PzRjt'); 
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

            // Stripe expects the amount to be in cents (i.e., multiply by 100 for INR)
            Integer amountInCents = Integer.valueOf(amount * 100);

            // Set request body
            req.setBody('amount=' + String.valueOf(amountInCents) + '&currency=inr&payment_method=' + paymentMethodId + '&confirm=true');

            // Send the HTTP request
            Http http = new Http();
            HttpResponse res = http.send(req);

            // Check the response from Stripe
            if (res.getStatusCode() == 200) {
                // Parse the response to extract payment status
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

                // If the payment status is 'succeeded', return 'succeeded'
                if (responseMap.get('status') == 'succeeded') {
                    return 'succeeded';
                } else {
                    return 'failed'; // Handle other statuses like 'requires_action', 'requires_payment_method', etc.
                }
            } else {
                // If the status code is not 200, treat the payment as failed
                return 'failed';
            }

        } catch (Exception e) {
            // Log the error for debugging purposes and return 'failed'
            System.debug('Stripe Payment Error: ' + e.getMessage());
            return 'failed';
        }
    }
}
