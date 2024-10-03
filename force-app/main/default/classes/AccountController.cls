public with sharing class AccountController {

    public static User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    @AuraEnabled(cacheable=true)
    public static Contact getCurrentUserAccount() {
       // User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
       //User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = '001NS00000WkMKr' LIMIT 1];
        
        if (currentUser.ContactId != null) {

            Contact currentContact = [SELECT Id, Name,FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contact
            WHERE Id = :currentUser.ContactId LIMIT 1];

            System.debug('Contact Details -->  ' + currentContact);

            return currentContact;
            //return [SELECT Id, Name, (SELECT Id, Name, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contacts) 
                  //  FROM Account WHERE Id = '001NS00000WkMKr' LIMIT 1];
       }
        return null;
    }

    @AuraEnabled
    public static void createNewContact(Map<String, String> contactData) {
        Id accountId = currentUser.Contact.AccountId;
        Contact newContact = new Contact(
            FirstName = contactData.get('firstName'),
            LastName = contactData.get('lastName'),
            Email = contactData.get('email'),
            Phone = contactData.get('phone'),
            MailingStreet = contactData.get('mailingStreet'),
            MailingCity = contactData.get('mailingCity'),
            MailingState = contactData.get('mailingState'),
            MailingPostalCode = contactData.get('mailingPostalCode'),
            MailingCountry = contactData.get('mailingCountry'),
            AccountId = accountId
        );
        insert newContact;
    }

    @AuraEnabled(cacheable=true)
    public static Contact getContactDetails() {
        system.debug('Inside getContactDetails');
        //system.debug('Contact ID --> ' + contactId);
       
            
            Contact contactDetails = [
                SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry
                FROM Contact
                WHERE Id = :currentUser.ContactId
                LIMIT 1
            ];
            system.debug('Conatct Details --> '+ contactDetails);
            
            return contactDetails;
       
    }


    @AuraEnabled
public static void updateContact(Map<String, String> contactData) {
    Contact contactToUpdate = [
        SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry
        FROM Contact
        WHERE Id = :currentUser.ContactId
        LIMIT 1
    ];
    
    contactToUpdate.FirstName = contactData.get('FirstName');
    contactToUpdate.LastName = contactData.get('LastName');
    contactToUpdate.Email = contactData.get('Email');
    contactToUpdate.Phone = contactData.get('Phone');
    contactToUpdate.MailingStreet = contactData.get('MailingStreet');
    contactToUpdate.MailingCity = contactData.get('MailingCity');
    contactToUpdate.MailingState = contactData.get('MailingState');
    contactToUpdate.MailingPostalCode = contactData.get('MailingPostalCode');
    contactToUpdate.MailingCountry = contactData.get('MailingCountry');
    
    update contactToUpdate;
}


}

