import { LightningElement, wire, track } from 'lwc';
import getCurrentUserAccount from '@salesforce/apex/AccountController.getCurrentUserAccount';
import updateContact from '@salesforce/apex/AccountController.updateContact'; // New method for updating contact
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class AccountDetails extends LightningElement {
    @track accountName;
    @track contacts = [];
    @track selectedContact;
    @track isModalOpen = false;

    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phoneNumber = '';
    @track mailingStreet = '';
    @track mailingCity = '';
    @track mailingState = '';
    @track mailingPostalCode = '';
    @track mailingCountry = '';

    @wire(getCurrentUserAccount)
    wiredAccount({ error, data }) {
        if (data) {
            //this.accountName = data.Name;
            //this.contacts = data.Contacts;
            this.selectedContact = data; // Automatically select the first contact
            //console.log('SELECTED CONTACT --> '+data.FirstName + ' ' + data.email);
            this.setContactDetails(this.selectedContact); // Set form values
        } else if (error) {
            console.error('Error fetching account details:', error);
        }
    }

    setContactDetails(contact) {


        console.log('First Name --> '+ contact.FirstName );
        console.log('Last Name --> '+ contact.LastName );
        this.firstName = contact.FirstName;
        this.lastName = contact.LastName;
        this.email = contact.Email;
        this.phoneNumber = contact.Phone;
        this.mailingStreet = contact.MailingStreet;
        this.mailingCity = contact.MailingCity;
        this.mailingState = contact.MailingState;
        this.mailingPostalCode = contact.MailingPostalCode;
        this.mailingCountry = contact.MailingCountry;
    }

    openEditContactForm() {
        this.isModalOpen = true;
        this.setContactDetails(this.selectedContact);
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    saveContact() {
        const updatedContact = {
            Id: this.selectedContact.Id,
            FirstName: this.firstName,
            LastName: this.lastName,
            Email: this.email,
            Phone: this.phoneNumber,
            MailingStreet: this.mailingStreet,
            MailingCity: this.mailingCity,
            MailingState: this.mailingState,
            MailingPostalCode: this.mailingPostalCode,
            MailingCountry: this.mailingCountry
        };

        updateContact({ contactData: updatedContact })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact updated successfully!',
                        variant: 'success',
                    })
                );
                this.closeModal();
                return refreshApex(this.wiredAccount); 
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating contact',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    get formattedAddress() {
        const contact = this.selectedContact;
        if (contact) {
            return `${contact.MailingStreet}, ${contact.MailingCity}, ${contact.MailingState}, ${contact.MailingPostalCode}, ${contact.MailingCountry}`;
        }
        return '';
    }
}

