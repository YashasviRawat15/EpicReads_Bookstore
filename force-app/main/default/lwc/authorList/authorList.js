import { LightningElement, track, wire } from 'lwc';
import getAuthors from '@salesforce/apex/AuthorController.getAuthors';

export default class AuthorList extends LightningElement {
    @track authors = [];
    @track selectedAuthorId;
    @track isModalOpen = false;
    error;

    // @wire(getAuthors)
    // wiredAuthors({ error, data }) {
    //     if (data) {
    //         console.log('data13 ',data);
    //         this.authors = data.map(author => ({
    //             ...author,
    //             imageUrl: author.imageUrl
    //         }));
    //         console.log('author in details --> ' + JSON.stringify(this.authors));
    //     } else if (error) {
    //         this.error = error;
    //     }
    // }

    connectedCallback(){
        getAuthors()

        .then(result => {
            console.log('data13 ',result);
            this.authors = result.map(author => ({
                ...author,
                imageUrl: author.imageUrl
            }));
            console.log('author in details --> ' + JSON.stringify(this.authors));
           // console.log(‘Contact added with ID’, result.Id);

        })

        .catch(error => {

           // console.error(‘Error adding contact’, error);

        });
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
