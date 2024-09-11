public with sharing class BookController {

    // Return a list of books with their details and images stored in ContentDocument
    @AuraEnabled(cacheable=true)
    public static List<BookWrapper> getBooks() {
        List<BookWrapper> bookWrappers = new List<BookWrapper>();

        // Query the Book__c records
        List<Book__c> books = [SELECT Id, Name, Price__c, Average_Rating__c, No_of_Reviews__c FROM Book__c LIMIT 50];

        for (Book__c book : books) {
            // Get the ContentDocumentLink associated with the Book
            String imageUrl = getBookImage(book.Id);
            
            bookWrappers.add(new BookWrapper(book, imageUrl,'', '', '', ''));
        }

        return bookWrappers;
    }

    // Get details for a single book
    @AuraEnabled(cacheable=true)
public static BookWrapper getBookDetails(Id bookId) {
    if (bookId == null) {
        throw new AuraHandledException('Invalid book ID');
    }
    
    Book__c book = [SELECT Id, Name, Description__c, Price__c, Average_Rating__c, No_of_Reviews__c, Publisher__c, Author__c, Category__c, Sub_Category__c FROM Book__c WHERE Id = :bookId LIMIT 1];
    Author__c author = [SELECT Name from Author__c Where Id =:book.Author__c];
    Publisher__c publisher = [SELECT Name FROM Publisher__c WHERE Id=:book.Publisher__c];
    Book_Category__c category = [SELECT Name FROM Book_Category__c WHERE Id =:book.Category__c];
    Book_Category__c subCategory = [SELECT Name FROM Book_Category__c WHERE Id =:book.Sub_Category__c];




    //String genreName = book.Category__r.Name;                
    String imageUrl = getBookImage(bookId);

    return new BookWrapper(book, imageUrl, author.Name, Publisher.Name, category.Name, subCategory.Name);
}


   
    private static String getBookImage(Id bookId) {
       
        List<ContentDocumentLink> docLinks = [
            SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :bookId LIMIT 1
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

    // Add to Cart logic 
    @AuraEnabled
    public static String addToCart(Id bookId, Integer quantity) {
        
        return 'Book with ID ' + bookId + ' has been added to the cart with quantity: ' + quantity;
    }

    // Add to Wishlist logic 
    @AuraEnabled
    public static String addToWishlist(Id bookId) {
       
        return 'Book with ID ' + bookId + ' has been added to the wishlist';
    }

    // Wrapper class to include the book and its image URL
    public class BookWrapper {
        @AuraEnabled
        public Book__c book { get; set; }
        @AuraEnabled
        public String imageUrl { get; set; }
        @AuraEnabled
        public String author { get; set; }
        @AuraEnabled
        public String publisher { get; set; }
        @AuraEnabled
        public String category { get; set; }
        @AuraEnabled
        public String subCategory { get; set; }
        

        public BookWrapper(Book__c book, String imageUrl, String author, String publisher, String category, String subCategory) {
            this.book = book;
            this.imageUrl = imageUrl;
            this.author =  author;
            this.publisher = publisher;
            this.category = category;
            this.subCategory = subCategory;
        }
    }
}