import { LightningElement, wire, track } from 'lwc';
import getCurrentUserAccount from '@salesforce/apex/AccountController.getCurrentUserAccount';

export default class AccountDetails extends LightningElement {
    @track accountName;
    @track contacts = [];
    @track selectedContact;
    selectedContactId;
    
    // Fetch the account and contacts related to the current user
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
}
