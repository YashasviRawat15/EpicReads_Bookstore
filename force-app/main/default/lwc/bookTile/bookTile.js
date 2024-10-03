import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookTile extends LightningElement {
    @api bookImageUrl;  
    @api bookName;
    @api price;
    @api avgRating;
    @api reviewCount;
    @api bookId;
    @api contactId;
    @api accountId;
    

    quantity = 1;

    star1 = false;
    star2 = false;
    star3 = false;
    star4 = false;
    star5 = false;

    connectedCallback() {
        this.calculateStars();
    }

    increaseQuantity() {
        this.quantity += 1;
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity -= 1;
        }
    }

    handleBookClick() {
        const event = new CustomEvent('bookselect', {
            detail: { bookId: this.bookId }
        });
        this.dispatchEvent(event);
    }

    handleAddToCart() {
        const addToCartEvent = new CustomEvent('addtocart', {
            detail: { bookId: this.bookId, quantity: this.quantity }
        });
        this.dispatchEvent(addToCartEvent);
    }

    handleWishlist() {
        const addToWishlistEvent = new CustomEvent('addtowishlist', {
            detail: {
                bookId: this.bookId,
                contactId: '003NS00000Dj76r',
                accountId:'001NS00000WkMKr'
            }
        });

        this.dispatchEvent(addToWishlistEvent);
    }
    

    calculateStars() {
        if (this.avgRating >= 1) {
            this.star1 = true;
        }
        if (this.avgRating >= 2) {
            this.star2 = true;
        }
        if (this.avgRating >= 3) {
            this.star3 = true;
        }
        if (this.avgRating >= 4) {
            this.star4 = true;
        }
        if (this.avgRating === 5) {
            this.star5 = true;
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}

