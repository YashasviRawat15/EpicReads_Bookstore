import { LightningElement, wire, track } from 'lwc';
import getBooks from '@salesforce/apex/BookController.getBooks';
import addToCart from '@salesforce/apex/CartController.addToCart';
import getBooksByGenre from '@salesforce/apex/BookController.getBooksByGenre';
import getBooksByLanguage from '@salesforce/apex/BookController.getBooksByLanguage';
import addToWishlist from '@salesforce/apex/WishlistController.addToWishlist';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookList extends LightningElement {
    @track books = [];
    @track paginatedBooks = []; // Paginated subset of books
    @track currentPage = 1;
    @track selectedBookId;
    @track showBookDetail = false;
    @track detailTopPosition = '0px';
    booksPerPage = 12; // Number of books to display per page (3 rows of 4 books)
    error;

    // Get the total number of pages based on the total books and books per page
    get totalPages() {
        return Math.ceil(this.books.length / this.booksPerPage);
    }

    // Check if current page is the first page
    get isFirstPage() {
        return this.currentPage === 1;
    }

    // Check if current page is the last page
    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

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
                console.log('Book data --> ' + JSON.stringify(data));
                this.books = data.map(book => ({
                    ...book,
                    imageUrl: book.imageUrl
                }));
                this.updatePaginatedBooks();
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
                this.updatePaginatedBooks();
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
                this.updatePaginatedBooks();
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

        console.log('Event detail --> ' + bookId);
        console.log('Event detail --> ' + quantity);

        addToCart({ bookId: bookId, quantity: quantity })
            .then(result => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: result,
                    variant: 'success',
                }));
                location.reload();
            })
            .catch(error => {
                console.log('Error adding to cart: ' + error.body.fieldErrors.Quantity__c[0].message);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error adding to cart',
                    message: error.body.fieldErrors.Quantity__c[0].message,
                    variant: 'error',
                }));
            });
    }

    handleAddToWishlist(event) {
        const { bookId, contactId, accountId } = event.detail;
        console.log('Add to wishlist' + bookId + ' ' + contactId + ' ' + accountId);
        addToWishlist({ bookId: bookId, contactId: contactId, accountId: accountId })
            .then(result => {
                this.showToast('Success', result, 'success');
                location.reload();
            })
            .catch(error => {
                this.showToast('Error', error, 'error');
            });
    }

    handleBackToList() {
        this.showBookDetail = false;
        this.selectedBookId = null;
        this.template.host.dataset.showBookDetail = false;
    }

    // Pagination methods
    updatePaginatedBooks() {
        const start = (this.currentPage - 1) * this.booksPerPage;
        const end = this.currentPage * this.booksPerPage;
        this.paginatedBooks = this.books.slice(start, end);
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
            this.updatePaginatedBooks();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updatePaginatedBooks();
        }
    }

    get isBookListVisible() {
        return !this.showBookDetail;
    }

    get isBookDetailVisible() {
        return this.showBookDetail;
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
