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

    handleClose() {
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }
}
