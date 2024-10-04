import { LightningElement, wire, api, track } from 'lwc';
import PayPal from '@salesforce/resourceUrl/PayPal';
import Visa from '@salesforce/resourceUrl/Visa';
import MasterCard from '@salesforce/resourceUrl/MasterCard';
import AmericanExpress from '@salesforce/resourceUrl/AmericanExpress';
import getContactDetails from '@salesforce/apex/AccountController.getContactDetails';
import createOrderWithPayment from '@salesforce/apex/OrderController.createOrderWithPayment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class PaymentForm extends LightningElement {
    @api contactId = '003NS00000Dj76r'; 
    @api accountId = '001NS00000WkMKr';
    contactDetails;
    @api error;
    @api totalAmount = 0;
    stripe;
    cardElement;
    paymentMethodId = ''; 
    nameOnCard='';
    cvv;
    @track expMonth;
    expYear;
    creditCardNumber;
    
    monthOptions = [
        { label: 'January', value:  'January'},
        { label: 'February', value: 'February' },
        { label: 'March', value: 'March' },
        { label: 'April', value: 'April' },
        { label: 'May', value: 'May' },
        { label: 'June', value: 'June' },
        { label: 'July', value: 'July' },
        { label: 'August', value: 'August' },
        { label: 'September', value: 'September' },
        { label: 'October', value: 'October' },
        { label: 'November', value:  'November' },
        { label: 'December', value: 'December' }
    ];

    
    PayPal = PayPal;
    Visa = Visa;
    MasterCard = MasterCard;
    AmericanExpress = AmericanExpress;

    
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
        this.totalAmount = urlParams.get('totalAmount') || 0;

       
    }

    expMonthToInt(expMonth){
        if(expMonth === 'January') return 1;
        else if (expMonth === 'February') return 2;
        else if (expMonth === 'March') return 3;
        else if (expMonth === 'April') return 4;
        else if (expMonth === 'May') return 5;
        else if (expMonth === 'June') return 6;
        else if (expMonth === 'July') return 7;
        else if (expMonth === 'August') return 8;
        else if (expMonth === 'September') return 9;
        else if (expMonth === 'October') return 10;
        else if (expMonth === 'November') return 11;
        else if (expMonth === 'December') return 12;
    }
    

    
    handleInputChange(event) {
        const field = event.target.id || event.target.dataset.id;
        this.contactInfo[field] = event.target.value;

        const fieldName = event.target.name; 
    
       
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
        
        if (!this.nameOnCard || !this.creditCardNumber || !this.expMonth || !this.expYear || !this.cvv) {
            this.showToast('Error', 'Incomplete details. Please fill all fields.', 'error');
            return;
        }
    
        
        const cardNumberPattern = /^\d{12}$/;
        if (!cardNumberPattern.test(this.creditCardNumber)) {
            this.showToast('Error', 'Credit card number must be exactly 12 digits.', 'error');
            return;
        }
    
       
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; 
    
        if (this.expYear < currentYear || (this.expYear == currentYear && this.expMonthToInt(this.expMonth) < currentMonth)) {
            this.showToast('Error', 'Expiration date must be in the future.', 'error');
            return;
        }
    
        
        if (!this.contactId || !this.accountId || this.totalAmount <= 0) {
            this.showToast('Error', 'Missing payment details or invalid amount.', 'error');
            return;
        }
    
        
        createOrderWithPayment({
            contactId: this.contactId, 
            accountId: this.accountId, 
            amount: this.totalAmount
        })
        .then(result => {
            if (result === 'success') {
                this.showToast('Success', 'Order placed successfully!', 'success');
                
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
