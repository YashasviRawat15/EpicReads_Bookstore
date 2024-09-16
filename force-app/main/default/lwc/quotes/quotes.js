import { LightningElement } from 'lwc';
import book1 from '@salesforce/resourceUrl/book1';
import book2 from '@salesforce/resourceUrl/book2';
import book3 from '@salesforce/resourceUrl/book3';

export default class Quotes extends LightningElement {
    bookImage1 = book1;
    bookImage2 = book2;
    bookImage3 = book3;
   
}