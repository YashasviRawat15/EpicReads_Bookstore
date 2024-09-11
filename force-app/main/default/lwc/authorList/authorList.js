import { LightningElement, track, wire } from 'lwc';
import getAuthors from '@salesforce/apex/AuthorController.getAuthors';

export default class AuthorList extends LightningElement {
    @track authors = [];
    @track selectedAuthorId;
    @track isModalOpen = false;
    error;

    @wire(getAuthors)
    wiredAuthors({ error, data }) {
        if (data) {
            this.authors = data.map(author => ({
                ...author,
                imageUrl: author.imageUrl
            }));
        } else if (error) {
            this.error = error;
        }
    }

    handleAuthorSelect(event) {
        this.selectedAuthorId = event.detail.authorId;
        this.isModalOpen = true;
    }

    handleCloseModal() {
        this.isModalOpen = false;
        this.selectedAuthorId = null;
    }
}
