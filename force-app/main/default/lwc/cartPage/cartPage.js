import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; 
import getCartItems from '@salesforce/apex/CartController.getCartItems';
import getCartTotalPrice from '@salesforce/apex/CartController.getCartTotalPrice';
import checkout from '@salesforce/apex/CartController.checkout';
import removeItemFromCart from '@salesforce/apex/CartController.removeItemFromCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class CartPage extends NavigationMixin (LightningElement) {
    @track cartItems = [];
    @track totalPrice = 0;
    @track accountId = '001NS00000WkMKr'; 
    @track contactId = '003NS00000Dj76r'; 
    @track isOrderModalOpen = false;  // Order confirmation modal
    wiredCartItems; 
    wiredCartTotal

    @wire(getCartItems)
wiredCartItems(value) {
    this.wiredCartItems = value; // Capture the response for refreshApex
    const { data, error } = value;
    if (data) {
        this.cartItems = data;
    } else if (error) {
        console.error('Error retrieving cart items: ', error);
    }
}

    // Wire the total price calculation
    @wire(getCartTotalPrice)
    wiredCartTotal(value) {
        this.wiredCartTotal = value; // Capture the response for refreshApex
        const { data, error } = value;
        if (data) {
            this.totalPrice = data;
        } else if (error) {
            console.error('Error calculating total price: ', error);
        }
    }

    handleCheckout() {
        this.isOrderModalOpen = true;
    }

    // Close the Order Confirmation Modal
    closeOrderModal() {
        this.isOrderModalOpen = false;
    }

    // Confirm the Order
   

        confirmOrder() {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/payment?totalAmount=${this.totalPrice}` // Redirect to payment page with the total amount
                }
            });
        

       
        
        /*checkout({ 
            accountId: '001NS00000WkMKr', //this.accountId
            contactId: '003NS00000Dj76r' //this.contactId
           // paymentMethod: this.paymentMethod 
        })
        .then(result => {
            this.showToast('Order Success', result, 'success');
            this.closeModal();
            return refreshApex(this.wiredCartItems);
        })
        .catch(error => {
            console.log('error in order' + error.body);
            this.showToast('Error placing order', error, 'error');
        }); */
    }


    removeItem(event) {
        const cartItemId = event.currentTarget.dataset.id; // Get the cart item Id from the clicked button
        removeItemFromCart({ cartItemId })
            .then(result => {
                this.showToast('Success', result, 'success');
                // Refresh cart data after removal or quantity update
                return Promise.all([
                    refreshApex(this.wiredCartItems),
                    refreshApex(this.wiredCartTotal) // Refresh total price
                ]);
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
