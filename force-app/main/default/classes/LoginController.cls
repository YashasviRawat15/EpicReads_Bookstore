public class LoginController {
    public String username { get; set; }
    public String password { get; set; }

    public PageReference login() {
        try {
            
            PageReference pr = Site.login(username, password, '/s');

            if (pr != null) {
                pr.setRedirect(true);
                System.debug('Logged In');
                return pr; 
            } else {
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Invalid credentials.'));
                System.debug('Invalid Credentials');
                return null;
            }
        } catch (Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Login failed. Please try again.'));
            System.debug('Error');
            return null;
        }
    }
}