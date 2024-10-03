import { LightningElement, api, wire, track } from 'lwc';
import getBookDetails from '@salesforce/apex/BookController.getBookDetails';
import getBookReviews from '@salesforce/apex/BookController.getBookReviews';
import submitReview from '@salesforce/apex/BookController.submitReview';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class BookDetail extends LightningElement {
    @api recordId; 
    book = {}; 
    @track reviews = []; 
    @track newRating; 
    @track newReviewText; 
    ratingOptions = [
        { label: 'Excellent', value: '5' },
        { label: 'Good', value: '4' },
        { label: 'Average', value: '3' },
        { label: 'Fair', value: '2' },
        { label: 'Poor', value: '1' }
    ];

    error; 
    wiredReviewsResult; 

  
    @wire(getBookDetails, { bookId: '$recordId' })
    wiredBook({ error, data }) {
        if (data) {
            console.log('Book data:', data);
            this.book = {
                ...data.book,
                imageUrl: data.imageUrl || '',
                author: data.author,
                publisher: data.publisher,
                category: data.category,
                subCategory: data.subCategory
            };
        } else if (error) {
            this.error = error;
            console.error('Error:', error);
        }
    }

    @wire(getBookReviews, { bookId: '$recordId' })
    wiredReviews(result) {
        this.wiredReviewsResult = result; 
        const { error, data } = result;
        if (data) {
            this.reviews = data; 
        } else if (error) {
            this.error = error; 
        }
    }

 
    handleBackToList() {
        const backEvent = new CustomEvent('backtolist');
        this.dispatchEvent(backEvent);
    }


    handleAddToCart() {
        const addToCartEvent = new CustomEvent('addtocart', {
            detail: { bookId: this.recordId, quantity: 1 }
        });
        this.dispatchEvent(addToCartEvent);
    }

 
    handleWishlist() {
        const addToWishlistEvent = new CustomEvent('addtowishlist', {
            detail: {
                bookId: this.recordId,
                contactId: '003NS00000Dj76r', 
                accountId: '001NS00000WkMKr'  
            }
        });
        this.dispatchEvent(addToWishlistEvent);
    }

    handleRatingChange(event) {
        this.newRating = event.target.value;
    }

  
    handleReviewTextChange(event) {
        this.newReviewText = event.target.value;
    }

  
    handleReviewSubmit() {
        submitReview({ bookId: this.recordId, rating: this.newRating, reviewText: this.newReviewText })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Your review has been submitted.',
                    variant: 'success',
                }));
                this.resetForm(); 
                return refreshApex(this.wiredReviewsResult); 
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error',
                }));
            });
    }

    resetForm() {
        this.newReviewText = '';
        this.newRating = '';
    }
}
