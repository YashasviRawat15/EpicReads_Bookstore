import { LightningElement, api, wire } from 'lwc';
import getAuthorDetails from '@salesforce/apex/AuthorController.getAuthorDetails';

export default class AuthorDetail extends LightningElement {
    @api recordId;
    author = {};
    error;

    @wire(getAuthorDetails, { authorId: '$recordId' })
    wiredAuthor({ error, data }) {
        if (data) {
            this.author = {
                ...data.author,
                imageUrl: data.imageUrl || '',
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
}
