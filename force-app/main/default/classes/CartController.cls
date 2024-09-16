public with sharing class CartController {
    @AuraEnabled(cacheable=true)
    public static List<Book__c> getCartItems() {
        // Get the current user's ID and fetch the related contact
       // Id userId = '003NS00000Ep0SY';
        
        // Get the contact related to the current user
       // Contact userContact = [SELECT Id, AccountId FROM Contact WHERE User__c = :userId LIMIT 1];
        
        // Fetch the cart related to the user's contact
       // Shopping_Cart__c userCart = [SELECT Id FROM Shopping_Cart__c WHERE Contact__c = :userContact.Id LIMIT 1];
        
        // Fetch the items in the cart
        return [SELECT Id, Name, Price__c, Author__c, Publisher__c
                FROM Book__c 
                WHERE Shoppping_Cart__c = 'a02NS000001KFoj'];
    }
}
