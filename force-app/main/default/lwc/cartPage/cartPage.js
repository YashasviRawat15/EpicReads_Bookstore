import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; 
import getCartItems from '@salesforce/apex/CartController.getCartItems';
import getCartTotalPrice from '@salesforce/apex/CartController.getCartTotalPrice';
import removeItemFromCart from '@salesforce/apex/CartController.removeItemFromCart';
import addItemToCart from '@salesforce/apex/CartController.addItemToCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class CartPage extends NavigationMixin(LightningElement) {
    @track cartItems = [];
    @track totalPrice = 0;
    @track isOrderModalOpen = false;
    
    wiredCartItems; 
    wiredCartTotal;

    
    connectedCallback() {
        this.refreshData();
    }

    
    @wire(getCartItems)
    wiredCartItems(value) {
        this.wiredCartItems = value; 
        const { data, error } = value;
        if (data) {
            this.cartItems = data;
        } else if (error) {
            console.error('Error retrieving cart items: ', error);
        }
    }

    
    @wire(getCartTotalPrice)
    wiredCartTotal(value) {
        this.wiredCartTotal = value; 
        const { data, error } = value;
        if (data) {
            this.totalPrice = data;
        } else if (error) {
            console.error('Error calculating total price: ', error);
        }
    }

    
    refreshData() {
        return Promise.all([
            refreshApex(this.wiredCartItems),
            refreshApex(this.wiredCartTotal)
        ]);
    }

    handleCheckout() {
        this.isOrderModalOpen = true;
    }

    closeOrderModal() {
        this.isOrderModalOpen = false;
    }

    confirmOrder() {
       
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/payment?totalAmount=${this.totalPrice}`
            }
        });
    }

    removeItem(event) {
        const cartItemId = event.currentTarget.dataset.id; 
        removeItemFromCart({ cartItemId })
            .then(result => {
                this.showToast('Success', result, 'success');
                
                return this.refreshData();
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    addItem(event){
        const cartItemId = event.currentTarget.dataset.id; 
        addItemToCart({ cartItemId })
        .then(result => {
            this.showToast('Success', result, 'success');
            
            return this.refreshData();
        })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        });

    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}
