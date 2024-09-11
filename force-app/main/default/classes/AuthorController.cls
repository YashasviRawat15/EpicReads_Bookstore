public with sharing class AuthorController {
    
    @AuraEnabled(cacheable=true)
    public static List<AuthorWrapper> getAuthors() {
        List<AuthorWrapper> authorWrappers = new List<AuthorWrapper>();

        
        List<Author__c> authors = [SELECT Id, Name FROM Author__c LIMIT 50];

        for (Author__c author : authors) {
            
            String imageUrl = getAuthorImage(author.Id);
            
            authorWrappers.add(new AuthorWrapper(author, imageUrl));
        }

        return authorWrappers;
    }

    
    @AuraEnabled(cacheable=true)
public static AuthorWrapper getAuthorDetails(Id authorId) {
    if (authorId == null) {
        throw new AuraHandledException('Invalid book ID');
    }
    
    Author__c author = [SELECT Id, Name, Biography__C, Nationality__c FROM Author__c WHERE Id = :authorId LIMIT 1];
    
                    
    String imageUrl = getAuthorImage(authorId);

    return new AuthorWrapper(author, imageUrl);
}


   
    private static String getAuthorImage(Id authorId) {
       
        List<ContentDocumentLink> docLinks = [
            SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :authorId LIMIT 1
        ];
        
        if (!docLinks.isEmpty()) {
            // Query ContentVersion to get the latest image version of the document
            List<ContentVersion> contentVersions = [
                SELECT Id, ContentDocumentId, VersionData 
                FROM ContentVersion 
                WHERE ContentDocumentId = :docLinks[0].ContentDocumentId 
                AND IsLatest = true LIMIT 1
            ];

            if (!contentVersions.isEmpty()) {
                return 'https://tmc-f6-dev-ed.develop.my.salesforce.com/sfc/servlet.shepherd/version/download/' + contentVersions[0].Id;
                //return '/servlet/servlet.FileDownload?file={'+ contentVersions[0].Id +'}';
            }
        }
        return null; 
    }

    

   
    public class AuthorWrapper {
        @AuraEnabled
        public Author__c author { get; set; }
        @AuraEnabled
        public String imageUrl { get; set; }
        

        public AuthorWrapper(Author__c author, String imageUrl) {
            this.author = author;
            this.imageUrl = imageUrl;
            
            
           
        }
    }
}