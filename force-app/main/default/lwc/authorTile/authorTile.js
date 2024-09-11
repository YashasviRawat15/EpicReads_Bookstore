import { LightningElement, api } from 'lwc';

export default class AuthorTile extends LightningElement {
    @api authorImageUrl;
    @api authorName;
    @api biography;
    @api nationality;
    @api authorId;
    

    handleAuthorClick() {
        const event = new CustomEvent('authorselect', {
            detail: { authorId: this.authorId }
        });
        this.dispatchEvent(event);
    }

    
}