import { LightningElement, track, wire } from 'lwc';
import getAuthors from '@salesforce/apex/AuthorController.getAuthors';

export default class AuthorList extends LightningElement {
    @track authors = [];
    @track selectedAuthorId; 
    @track showAuthorDetail = false;
    @track error;

    @wire(getAuthors)
    wiredAuthors({ error, data }) {
        if (data) {
            this.authors = data.map(author => ({
                ...author,
                imageUrl: author.imageUrl // Image URL from Apex
            }));
        } else if (error) {
            this.error = error;
        }
    }

    handleAuthorSelect(event) {
        this.selectedAuthorId = event.detail.authorId;
        this.showAuthorDetail = true;
    }

    handleBackToList() {
        this.showAuthorDetail = false;
        this.selectedAuthorId = null;
    }

    get isAuthorListVisible() {
        return !this.showAuthorDetail; 
    }

    get isAuthorDetailVisible() {
        return this.showAuthorDetail;
    }
}
