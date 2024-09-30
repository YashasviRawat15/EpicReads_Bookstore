public with sharing class CartController {

    public static User currentUser = [SELECT ContactId,Contact.AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    public static Id contactId = currentUser.ContactId;
    public static Id accountId = currentUser.Contact.AccountId;
    @AuraEnabled
    public static String addToCart(Id bookId, Integer quantity) {

       

        system.debug('contactId--> '+contactId );
        system.debug('accountId--> '+accountId );
            system.debug('cart details -->' + bookId +' '+ quantity);
            // Get the current user's active shopping cart
            Shopping_Cart__c cart = [
                SELECT Id 
                FROM Shopping_Cart__c 
                WHERE Cart_Status__c = 'Active' 
                AND Account__c = :accountId
                AND Contact__c = :contactId
                LIMIT 1
            ];

        //     Shopping_Cart__c cart;
        //     if (carts.isEmpty()) {
        //         // Create a new shopping cart if one does not exist
        //         cart = new Shopping_Cart__c(
        //             Cart_Status__c = 'Active',
        //             Account__c = accountId,
        //             Contact__c = contactId,
        //             Cart_Total__c = 0
        //         );
        //         insert cart;
        //    } else {
        //        cart = carts[0];
        //    }

            // Check if the book is already in the cart
            List<Cart_Item__c> existingItems = [
                SELECT Id, Quantity__c 
                FROM Cart_Item__c 
                WHERE Shopping_Cart__c = :cart.Id 
                AND Book__c = :bookId 
                LIMIT 1
            ];

            if (!existingItems.isEmpty()) {
                Cart_Item__c item = existingItems[0];
                item.Quantity__c += quantity;
                //item.Total_Price__c = item.Quantity__c * item.Book__r.Price__c;  // Update total price
                update item;
            } else {
                Book__c book = [SELECT Price__c FROM Book__c WHERE Id = :bookId LIMIT 1];
                Cart_Item__c newItem = new Cart_Item__c(
                    Book__c = bookId,
                    Quantity__c = quantity,
                    Shopping_Cart__c = cart.Id
                // Total_Price__c = book.Price__c * quantity  // Set total price
                );
                insert newItem;
            }

            return 'Book added to cart successfully.';
        
        
    }

    @AuraEnabled
    public static String checkout() {
        List<Shopping_Cart__c> carts = [
            SELECT Id, Cart_Total__c 
            FROM Shopping_Cart__c 
            WHERE Account__c = :accountId
            AND Cart_Status__c = 'Active' 
            LIMIT 1
        ];

        if (carts.isEmpty()) {
            throw new AuraHandledException('Your cart is empty.');
        }

        Shopping_Cart__c cart = carts[0];
        cart.Cart_Status__c = 'Converted';
        update cart;

        Order__c newOrder = new Order__c(
            Account__c = accountId,
            Contact__c = contactId,
            Shopping_Cart__c = cart.Id,
            Order_Date__c = System.now(),
            Total_Amount__c = cart.Cart_Total__c,
            Status__c = 'Pending'
           
        );
        insert newOrder;

        // Create a new empty shopping cart
        Shopping_Cart__c newCart = new Shopping_Cart__c(
            Account__c = accountId,
            Contact__c = contactId,
            Cart_Status__c = 'Active',
            Cart_Total__c = 0
        );
        insert newCart;

        return 'Order placed successfully!';
    }

    @AuraEnabled(cacheable=true)
    public static List<Cart_Item__c> getCartItems() {
        // Retrieve the current user's active shopping cart
        List<Shopping_Cart__c> carts = [SELECT Id FROM Shopping_Cart__c 
                                        WHERE Account__c = :accountId AND Contact__c = :contactId
                                        AND Cart_Status__c = 'Active' LIMIT 1];

        if (!carts.isEmpty()) {
            Id cartId = carts[0].Id;
            return [SELECT Id, Book__r.Name, Quantity__c, Book__r.Price__c, Total_Price__c 
                    FROM Cart_Item__c 
                    WHERE Shopping_Cart__c =:cartId ];//Shopping_Cart__c=:cartId
        }
        return new List<Cart_Item__c>();
    }

    @AuraEnabled(cacheable=true)
    public static Decimal getCartTotalPrice() {
        // Retrieve the current user's active shopping cart
        List<Shopping_Cart__c> carts = [SELECT Id FROM Shopping_Cart__c 
                                        WHERE Account__c = :accountId AND Contact__c = :contactId
                                        AND Cart_Status__c = 'Active' LIMIT 1];

        Decimal totalPrice = 0;
        if (!carts.isEmpty()) {
            Id cartId = carts[0].Id;
            List<Cart_Item__c> cartItems = [SELECT Total_Price__c 
                                            FROM Cart_Item__c 
                                            WHERE Shopping_Cart__c = :cartId];
            for (Cart_Item__c item : cartItems) {
                totalPrice += item.Total_Price__c;
            }
        }
        return totalPrice;
    } 


    @AuraEnabled
public static String removeItemFromCart(Id cartItemId) {
    try {
        Cart_Item__c item = [SELECT Id, Quantity__c FROM Cart_Item__c WHERE Id = :cartItemId LIMIT 1];
        
        if (item.Quantity__c > 1) {
            // Reduce quantity by 1
            item.Quantity__c -= 1;
            update item;
            return 'Quantity reduced by 1.';
        } else {
            // Delete item from cart
            delete item;
            return 'Item removed from cart.';
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error removing item: ' + e.getMessage());
    }
}



}
