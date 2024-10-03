public with sharing class AuthorDetailsController {
    @AuraEnabled(cacheable=true)
    public static List<Author__c> getAuthorDetails(Id authorId) {

        List<Author__c> authorList = [
            SELECT Id, Name, Biography__c, Date_of_Birth__c, Email__c, Nationality__c, OwnerId
            FROM Author__c
            WHERE Id = :authorId
        ];
        System.debug(authorList);

        return authorList;
    }

    /*
    @AuraEnabled(cacheable=true)
    public static ContentDocument getAuthorPhoto(Id authorId) {
        // Assuming a relationship exists between Author and ContentDocument
        // Modify the SOQL based on your actual setup
        return [
            SELECT Id, Title, FileType 
            FROM ContentDocument 
            WHERE LinkedEntityId = :authorId
            LIMIT 1
        ];
    }
        */


        @AuraEnabled(cacheable=true)
        public static String getAuthorPhoto(Id authorId) {
       
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
                    return 'https://tmc-f6-dev-ed.develop.my.site.com//sfc/servlet.shepherd/version/download/' + contentVersions[0].Id;
                    //return '/servlet/servlet.FileDownload?file={'+ contentVersions[0].Id +'}';
                }
            }
            return null; 
        }

    @AuraEnabled(cacheable=true)
    public static List<Book__c> getBooksByAuthor(Id authorId) {

        List<Book__c> bookList = [
            SELECT Id, Name, ISBN__c, Published_Date__c
            FROM Book__c
            WHERE Author__c = :authorId
        ];

        return bookList;
    }
}