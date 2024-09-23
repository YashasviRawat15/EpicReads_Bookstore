import { LightningElement, wire,api, track } from 'lwc';
import PayPal from '@salesforce/resourceUrl/PayPal';
import Visa from '@salesforce/resourceUrl/Visa';
import MasterCard from '@salesforce/resourceUrl/MasterCard';
import AmericanExpress from '@salesforce/resourceUrl/AmericanExpress';
import getContactDetails from '@salesforce/apex/AccountController.getContactDetails';


export default class PaymentForm extends LightningElement {
    @track cardholderName = '';
    @track cardNumber = '';
    @track expiryDate = '';
    @track cvv = '';
    @api contactId = '003NS00000Dj76r';  
    contactDetails;  
    error;  
    totalAmount = 0;
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

    PayPal = PayPal;
    Visa = Visa;
    MasterCard = MasterCard;
    AmericanExpress = AmericanExpress;

    connectedCallback() {
        console.log('Contact ID:', this.contactId);  // Check if the contact ID is passed
    }
    

    @wire(getContactDetails, { contactId: '$contactId' })
wiredContact({ error, data }) {
    if (data) {
        console.log('Contact Data:', JSON.stringify(data));
        this.contactDetails = data;
        this.error = undefined;
    } else if (error) {
        console.error('Error retrieving contact details:', JSON.stringify(error));
        this.error = 'Error retrieving contact details';
        this.contactDetails = undefined;
    }
}

    get contactInfo() {
        return {
            fullName: `${this.contactDetails?.FirstName || ''} ${this.contactDetails?.LastName || ''}`.trim(),
            lastName: this.contactDetails?.LastName || '',
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
        // Extract the totalAmount from the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.totalAmount = urlParams.get('totalAmount') || 0;  // Default to 0 if not found
    }

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    submitPayment() {
        // Handle payment submission logic here, like validating and processing the payment.
        console.log('Payment details submitted: ', this.cardholderName, this.cardNumber, this.expiryDate, this.cvv);
    }
}
