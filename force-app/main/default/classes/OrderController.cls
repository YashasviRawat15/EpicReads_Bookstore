
public with sharing class OrderController {

    public static User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    public static Id contactId = currentUser.ContactId;
    public static Id accountId = currentUser.Contact.AccountId;


    @AuraEnabled(cacheable=true)
    public static List<Order__c> getOrders() {
        return [SELECT Id, Name, Order_Date__c, Status__c, Total_Amount__c, Shopping_Cart__c 
                FROM Order__c 
                WHERE Contact__c = :contactId  ORDER BY Order_Date__c DESC] ;
    }

    @AuraEnabled
    public static List<Cart_Item__c> getCartItemsByShoppingCart(Id shoppingCartId) {
        return [SELECT Id, Book__r.Name, Quantity__c,Unit_Price__c, Total_Price__c 
                FROM Cart_Item__c 
                WHERE Shopping_Cart__c = :shoppingCartId];
    }



@AuraEnabled
public static String createOrderWithPayment( Decimal amount) {
    
        
        List<Shopping_Cart__c> carts = [
            SELECT Id, Cart_Total__c 
            FROM Shopping_Cart__c 
            WHERE Account__c = :accountId 
            AND Cart_Status__c = 'Active' 
            LIMIT 1
        ];

        

        Shopping_Cart__c cart = carts[0];
        Contact contact = [SELECT Id, Name, Email FROM Contact WHERE Id = :contactId LIMIT 1];

        
        String stripeSecretKey = 'sk_test_51Q0FTzJi20YIDM4QnJRMxT4lBn1nw29AXLOcmpaRX6wrnLUouW2vNSxXkfG9ik6VlX9u3UA5dPbilJquaS41SaeQ00kb9PzRjt'; // Replace with your Stripe secret key
        String endpoint = 'https://api.stripe.com/v1/charges';
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + stripeSecretKey);
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        
        String body = 'amount=' + String.valueOf(amount)  + 
                        '&currency=USD&source=tok_visa';

        req.setBody(body);

        
        Http http = new Http();
        HttpResponse res = http.send(req);

        

        
        Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        String paymentStatus = (String) responseMap.get('status');
        String returnMessage = '';


        if (res.getStatusCode() == 200) {
            //System.debug('Payment successfully done!!: ' + res.getBody());
            System.debug(res.getStatusCode());
            returnMessage = 'success';
            // Create the order if payment is successful

            cart.Cart_Status__c = 'Converted';
            update cart; 
        
        system.debug('Amount --> '+ amount);

        Order__c order = new Order__c();
        order.Account__c = accountId;
        order.Contact__c = contactId;
        order.Total_Amount__c = amount;
        order.Shopping_Cart__c = cart.Id;
        order.Status__c = 'Confirmed';
        order.Order_Date__c = system.now();
        insert order;

        System.debug('Order Id -- ' + order.id);
        Payment__c newPayment = new Payment__c();
        newPayment.Account__c = accountId; 
        newPayment.Contact__c = contactId; 
        newPayment.Payment_Method__c = 'Credit Card';
        newPayment.Payment_Status__c = 'Completed';
        newPayment.OrderC__c = order.Id;

    insert newPayment;

    Shopping_Cart__c newCart = new Shopping_Cart__c(
            Account__c = accountId,
            Contact__c = contactId,
            Cart_Status__c = 'Active',
            Cart_Total__c = 0
        );
        insert newCart;


            
            
        } else {
            System.debug('Error occured: ' + res.getBody());
            System.debug(res.getStatusCode());
            returnMessage = 'error';
        }

        return returnMessage;

        
    
        
    
}

}