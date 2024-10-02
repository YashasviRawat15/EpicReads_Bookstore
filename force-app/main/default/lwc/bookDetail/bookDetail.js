// import { LightningElement, api, wire, track } from 'lwc';
// import getBookDetails from '@salesforce/apex/BookController.getBookDetails';
// import getBookReviews from '@salesforce/apex/BookController.getBookReviews';
// import submitReview from '@salesforce/apex/BookController.submitReview';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import { refreshApex } from '@salesforce/apex';

// export default class BookDetail extends LightningElement {
//     @api recordId;
//     book = {};
//     @track reviews = [];
//     @track newRating;
//     @track newReviewText;
//     ratingOptions = [
//         { label: 'Excellent', value: '5' },
//         { label: 'Good', value: '4' },
//         { label: 'Average', value: '3' },
//         { label: 'Fair', value: '2' },
//         { label: 'Poor', value: '1' }
//     ];

//     error;

//     @wire(getBookDetails, { bookId: '$recordId' })
//     wiredBook({ error, data }) {
//         if (data) {

//             console.log('Book data:', data);
//             this.book = {
//                 ...data.book,
                
//                 imageUrl: data.imageUrl || '',
//                 author: data.author,
//                 publisher: data.publisher,
//                 category: data.category,
//                 subCategory: data.subCategory
               
                
//             };
            
//         } else if (error) {
//             this.error = error;
//             console.error('Error:', error);
//         }
//     }


//     @wire(getBookReviews, { bookId: '$recordId' })
//     wiredReviews({ error, data }) {
//         if (data) {
//             this.reviews = data;
//         } else if (error) {
//             this.error = error;
//         }
//     }


//     handleBackToList() {
//         const backEvent = new CustomEvent('backtolist');
//         this.dispatchEvent(backEvent);
//     }

//     handleAddToCart() {
//         const addToCartEvent = new CustomEvent('addtocart', {
//             detail: { bookId: this.recordId, quantity: 1     }
//         });
//         this.dispatchEvent(addToCartEvent);
//     }

//     handleWishlist() {
//         const addToWishlistEvent = new CustomEvent('addtowishlist', {
//             detail: {
//                 bookId: this.recordId,
//                 contactId: '003NS00000Dj76r',
//                 accountId:'001NS00000WkMKr'
//             }
//         });

//         // Dispatch the event to the parent component
//         this.dispatchEvent(addToWishlistEvent);
//     }

//     handleRatingChange(event) {
//         this.newRating = event.target.value;
//     }

//     handleReviewTextChange(event) {
//         this.newReviewText = event.target.value;
//     }

//     handleReviewSubmit() {
//         submitReview({ bookId: this.recordId, rating: this.newRating, reviewText: this.newReviewText })
//             .then(() => {
                
//                 this.dispatchEvent(new ShowToastEvent({
//                     title: 'Success',
//                     message: 'Your review has been submitted.',
//                     variant: 'success',
//                 }));
//                 this.resetForm();
//                 //return Promise([refreshApex(this.wiredReviews)]);
//             })
//             .catch(error => {
//                 this.dispatchEvent(new ShowToastEvent({
//                     title: 'Error',
//                     message: error.body.message,
//                     variant: 'error', 
//                 }));
//             });
//     }

//     resetForm() {
//         this.newReviewText = '';
//         this.newRating = '';
       
//     }
// }




import { LightningElement, api, wire, track } from 'lwc';
import getBookDetails from '@salesforce/apex/BookController.getBookDetails';
import getBookReviews from '@salesforce/apex/BookController.getBookReviews';
import submitReview from '@salesforce/apex/BookController.submitReview';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class BookDetail extends LightningElement {
    @api recordId; // The ID of the book record
    book = {}; // Object to hold book details
    @track reviews = []; // Array to hold book reviews
    @track newRating; // Track new rating for the review
    @track newReviewText; // Track new review text
    ratingOptions = [
        { label: 'Excellent', value: '5' },
        { label: 'Good', value: '4' },
        { label: 'Average', value: '3' },
        { label: 'Fair', value: '2' },
        { label: 'Poor', value: '1' }
    ];

    error; // Error handling variable
    wiredReviewsResult; // Store the wired result for refreshing reviews

    // Fetch book details based on recordId
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

    // Fetch book reviews based on recordId
    @wire(getBookReviews, { bookId: '$recordId' })
    wiredReviews(result) {
        this.wiredReviewsResult = result; // Capture the wire response for refresh
        const { error, data } = result;
        if (data) {
            this.reviews = data; // Assign the fetched reviews to the reviews array
        } else if (error) {
            this.error = error; // Handle error
        }
    }

    // Event handler to go back to the list
    handleBackToList() {
        const backEvent = new CustomEvent('backtolist');
        this.dispatchEvent(backEvent);
    }

    // Event handler to add the book to the cart
    handleAddToCart() {
        const addToCartEvent = new CustomEvent('addtocart', {
            detail: { bookId: this.recordId, quantity: 1 }
        });
        this.dispatchEvent(addToCartEvent);
    }

    // Event handler to add the book to the wishlist
    handleWishlist() {
        const addToWishlistEvent = new CustomEvent('addtowishlist', {
            detail: {
                bookId: this.recordId,
                contactId: '003NS00000Dj76r', // Replace with dynamic contact ID
                accountId: '001NS00000WkMKr'  // Replace with dynamic account ID
            }
        });
        this.dispatchEvent(addToWishlistEvent);
    }

    // Handle changes in rating selection
    handleRatingChange(event) {
        this.newRating = event.target.value;
    }

    // Handle changes in review text input
    handleReviewTextChange(event) {
        this.newReviewText = event.target.value;
    }

    // Handle review submission
    handleReviewSubmit() {
        submitReview({ bookId: this.recordId, rating: this.newRating, reviewText: this.newReviewText })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Your review has been submitted.',
                    variant: 'success',
                }));
                this.resetForm(); // Reset form fields
                return refreshApex(this.wiredReviewsResult); // Refresh the reviews after submission
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error',
                }));
            });
    }

    // Reset the review form
    resetForm() {
        this.newReviewText = '';
        this.newRating = '';
    }
}
