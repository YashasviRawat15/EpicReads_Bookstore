import { LightningElement, api, wire } from 'lwc';
import getBookDetails from '@salesforce/apex/BookController.getBookDetails';

export default class BookDetail extends LightningElement {
    @api recordId;
    book = {};
    error;

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

    handleBackToList() {
        const backEvent = new CustomEvent('backtolist');
        this.dispatchEvent(backEvent);
    }

    handleAddToCart() {
        const addToCartEvent = new CustomEvent('addtocart', {
            detail: { bookId: this.recordId, quantity: 1     }
        });
        this.dispatchEvent(addToCartEvent);
    }

    handleWishlist() {
        const addToWishlistEvent = new CustomEvent('addtowishlist', {
            detail: { bookId: this.recordId }
        });
        this.dispatchEvent(addToWishlistEvent);
    }
}
