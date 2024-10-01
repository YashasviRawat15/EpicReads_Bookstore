public class ForgotPasswordPageController {

    public String username { get; set; }

    public PageReference forgotPassword() {
        try {
            // Find the user by their username
            User u = [SELECT Id, Email FROM User WHERE Username = :username LIMIT 1];

            // Send email to the user with instructions for resetting their password
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new String[] { u.Email });
            email.setSubject('Password Reset Request');
            email.setPlainTextBody('Hello,\n\n'
                + 'We received a request to reset your password. '
                + 'Please click the following link to reset your password:\n'
                + URL.getOrgDomainUrl().toExternalForm() + '/secur/forgotpassword.jsp?un=' + username + '\n\n'
                + 'If you did not request this change, please ignore this email.\n\n'
                + 'Thank you.');

            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });

            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.INFO, 'A password reset link has been sent to your email.'));
            return null;
        } catch (QueryException e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'No user found with this username.'));
            return null;
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'An error occurred while trying to reset the password.'));
            return null;
        }
    }
}