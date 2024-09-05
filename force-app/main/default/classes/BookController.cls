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
            
            bookWrappers.add(new BookWrapper(book, imageUrl));
        }

        return bookWrappers;
    }

    // Get details for a single book
    @AuraEnabled(cacheable=true)
public static BookWrapper getBookDetails(Id bookId) {
    if (bookId == null) {
        throw new AuraHandledException('Invalid book ID');
    }
    
    Book__c book = [SELECT Id, Name, Description__c, Price__c, Average_Rating__c, No_of_Reviews__c, Publisher__r.Name, Author__r.Name, Category__r.Name FROM Book__c WHERE Id = :bookId LIMIT 1];
    
    //String genreName = book.Category__r.Name;                
    String imageUrl = getBookImage(bookId);

    return new BookWrapper(book, imageUrl);
}


    // Method to retrieve the image URL from ContentDocument
    private static String getBookImage(Id bookId) {
        // Query ContentDocumentLink for the related files
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
                return '/sfc/servlet.shepherd/version/download/' + contentVersions[0].Id;
            }
        }
        return null; // No image found
    }

    // Add to Cart logic (mock implementation)
    @AuraEnabled
    public static String addToCart(Id bookId, Integer quantity) {
        // Simulate adding to cart action
        return 'Book with ID ' + bookId + ' has been added to the cart with quantity: ' + quantity;
    }

    // Add to Wishlist logic (mock implementation)
    @AuraEnabled
    public static String addToWishlist(Id bookId) {
        // Simulate adding to wishlist action
        return 'Book with ID ' + bookId + ' has been added to the wishlist';
    }

    // Wrapper class to include the book and its image URL
    public class BookWrapper {
        @AuraEnabled
        public Book__c book { get; set; }
        @AuraEnabled
        public String imageUrl { get; set; }
       
        

        public BookWrapper(Book__c book, String imageUrl) {
            this.book = book;
            this.imageUrl = imageUrl;
            
        }
    }
}