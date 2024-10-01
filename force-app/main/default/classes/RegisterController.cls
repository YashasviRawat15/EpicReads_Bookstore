public class RegisterController {
    public String name { get; set; }
    public String email { get; set; }
    public String phone { get; set; }
    
    public String street { get; set; }
    public String city { get; set; }
    public String state { get; set; }
    public String country { get; set; }
    public String pincode { get; set; }

    public PageReference register() {
        try {
            Account acc = new Account(
                Name = name,
                Phone = phone,
                Email__c = email,
                BillingStreet = street,
                BillingCity = city,
                BillingState = state,
                BillingCountry = country,
                BillingPostalCode = pincode
            );
            insert acc;
            System.debug('Account Created Successfully');

            Contact contact = new Contact(
                FirstName = name.split(' ')[0],
                LastName = name.split(' ').size() > 1 ? name.split(' ')[1] : '',
                Email = email,
                Phone = phone,
                AccountId = acc.Id,
                MailingStreet = street,
                MailingCity = city,
                MailingState = state,
                MailingCountry = country,
                MailingPostalCode = pincode
            );
            insert contact;

            User newUser = new User(
                Username = email,
                Email = email,
                LastName = name.split(' ').size() > 1 ? name.split(' ')[1] : name,
                FirstName = name.split(' ')[0],
                Alias = name.substring(0, 5),
                Phone = phone,
                CommunityNickname = 'User' + acc.Id,
                ContactId = contact.Id,
                ProfileId = [SELECT Id FROM Profile WHERE Name = 'Partner Community Login User Clone' LIMIT 1].Id,
                TimeZoneSidKey = 'Asia/Kolkata',
                emailencodingkey = 'UTF-8',
                languagelocalekey = 'en_US',
                LocaleSidKey = 'en_US'
            );
            insert newUser;
            
            System.debug('User Created Successfully');
            
            // Assign the permission set 'Site Customer Permission Set' to the user
        /*    PermissionSetAssignment psa = new PermissionSetAssignment(
                AssigneeId = newUser.Id,
                PermissionSetId = [SELECT Id FROM PermissionSet WHERE Name = 'Site_Customer_Permssion_Set' LIMIT 1].Id
            );
            insert psa;
            
            System.debug('Permission Set Assigned Successfully*/
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.CONFIRM, 'Check your email to set password.'));

            return Page.LoginPage;
       } catch (Exception e) {
            System.debug('Error Encountered');
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Registration failed: ' + e.getMessage()));
            return null;
        }
    }
}