public with sharing class WishlistController {
    public static User currentUser = [SELECT Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    public static Id contactId = currentUser.ContactId;
    public static Id accountId = currentUser.Contact.AccountId;

    @AuraEnabled
    public static String addToWishlist(Id bookId) {
        try {
            
            List<Wishlist__c> wishlists = [
                SELECT Id 
                FROM Wishlist__c 
                WHERE Account__c = :accountId AND Contact__c = :contactId
                LIMIT 1
            ];
            
            Wishlist__c wishlist;
            if (wishlists.isEmpty()) {
                
                wishlist = new Wishlist__c(
                    Account__c = accountId,
                    Contact__c = contactId
                );
                insert wishlist;
            } else {
                wishlist = wishlists[0];
            }

            
            List<Wishlist_Item__c> existingItems = [
                SELECT Id 
                FROM Wishlist_Item__c 
                WHERE Wishlist__c = :wishlist.Id 
                AND Book__c = :bookId
                LIMIT 1
            ];

            if (existingItems.isEmpty()) {
               
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
            
            Wishlist_Item__c item = [SELECT Id FROM Wishlist_Item__c WHERE Id = :wishlistItemId LIMIT 1];
            delete item;
            return 'Item removed from wishlist successfully.';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    


    @AuraEnabled(cacheable=true)
    public static List<WishlistItemWrapper> getWishlistItems() {
        
        List<Wishlist_Item__c> wishlistItemRecords = [
            SELECT Id, 
                   Book__c, 
                   Book__r.Name, 
                   Book__r.Author__r.Name,  
                   Book__r.Publisher__r.Name,  
                   Book__r.Price__c
            FROM Wishlist_Item__c
            WHERE OwnerId = :UserInfo.getUserId()
        ];

        
        Set<Id> bookIds = new Set<Id>();
        for (Wishlist_Item__c item : wishlistItemRecords) {
            bookIds.add(item.Book__c);
        }

        
        Map<Id, String> bookImages = new Map<Id, String>();
        if (!bookIds.isEmpty()) {
            List<ContentDocumentLink> contentLinks = [
                SELECT ContentDocument.LatestPublishedVersionId, LinkedEntityId
                FROM ContentDocumentLink
                WHERE LinkedEntityId IN :bookIds
            ];

            for (ContentDocumentLink link : contentLinks) {
                String contentVersionId = link.ContentDocument.LatestPublishedVersionId;
                bookImages.put(link.LinkedEntityId, 'https://tmc-f6-dev-ed.develop.my.site.com/sfc/servlet.shepherd/version/download/' + contentVersionId);
            }
        }

        
        List<WishlistItemWrapper> wishlistItems = new List<WishlistItemWrapper>();
        for (Wishlist_Item__c item : wishlistItemRecords) {
            String imageUrl = bookImages.containsKey(item.Book__c) ? bookImages.get(item.Book__c) : '';
            wishlistItems.add(new WishlistItemWrapper(
                item.Id,
                item.Book__c,
                item.Book__r.Name,
                item.Book__r.Author__r.Name,  
                item.Book__r.Publisher__r.Name,  
                item.Book__r.Price__c,
                imageUrl
            ));
        }

        return wishlistItems;
    }

    
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
