public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static Account getCurrentUserAccount() {
        //User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = '001NS00000WkMKr' LIMIT 1];
        
        if (currentUser.Contact.AccountId != null) {
            //return [SELECT Id, Name, (SELECT Id, Name, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contacts) 
                    //FROM Account WHERE Id = :currentUser.Contact.AccountId LIMIT 1];
            return [SELECT Id, Name, (SELECT Id, Name, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contacts) 
                    FROM Account WHERE Id = '001NS00000WkMKr' LIMIT 1];
        }
        return null;
    }
}
