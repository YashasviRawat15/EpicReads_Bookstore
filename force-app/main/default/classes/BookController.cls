public with sharing class BookController {

@AuraEnabled(cacheable=true)
public static List<BookWrapper> getBooks() {
    List<BookWrapper> bookWrappers = new List<BookWrapper>();

    List<Book__c> books = [SELECT Id, Name, Price__c, Average_Rating__c, No_of_Reviews__c FROM Book__c WHERE Active__c = true];

    for (Book__c book : books) {
        String imageUrl = getBookImage(book.Id);
        system.debug('book image url--> '+book.Name+'-->'+imageUrl);
        bookWrappers.add(new BookWrapper(book, imageUrl, '', '', '', ''));
    }

    return bookWrappers;
}

@AuraEnabled(cacheable=true)
public static List<BookWrapper> getBooksByGenre(String genre) {
    List<BookWrapper> bookWrappers = new List<BookWrapper>();
    String genreName = '';

    if (genre == 'academic-and-educational') {
        genreName = 'Academic & Educational';
    } else if (genre == 'business-and-economics') {
        genreName = 'Business & Economics';
    } else if (genre == 'children') {
        genreName = 'Children\'s Books';
    } else if (genre == 'fiction') {
        genreName = 'Fiction';
    } else if (genre == 'non-fiction') {
        genreName = 'Non-Fiction';
    } else if (genre == 'religious-and-spiritual') {
        genreName = 'Religious & Spiritual';
    }

    List<Book__c> books = [
        SELECT Id, Name, Price__c, Average_Rating__c, No_of_Reviews__c 
        FROM Book__c 
        WHERE Category__r.Name = :genreName AND Active__c = true
    ];

    for (Book__c book : books) {
        String imageUrl = getBookImage(book.Id);
        bookWrappers.add(new BookWrapper(book, imageUrl, '', '', '', ''));
    }

    return bookWrappers;
}

@AuraEnabled(cacheable=true)
public static List<BookWrapper> getBooksByLanguage(String language) {
    List<BookWrapper> bookWrappers = new List<BookWrapper>();
    List<Book__c> books;

    if (language == 'hindi' || language == 'english') {
        books = [
            SELECT Id, Name, Price__c, Average_Rating__c, No_of_Reviews__c 
            FROM Book__c 
            WHERE Language__c = :language AND Active__c = true
        ];
    } else {
        books = [
            SELECT Id, Name, Price__c, Average_Rating__c, No_of_Reviews__c 
            FROM Book__c 
            WHERE Language__c != 'Hindi' AND Language__c != 'English' AND Active__c = true
        ];
    }

    for (Book__c book : books) {
        String imageUrl = getBookImage(book.Id);
        bookWrappers.add(new BookWrapper(book, imageUrl, '', '', '', ''));
    }

    return bookWrappers;
}

@AuraEnabled(cacheable=true)
public static BookWrapper getBookDetails(Id bookId) {
    if (bookId == null) {
        throw new AuraHandledException('Invalid book ID');
    }

    Book__c book = [
        SELECT Id, Name, Description__c, Price__c, Average_Rating__c, No_of_Reviews__c, Publisher__c, Author__c, Category__c, Sub_Category__c 
        FROM Book__c 
        WHERE Id = :bookId 
        LIMIT 1
    ];
    Author__c author = [SELECT Name FROM Author__c WHERE Id = :book.Author__c];
    Publisher__c publisher = [SELECT Name FROM Publisher__c WHERE Id = :book.Publisher__c];
    Book_Category__c category = [SELECT Name FROM Book_Category__c WHERE Id = :book.Category__c];
    Book_Category__c subCategory = [SELECT Name FROM Book_Category__c WHERE Id = :book.Sub_Category__c];

    String imageUrl = getBookImage(bookId);

    return new BookWrapper(book, imageUrl, author.Name, publisher.Name, category.Name, subCategory.Name);
}

public static String getBookImage(Id bookId) {

    system.debug('book id for image --> '+bookId);
    List<ContentDocumentLink> docLinks = [
        SELECT ContentDocumentId 
        FROM ContentDocumentLink 
        WHERE LinkedEntityId = :bookId 
        LIMIT 1
    ];
    system.debug('ContentDocumentLink --> '+docLinks);

    if (!docLinks.isEmpty()) {
        List<ContentVersion> contentVersions = [
            SELECT Id 
            FROM ContentVersion 
            WHERE ContentDocumentId = :docLinks[0].ContentDocumentId 
            AND IsLatest = true LIMIT 1
        ];

        system.debug('ContentVersion --> '+contentVersions);

        if (!contentVersions.isEmpty()) {
           // String baseUrl = URL.getOrgDomainUrl().toExternalForm();
            //return baseUrl + '/sfc/servlet.shepherd/version/download/' + contentVersions[0].Id;
            return 'https://tmc-f6-dev-ed.develop.my.site.com/sfc/servlet.shepherd/version/download/' + contentVersions[0].Id;
          //return 'https://tmc-f6-dev-ed.develop.my.site.com/sfc/servlet.shepherd/document/download/' + docLinks[0].ContentDocumentId;


        }
    }

    return 'https://tmc-f6-dev-ed.develop.my.site.com/resource/DefaultBookCover';
    //return null;
}


// public static Map<Id, String> getBookImages(List<Id> bookIds) {
//     Map<Id, String> bookImageLinks = new Map<Id, String>();
//     List<ContentDistribution> contentDistributions = new List<ContentDistribution>();

//     // Step 1: Query ContentDocumentLinks for all books
//     List<ContentDocumentLink> docLinks = [
//         SELECT ContentDocumentId, LinkedEntityId
//         FROM ContentDocumentLink 
//         WHERE LinkedEntityId IN :bookIds
//     ];

//     if (!docLinks.isEmpty()) {
//         // Step 2: Query ContentVersions for the linked documents
//         List<ContentVersion> contentVersions = [
//             SELECT Id, Title, ContentDocumentId 
//             FROM ContentVersion 
//             WHERE ContentDocumentId IN :docLinks 
//             AND IsLatest = true
//         ];

//         // Step 3: Create ContentDistribution records for all the queried files
//         for (ContentVersion cv : contentVersions) {
//             ContentDistribution contentDist = new ContentDistribution(
//                 Name = cv.Title,
//                 ContentVersionId = cv.Id
//             );
//             contentDistributions.add(contentDist);
//         }

//         // Step 4: Insert all ContentDistribution records at once
//         if (!contentDistributions.isEmpty()) {
//             insert contentDistributions;

//             // Map the distribution URL back to the respective book records
//             for (ContentDistribution cd : contentDistributions) {
//                 // You need to relate back to the LinkedEntityId
//                 Id linkedEntityId = docLinks.stream()
//                     .filter(link -> link.ContentDocumentId == contentVersions.get(0).ContentDocumentId)
//                     .map(link -> link.LinkedEntityId)
//                     .findFirst()
//                     .orElse(null);
                
//                 if (linkedEntityId != null) {
//                     bookImageLinks.put(linkedEntityId, cd.DistributionPublicUrl);
//                 }
//             }
//         }
//     }

//     return bookImageLinks; // Return public links mapped to book IDs
// }
















@AuraEnabled(cacheable=true)
public static List<Review__c> getBookReviews(Id bookId) {
    if (bookId == null) {
        throw new AuraHandledException('Invalid book ID');
    }

    List<Review__c> allReviews = [
        SELECT Id, Rating__c, Review_Text__c, Review_Date__c, CreatedBy.Name 
        FROM Review__c 
        WHERE Book__c = :bookId
        ORDER BY Review_Date__c DESC
        LIMIT 8
    ];

    List<Review__c> nonEmptyReviews = new List<Review__c>();
    for (Review__c review : allReviews) {
        if (String.isNotBlank(review.Review_Text__c)) {
            nonEmptyReviews.add(review);
        }

        if (nonEmptyReviews.size() == 10) {  
            break;
        }
    }

    return nonEmptyReviews;
}

@AuraEnabled
public static Review__c submitReview(Id bookId, Decimal rating, String reviewText) {
    if (bookId == null || rating == null || reviewText == null || reviewText.trim() == '') {
        throw new AuraHandledException('All fields are required');
    }

    Review__c newReview = new Review__c(
        Book__c = bookId,
        Rating__c = rating,
        Review_Text__c = reviewText,
        Review_Date__c = Date.today()
    );

    insert newReview;
    return newReview;
}

public class BookWrapper {
    @AuraEnabled public Book__c book { get; set; }
    @AuraEnabled public String imageUrl { get; set; }
    @AuraEnabled public String author { get; set; }
    @AuraEnabled public String publisher { get; set; }
    @AuraEnabled public String category { get; set; }
    @AuraEnabled public String subCategory { get; set; }

    public BookWrapper(Book__c book, String imageUrl, String author, String publisher, String category, String subCategory) {
        this.book = book;
        this.imageUrl = imageUrl;
        this.author = author;
        this.publisher = publisher;
        this.category = category;
        this.subCategory = subCategory;
    }
}
}
