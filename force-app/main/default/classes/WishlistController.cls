public with sharing class WishlistController {

    @AuraEnabled
    public static String addToWishlist(Id bookId, Id contactId, Id accountId) {
        try {
            // Query for an existing Wishlist record for the user and contact
            List<Wishlist__c> wishlists = [
                SELECT Id 
                FROM Wishlist__c 
                WHERE Account__c = :accountId AND Contact__c = :contactId
                LIMIT 1
            ];
            
            Wishlist__c wishlist;
            if (wishlists.isEmpty()) {
                // Create a new wishlist if none exists
                wishlist = new Wishlist__c(
                    Account__c = accountId,
                    Contact__c = contactId
                );
                insert wishlist;
            } else {
                wishlist = wishlists[0];
            }

            // Check if the book is already in the wishlist
            List<Wishlist_Item__c> existingItems = [
                SELECT Id 
                FROM Wishlist_Item__c 
                WHERE Wishlist__c = :wishlist.Id 
                AND Book__c = :bookId
                LIMIT 1
            ];

            if (existingItems.isEmpty()) {
                // Add the book to the wishlist
                Wishlist_Item__c newItem = new Wishlist_Item__c(
                    Book__c = bookId,
                    Wishlist__c = wishlist.Id
                );
                insert newItem;
                return 'Book added to wishlist successfully.';
            } else {
                return 'Book is already in the wishlist.';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String removeFromWishlist(Id wishlistItemId) {
        try {
            // Delete the Wishlist Item
            Wishlist_Item__c item = [SELECT Id FROM Wishlist_Item__c WHERE Id = :wishlistItemId LIMIT 1];
            delete item;
            return 'Item removed from wishlist successfully.';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    


    @AuraEnabled(cacheable=true)
    public static List<WishlistItemWrapper> getWishlistItems() {
        // Step 1: Query the wishlist items and associated book, author, and publisher details
        List<Wishlist_Item__c> wishlistItemRecords = [
            SELECT Id, 
                   Book__c, 
                   Book__r.Name, 
                   Book__r.Author__r.Name,  // Fetch Author Name
                   Book__r.Publisher__r.Name,  // Fetch Publisher Name
                   Book__r.Price__c
            FROM Wishlist_Item__c
            WHERE OwnerId = :UserInfo.getUserId()
        ];

        // Step 2: Collect Book IDs to query ContentDocumentLinks
        Set<Id> bookIds = new Set<Id>();
        for (Wishlist_Item__c item : wishlistItemRecords) {
            bookIds.add(item.Book__c);
        }

        // Step 3: Query ContentDocumentLink based on Book__c IDs
        Map<Id, String> bookImages = new Map<Id, String>();
        if (!bookIds.isEmpty()) {
            List<ContentDocumentLink> contentLinks = [
                SELECT ContentDocument.LatestPublishedVersionId, LinkedEntityId
                FROM ContentDocumentLink
                WHERE LinkedEntityId IN :bookIds
            ];

            for (ContentDocumentLink link : contentLinks) {
                String contentVersionId = link.ContentDocument.LatestPublishedVersionId;
                bookImages.put(link.LinkedEntityId, 'https://tmc-f6-dev-ed.develop.my.salesforce.com/sfc/servlet.shepherd/version/download/' + contentVersionId);
            }
        }

        // Step 4: Build the list of wishlist items with images
        List<WishlistItemWrapper> wishlistItems = new List<WishlistItemWrapper>();
        for (Wishlist_Item__c item : wishlistItemRecords) {
            String imageUrl = bookImages.containsKey(item.Book__c) ? bookImages.get(item.Book__c) : '';
            wishlistItems.add(new WishlistItemWrapper(
                item.Id,
                item.Book__c,
                item.Book__r.Name,
                item.Book__r.Author__r.Name,  // Pass Author Name
                item.Book__r.Publisher__r.Name,  // Pass Publisher Name
                item.Book__r.Price__c,
                imageUrl
            ));
        }

        return wishlistItems;
    }

    // Wrapper class to pass required fields to LWC
    public class WishlistItemWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String bookId;
        @AuraEnabled public String title;
        @AuraEnabled public String author;
        @AuraEnabled public String publisher;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String imageUrl;

        public WishlistItemWrapper(String id, String bookId, String title, String author, String publisher, Decimal price, String imageUrl) {
            this.id = id;
            this.title = title;
            this.author = author;
            this.publisher = publisher;
            this.price = price;
            this.imageUrl = imageUrl;
            this.bookId = bookId;
        }
    }
}
