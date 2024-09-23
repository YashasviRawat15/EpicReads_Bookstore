import { LightningElement, track, wire, api } from 'lwc';
import getWishlistItems from '@salesforce/apex/WishlistController.getWishlistItems';
import removeFromWishlist from '@salesforce/apex/WishlistController.removeFromWishlist';
import addToCart from '@salesforce/apex/CartController.addToCart';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Wishlist extends LightningElement {
    
    @track wishlistItems = [];
    wiredWishlistItemsResult;

    @wire(getWishlistItems)
    wiredWishlistItems(result) {
        this.wiredWishlistItemsResult = result;
        const { data, error } = result;
        if (data) {
            this.wishlistItems = data;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleRemove(event) {
        const itemId = event.currentTarget.dataset.id;  // Retrieve item ID from button

        removeFromWishlist({ wishlistItemId: itemId })
            .then(result => {
                this.showToast('Success', result, 'success');
                // Refresh wishlist items after removal
                return refreshApex(this.wiredWishlistItemsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleAddToCart(event) {
        const itemId = event.currentTarget.dataset.id;  // Retrieve the wishlist item ID
        const bookId = event.currentTarget.dataset.bookId;  // Retrieve the book ID
        console.log('Book ID:', bookId);  // Debugging to check the bookId
    
        if (!bookId) {
            this.showToast('Error', 'Book ID is not defined.', 'error');
            return;
        }
    
        addToCart({ bookId: bookId, quantity: 1 })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: result,
                    variant: 'success',
                }));
    
                // Optionally, remove the item from wishlist after adding to cart
                return removeFromWishlist({ wishlistItemId: itemId });
            })
            .then(() => {
                return refreshApex(this.wiredWishlistItemsResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error',
                }));
            });
    }
    



    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }


   

    /*handleRemove(event) {
        const itemId = event.target.dataset.id;
        this.wishlistItems = this.wishlistItems.filter(item => item.id !== itemId);
    }*/
}
