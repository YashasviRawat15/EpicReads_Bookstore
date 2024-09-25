import { LightningElement, wire, api } from 'lwc';
import PayPal from '@salesforce/resourceUrl/PayPal';
import Visa from '@salesforce/resourceUrl/Visa';
import MasterCard from '@salesforce/resourceUrl/MasterCard';
import AmericanExpress from '@salesforce/resourceUrl/AmericanExpress';
import getContactDetails from '@salesforce/apex/AccountController.getContactDetails';
import createOrderWithPayment from '@salesforce/apex/OrderController.createOrderWithPayment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class PaymentForm extends LightningElement {
    @api contactId = '003NS00000Dj76r'; // Replace with actual contact ID
    @api accountId = '001NS00000WkMKr';
    contactDetails;
    @api error;
    @api totalAmount = 0;
    stripe;
    cardElement;
    paymentMethodId = ''; 
    nameOnCard='';
    cvv;
    expMonth;
    expYear;
    creditCardNumber;

    monthOptions = [
        { label: 'January', value: 'January' },
        { label: 'February', value: 'February' },
        { label: 'March', value: 'March' },
        { label: 'April', value: 'April' },
        { label: 'May', value: 'May' },
        { label: 'June', value: 'June' },
        { label: 'July', value: 'July' },
        { label: 'August', value: 'August' },
        { label: 'September', value: 'September' },
        { label: 'October', value: 'October' },
        { label: 'November', value: 'November' },
        { label: 'December', value: 'December' }
    ];

    // Static resources for payment logos
    PayPal = PayPal;
    Visa = Visa;
    MasterCard = MasterCard;
    AmericanExpress = AmericanExpress;

    // Load contact details from Apex
    @wire(getContactDetails, { contactId: '$contactId' })
    wiredContact({ error, data }) {
        if (data) {
            this.contactDetails = data;
            this.error = undefined;
        } else if (error) {
            this.error = 'Error retrieving contact details';
            this.contactDetails = undefined;
        }
    }

    get contactInfo() {
        return {
            fullName: `${this.contactDetails?.FirstName || ''} ${this.contactDetails?.LastName || ''}`.trim(),
            email: this.contactDetails?.Email || '',
            phone: this.contactDetails?.Phone || '',
            street: this.contactDetails?.MailingStreet || '',
            city: this.contactDetails?.MailingCity || '',
            state: this.contactDetails?.MailingState || '',
            postalCode: this.contactDetails?.MailingPostalCode || '',
            country: this.contactDetails?.MailingCountry || ''
        };
    }

    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        this.totalAmount = urlParams.get('totalAmount') || 0; // Default to 0 if not found

       
    }

    

    // Handle billing information changes
    handleInputChange(event) {
        const field = event.target.id || event.target.dataset.id;
        this.contactInfo[field] = event.target.value;

        const fieldName = event.target.name; // Get the name of the field
    
        // Dynamically store the value based on the input field name
        if (fieldName === 'nameOnCard') {
            this.nameOnCard = event.target.value;
        } else if (fieldName === 'creditCardNumber') {
            this.creditCardNumber = event.target.value;
        } else if (fieldName === 'expMonth') {
            this.expMonth = event.target.value;
        } else if (fieldName === 'expYear') {
            this.expYear = event.target.value;
        } else if (fieldName === 'cvv') {
            this.cvv = event.target.value;
        }
    }

    
    
    handlePayment() {
        // Validation: Check if any field is empty
        if (!this.nameOnCard || !this.creditCardNumber || !this.expMonth || !this.expYear || !this.cvv) {
            this.showToast('Error', 'Incomplete details. Please fill all fields.', 'error');
            return;
        }
    
        // Validation: Card number must be exactly 12 digits
        const cardNumberPattern = /^\d{12}$/;
        if (!cardNumberPattern.test(this.creditCardNumber)) {
            this.showToast('Error', 'Credit card number must be exactly 12 digits.', 'error');
            return;
        }
    
        // Validation: Expiration date must be in the future
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
    
        if (this.expYear < currentYear || (this.expYear == currentYear && this.expMonth < currentMonth)) {
            this.showToast('Error', 'Expiration date must be in the future.', 'error');
            return;
        }
    
        // Additional validation: Checking if totalAmount, contactId, and accountId are valid
        if (!this.contactId || !this.accountId || this.totalAmount <= 0) {
            this.showToast('Error', 'Missing payment details or invalid amount.', 'error');
            return;
        }
    
        // If all validations pass, proceed with payment
        createOrderWithPayment({
            contactId: this.contactId, 
            accountId: this.accountId, 
            amount: this.totalAmount
        })
        .then(result => {
            if (result === 'success') {
                this.showToast('Success', 'Order placed successfully!', 'success');
                // Redirect to the desired page after successful order
                window.location.href = '/s';
            } else {
                this.showToast('Error', 'There was an error placing the order.', 'error');
            }
        })
        .catch(error => {
            this.showToast('Error', 'An error occurred: ' + error.body.message, 'error');
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
