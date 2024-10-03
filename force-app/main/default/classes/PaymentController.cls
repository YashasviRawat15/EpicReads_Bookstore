public with sharing class PaymentController {
    @AuraEnabled
    public static String createPayment(Map<String, Object> paymentDetails) {
        
        Payment__c newPayment = new Payment__c();
        newPayment.Account__c = '001NS00000WkMKr'; 
        newPayment.Contact__c = '003NS00000Dj76r'; 
        newPayment.Payment_Method__c = 'Credit Card';
        newPayment.Payment_Status__c = 'Completed';

        insert newPayment;
        
        return 'Payment created successfully';
    }
}
