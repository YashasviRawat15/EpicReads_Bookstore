import { LightningElement, track, wire } from 'lwc';
import getWishlistItems from '@salesforce/apex/WishlistController.getWishlistItems';

export default class Wishlist extends LightningElement {
    @track wishlistItems = [];
    @track error;

    @wire(getWishlistItems)
    wiredWishlistItems({ error, data }) {
        if (data) {
            this.wishlistItems = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.wishlistItems = [];
        }
    }

    handleAddToCart(event) {
        const itemId = event.target.dataset.id;
        console.log(`Adding item ${itemId} to cart`);
    }

    handleRemove(event) {
        const itemId = event.target.dataset.id;
        this.wishlistItems = this.wishlistItems.filter(item => item.id !== itemId);
    }
}
