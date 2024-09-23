import { LightningElement, api,  track } from 'lwc';
import getContactDetails from '@salesforce/apex/AccountController.getContactDetails';
import checkout from '@salesforce/apex/CartController.checkout';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Payment extends LightningElement {



    @api isModalOpen = false;
    @api totalPrice;
    @api contactId;  // Pass the contactId dynamically from parent component
    @api accountId;

    @track fullName;
    @track email;
    @track phone;
    @track mailingStreet;
    @track mailingCity;
    @track mailingState;
    @track mailingPostalCode;
    @track mailingCountry;

    @track creditCardNumber = '';
    @track cvv = '';
    @track expDate = '';

    // Address Formatting
    get formattedAddress() {
        return `${this.mailingStreet}, ${this.mailingCity}, ${this.mailingState}, ${this.mailingPostalCode}, ${this.mailingCountry}`;
    }

    connectedCallback() {
        this.loadContactDetails();  // Fetch contact details when component is loaded
    }

    // Fetch Contact Details from Apex
    loadContactDetails() {
        getContactDetails({ contactId: this.contactId })
            .then(contact => {
                // Populate the contact fields
                this.fullName = contact.FirstName + ' ' + contact.LastName;
                this.email = contact.Email;
                this.phone = contact.Phone;
                this.mailingStreet = contact.MailingStreet;
                this.mailingCity = contact.MailingCity;
                this.mailingState = contact.MailingState;
                this.mailingPostalCode = contact.MailingPostalCode;
                this.mailingCountry = contact.MailingCountry;
            })
            .catch(error => {
                console.error('Error fetching contact details: ', error);
            });
    }

    // Close Modal
    closeModal() {
        this.isModalOpen = false;
    }

    // Confirm Payment
    confirmPayment() {
        // Perform payment validation and process

        checkout({
            accountId: this.accountId,
            contactId: this.contactId,
            // Add other payment related fields if necessary
        })
        .then(result => {
            this.showToast('Payment Successful', 'Your order has been placed.', 'success');
            this.closeModal();
            // Handle additional logic if necessary, such as refreshing cart or navigating
        })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }

}