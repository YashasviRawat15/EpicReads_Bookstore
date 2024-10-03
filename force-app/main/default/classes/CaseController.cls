public with sharing class CaseController {
    @AuraEnabled
    public static String createCase(Map<String, String> caseDetails) {
        // Id userId = UserInfo.getUserId();
        // Contact userContact = [SELECT Id, AccountId FROM Contact WHERE UserId = :userId LIMIT 1];
        
        User currentUser = [SELECT Id, ContactId, Contact.Name, Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

       System.debug('Contact Found --> ' + currentUser.Contact.Name);

        try{

            List<Case> caseList= new List<Case>();

        Case newCase = new Case(
            Reason = caseDetails.get('reason'),
            Subject = caseDetails.get('subject'),
            Description = caseDetails.get('description'),
            ContactId = currentUser.ContactId,
            AccountId = currentUser.Contact.AccountId,
            // ContactId ='003NS00000FOlMvYAL',
            // AccountId = '001NS00000Zr2YzYAJ',
            Origin = 'Web',
            SuppliedEmail = caseDetails.get('email') 
        );

        System.debug('New Case Details --> '+newCase);

        caseList.add(newCase);
        System.debug('Case List --> '+ caseList);
        insert caseList;

        System.debug('Case Added Successfully');

        return newCase.Id;

        }catch (Exception e) {
            System.debug('Error while creating case: ' + e.getMessage());
            throw new AuraHandledException('Error creating case: ' + e.getMessage());
        }

    }
}
