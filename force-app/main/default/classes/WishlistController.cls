public with sharing class WishlistController {
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
        @AuraEnabled public String title;
        @AuraEnabled public String author;
        @AuraEnabled public String publisher;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String imageUrl;

        public WishlistItemWrapper(String id, String title, String author, String publisher, Decimal price, String imageUrl) {
            this.id = id;
            this.title = title;
            this.author = author;
            this.publisher = publisher;
            this.price = price;
            this.imageUrl = imageUrl;
        }
    }
}
