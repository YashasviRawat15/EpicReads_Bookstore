import { LightningElement, wire, track } from 'lwc';
import getBooks from '@salesforce/apex/BookController.getBooks';
import addToCart from '@salesforce/apex/BookController.addToCart';
import addToWishlist from '@salesforce/apex/BookController.addToWishlist';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookList extends LightningElement {
    @track books = [];
    @track selectedBookId; // Track the selected book ID
    @track showBookDetail = false;
    error;

    @wire(getBooks)
    wiredBooks({ error, data }) {
        if (data) {
            this.books = data.map(book => ({
                ...book,
                imageUrl: book.imageUrl// Image URL from Apex
            }));
        } else if (error) {
            this.error = error;
        }
    }

    handleBookSelect(event) {
        this.selectedBookId = event.detail.bookId; // Capture the selected book ID
        this.showBookDetail = true; // Show the BookDetail component
    }

    handleAddToCart(event) {
        const { bookId, quantity } = event.detail;

        addToCart({ bookId, quantity })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: result,
                    variant: 'success',
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error adding to cart',
                    message: error.body.message,
                    variant: 'error',
                }));
            });
    }

    handleAddToWishlist(event) {
        const { bookId } = event.detail;

        addToWishlist({ bookId })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: result,
                    variant: 'success',
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error adding to wishlist',
                    message: error.body.message,
                    variant: 'error',
                }));
            });
    }

    handleBackToList() {
        this.showBookDetail = false;
        this.selectedBookId = null;
    }

    get isBookListVisible() {
        return !this.showBookDetail; // If the book detail is not shown, display the book list
    }

    get isBookDetailVisible() {
        return this.showBookDetail;
    }
}
