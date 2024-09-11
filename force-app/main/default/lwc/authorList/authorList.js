import { LightningElement, track, wire } from 'lwc';
import getAuthors from '@salesforce/apex/AuthorController.getAuthors';

export default class AuthorList extends LightningElement {
    @track author = [];
    @track selectedAuthorId; 
    @track showAuthorDetail = false;
    @track detailTopPosition = '0px';
    error;

    @wire(getAuthors)
    wiredAuthors({ error, data }) {
        if (data) {
            this.authors = data.map(author => ({
                ...author,
                imageUrl: author.imageUrl// Image URL from Apex
            }));
        } else if (error) {
            this.error = error;
        }
    }

    handleAuthorSelect(event) {
        
        const authorTile = event.currentTarget; 
        const rect = authorTile.getBoundingClientRect(); 
        const scrollTop = window.scrollY; 

        this.detailTopPosition = `${rect.top + scrollTop}px`; 

        this.selectedAuthorId = event.detail.AuthorId;
        this.showAuthorDetail = true;

        
        this.template.host.dataset.showAuthorDetail = true;
    }

    

    handleBackToList() {
        this.showAuthorDetail = false;
        this.selectedAuthorId = null;
        this.template.host.dataset.showAuthorDetail = false;
    }

    get isAuthorListVisible() {
        return !this.showAuthorDetail; 
    }

    get isAuthorDetailVisible() {
        return this.showAuthorDetail;
    }
}