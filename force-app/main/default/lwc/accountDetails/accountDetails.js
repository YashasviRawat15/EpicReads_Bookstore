import { LightningElement, wire, track } from 'lwc';
import getCurrentUserAccount from '@salesforce/apex/AccountController.getCurrentUserAccount';
import createNewContact from '@salesforce/apex/AccountController.createNewContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccountDetails extends LightningElement {
    @track accountName;
    @track contacts = [];
    @track selectedContact;
    selectedContactId;
    
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
            this.accountName = data.Name;
            this.contacts = data.Contacts.map(contact => ({
                label: contact.Name,
                value: contact.Id,
                contact: contact
            }));
        } else if (error) {
            console.error('Error fetching account details:', error);
        }
    }

    get contactOptions() {
        return this.contacts.map(contact => ({
            label: contact.contact.Name,
            value: contact.contact.Id
        }));
    }

    handleContactChange(event) {
        const contactId = event.detail.value;
        this.selectedContactId = contactId;
        this.selectedContact = this.contacts.find(contact => contact.value === contactId).contact;
    }

    get formattedAddress() {
        const contact = this.selectedContact;
        if (contact) {
            return `${contact.MailingStreet}, ${contact.MailingCity}, ${contact.MailingState}, ${contact.MailingPostalCode}, ${contact.MailingCountry}`;
        }
        return '';
    }

    
    get canAddContact() {
        return this.contacts.length < 5;
    }

    get hasMaxContacts() {
        return this.contacts.length >= 5;
    }

    openNewContactForm() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    saveNewContact() {
        if (!this.firstName || !this.lastName) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'First Name and Last Name are required.',
                    variant: 'error',
                })
            );
            return;
        }

        const newContact = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phoneNumber,
            mailingStreet: this.mailingStreet,
            mailingCity: this.mailingCity,
            mailingState: this.mailingState,
            mailingPostalCode: this.mailingPostalCode,
            mailingCountry: this.mailingCountry
        };

        createNewContact({ contactData: newContact, accountId: '001NS00000WkMKr' }) //Hardcoded as of now 
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'New contact created successfully!',
                        variant: 'success',
                    })
                );
                this.closeModal();
                //window.location.reload();
            })
            .catch(error => {
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating contact',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }
}
