import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import createCharge from '@salesforce/apex/StripePaymentController.createCharge';
import STRIPE_JS from '@salesforce/resourceUrl/StripeJS';

export default class StripePayment extends LightningElement {
    @track cardName;
    stripe;
    cardElement;
    cardErrors;

    renderedCallback() {
        if (this.stripe) {
            return;
        }

        // Load the Stripe.js script dynamically
        Promise.all([loadScript(this, 'https://js.stripe.com/v3/')])
            .then(() => {
                this.initializeStripe();
            })
            .catch(error => {
                console.error('Error loading StripeJS:', error);
            });
    }

    initializeStripe() {
        // Initialize Stripe with your publishable key
        this.stripe = Stripe('pk_test_51Q0FTzJi20YIDM4Q9rJr9XTOvSMcu7BcbK3xko6qwsOp8EGaXiKGKH6mNg6QhzOZqgRB8ftpTa5c959cB8qCk3Ec00M4ABP271'); 
        const elements = this.stripe.elements();
        this.cardElement = elements.create('card');
        this.cardElement.mount(this.template.querySelector('#card-element'));

        // Handle real-time validation errors from the card element
        this.cardElement.on('change', event => {
            if (event.error) {
                this.cardErrors = event.error.message;
            } else {
                this.cardErrors = '';
            }
        });
    }

    handleInputChange(event) {
        this.cardName = event.target.value;
    }

    handleSubmit() {
        // Create a payment method and token using Stripe
        this.stripe.createToken(this.cardElement).then(result => {
            if (result.error) {
                this.cardErrors = result.error.message;
            } else {
                this.processPayment(result.token);
            }
        });
    }

    processPayment(token) {
        // Call Apex to create the charge on the server side
        createCharge({ tokenId: token.id, cardName: this.cardName })
            .then(result => {
                if (result.success) {
                    alert('Payment Successful!');
                } else {
                    alert('Payment Failed: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Error processing payment:', error);
            });
    }
}
