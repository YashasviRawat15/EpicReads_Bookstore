public with sharing class AuthorController {

    @AuraEnabled(cacheable=true)
    public static List<AuthorWrapper> getAuthors() {
        List<AuthorWrapper> authorWrappers = new List<AuthorWrapper>();
        List<Author__c> authors = [SELECT Id, Name FROM Author__c LIMIT 50];

        for (Author__c author : authors) {
            String imageUrl = getAuthorImage(author.Id);
            system.debug('Image in apex --> ' + imageUrl);
            authorWrappers.add(new AuthorWrapper(author, getAuthorImage(author.Id)));
        }
        system.debug('author Wrapper --> '+ authorWrappers);
        system.debug('author image url  --> '+ authors[0]);
        return authorWrappers;
    }

    @AuraEnabled(cacheable=true)
    public static AuthorWrapper getAuthorDetails(Id authorId) {
        if (authorId == null) {
            throw new AuraHandledException('Invalid Author ID');
        }
        
        Author__c author = [SELECT Id, Name, Biography__C, Nationality__c FROM Author__c WHERE Id = :authorId LIMIT 1];
        String imageUrl = getAuthorImage(authorId);
        system.debug('Image in apex --> ' + imageUrl);

        return new AuthorWrapper(author, imageUrl);
    }

    private static String getAuthorImage(Id authorId) {
        List<ContentDocumentLink> docLinks = [
            SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :authorId LIMIT 1
        ];
        
        if (!docLinks.isEmpty()) {
            List<ContentVersion> contentVersions = [
                SELECT Id, ContentDocumentId, VersionData 
                FROM ContentVersion 
                WHERE ContentDocumentId = :docLinks[0].ContentDocumentId 
                AND IsLatest = true LIMIT 1
            ];

            if (!contentVersions.isEmpty()) {
                return 'https://tmc-f6-dev-ed.develop.my.site.com/sfc/servlet.shepherd/version/download/' + contentVersions[0].Id;
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
