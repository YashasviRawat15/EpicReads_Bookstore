import { LightningElement, track } from 'lwc';
import getAuthors from '@salesforce/apex/AuthorController.getAuthors';

export default class AuthorList extends LightningElement {
    @track authors = [];
    @track paginatedAuthors = []; 
    @track currentPage = 1;
    @track selectedAuthorId;
    @track isModalOpen = false;
    authorsPerPage = 10; 
    error;

    
    get totalPages() {
        return Math.ceil(this.authors.length / this.authorsPerPage);
    }

    
    get isFirstPage() {
        return this.currentPage === 1;
    }

   
    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    connectedCallback() {
        getAuthors()
            .then(result => {
                console.log('data13 ', result);
                this.authors = result.map(author => ({
                    ...author,
                    imageUrl: author.imageUrl
                }));
                console.log('author in details --> ' + JSON.stringify(this.authors));
                this.updatePaginatedAuthors();
            })
            .catch(error => {
                this.error = error;
            });
    }

  
    updatePaginatedAuthors() {
        const start = (this.currentPage - 1) * this.authorsPerPage;
        const end = this.currentPage * this.authorsPerPage;
        this.paginatedAuthors = this.authors.slice(start, end);
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
            this.updatePaginatedAuthors();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updatePaginatedAuthors();
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
