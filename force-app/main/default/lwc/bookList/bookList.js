import { LightningElement, wire, track } from 'lwc';
import getBooks from '@salesforce/apex/BookController.getBooks';
import getBooksByGenre from '@salesforce/apex/BookController.getBooksByGenre';
import getBooksByLanguage from '@salesforce/apex/BookController.getBooksByLanguage';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookList extends LightningElement {
    @track books = [];
    @track selectedBookId;
    @track showBookDetail = false;
    @track detailTopPosition = '0px';
    error;

    get urlParams() {
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1]; // Last part of URL (genre/language/custom-page)
    }

    connectedCallback() {
        this.fetchBooks();
    }

    fetchBooks() {
        const param = this.urlParams;

        if (param === 'custom-page') {
            this.getAllBooks();
        } else if (this.isGenre(param)) {
            this.getBooksByGenre(param);
        } else if (this.isLanguage(param)) {
            this.getBooksByLanguage(param);
        }
    }

    isGenre(param) {
        const genres = [
            'academic-and-educational', 'business-and-economics', 'children',
            'fiction', 'non-fiction', 'religious-and-spiritual'
        ];
        return genres.includes(param.toLowerCase());
    }

    isLanguage(param) {
        const languages = ['english', 'hindi', 'other-languages'];
        return languages.includes(param.toLowerCase());
    }

    getAllBooks() {
        getBooks()
            .then(data => {
                this.books = data.map(book => ({
                    ...book,
                    imageUrl: book.imageUrl
                }));
            })
            .catch(error => {
                this.error = error;
            });
    }

    getBooksByGenre(genre) {
        getBooksByGenre({ genre })
            .then(data => {
                this.books = data.map(book => ({
                    ...book,
                    imageUrl: book.imageUrl
                }));
            })
            .catch(error => {
                this.error = error;
            });
    }

    getBooksByLanguage(language) {
        getBooksByLanguage({ language })
            .then(data => {
                this.books = data.map(book => ({
                    ...book,
                    imageUrl: book.imageUrl
                }));
            })
            .catch(error => {
                this.error = error;
            });
    }

    handleBookSelect(event) {
        const bookTile = event.currentTarget;
        const rect = bookTile.getBoundingClientRect();
        const scrollTop = window.scrollY;
        this.detailTopPosition = `${rect.top + scrollTop}px`;

        this.selectedBookId = event.detail.bookId;
        this.showBookDetail = true;

        this.template.host.dataset.showBookDetail = true;
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
        this.template.host.dataset.showBookDetail = false;
    }

    get isBookListVisible() {
        return !this.showBookDetail;
    }

    get isBookDetailVisible() {
        return this.showBookDetail;
    }
}
