import { LightningElement, track, wire } from 'lwc';
import getWishlistItems from '@salesforce/apex/WishlistController.getWishlistItems';
import removeFromWishlist from '@salesforce/apex/WishlistController.removeFromWishlist';
import addToCart from '@salesforce/apex/CartController.addToCart';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Wishlist extends LightningElement {
    @track wishlistItems = [];
    @track currentPage = 1;
    itemsPerPage = 6;
    wiredWishlistItemsResult;

    get totalPages() {
        return Math.ceil(this.wishlistItems.length / this.itemsPerPage);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

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

    get paginatedWishlistItems() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.wishlistItems.slice(startIndex, endIndex);
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
    }

    handleRemove(event) {
        const itemId = event.currentTarget.dataset.id;
        removeFromWishlist({ wishlistItemId: itemId })
            .then(result => {
                this.showToast('Success', result, 'success');
                return refreshApex(this.wiredWishlistItemsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleAddToCart(event) {
        const itemId = event.currentTarget.dataset.id;
        const bookId = event.currentTarget.dataset.bookId;
        if (!bookId) {
            this.showToast('Error', 'Book ID is not defined.', 'error');
            return;
        }
        addToCart({ bookId: bookId, quantity: 1 })
            .then(result => {
                this.showToast('Success', result, 'success');
                return removeFromWishlist({ wishlistItemId: itemId });
            })
            .then(() => {
                return refreshApex(this.wiredWishlistItemsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
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
}
