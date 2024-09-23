public with sharing class RegisterControllerLwc {
    @AuraEnabled
    public static void registerUser(Map<String, String> fields) {
        // Create the User
        User u = new User(
            FirstName = fields.get('firstName'),
            LastName = fields.get('lastName'),
            Email = fields.get('email'),
            Phone = fields.get('phone'),
            Username = fields.get('email'),
            Alias = fields.get('firstName').substring(0, 2),
            CommunityNickname = fields.get('firstName') + fields.get('lastName'),
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Login User'].Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            IsActive = true,
            UserRoleId = null
        );
        insert u;

        // Create the Account
        Account acc = new Account(
            Name = fields.get('firstName') + ' ' + fields.get('lastName'),
            Phone = fields.get('phone'),
            Email__c = fields.get('email') // Assuming you have a custom Email field on the Account object
        );
        insert acc;
    }

    // Method to trigger password reset email
    @AuraEnabled
    public static void forgotPassword(String email) {
        List<User> users = [SELECT Id FROM User WHERE Email = :email LIMIT 1];
        if (!users.isEmpty()) {
            System.resetPassword(users[0].Id, true);
        }
    }
}