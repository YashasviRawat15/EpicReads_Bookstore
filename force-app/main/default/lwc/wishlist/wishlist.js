import { LightningElement, track, wire } from 'lwc';
import getWishlistItems from '@salesforce/apex/WishlistController.getWishlistItems';
import removeFromWishlist from '@salesforce/apex/WishlistController.removeFromWishlist';
import addToCart from '@salesforce/apex/CartController.addToCart';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Wishlist extends LightningElement {
    @track wishlistItems = [];
    @track currentPage = 1;  // Track the current page
    itemsPerPage = 6;  // 6 records per page (3 rows * 2 columns)
    //totalPages = 0;  // Total number of pages
    wiredWishlistItemsResult;


    // Get the total number of pages based on the total orders and orders per page
    get totalPages() {
        return Math.ceil(this.wishlistItems.length / this.itemsPerPage);
    }

    // Check if current page is the first page
    get isFirstPage() {
        return this.currentPage === 1;
    }

    // Check if current page is the last page
    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    // Fetch the wishlist items using wire service
    @wire(getWishlistItems)
    wiredWishlistItems(result) {
        this.wiredWishlistItemsResult = result;
        const { data, error } = result;
        if (data) {
            this.wishlistItems = data;
            this.totalPages = Math.ceil(this.wishlistItems.length / this.itemsPerPage);  // Calculate total pages
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    // Compute paginated items based on the current page
    get paginatedWishlistItems() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.wishlistItems.slice(startIndex, endIndex);  // Return only the items for the current page
    }

    // Handle page navigation
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

    // Handle item removal
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

    // Handle add to cart
    handleAddToCart(event) {
        const itemId = event.currentTarget.dataset.id;
        const bookId = event.currentTarget.dataset.bookId;
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

    // Helper function to show toast messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}
