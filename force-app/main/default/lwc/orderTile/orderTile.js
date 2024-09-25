import { LightningElement, wire, track } from 'lwc';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getCartItemsByShoppingCart from '@salesforce/apex/OrderController.getCartItemsByShoppingCart';
import staticResourceURL from '@salesforce/resourceUrl/OrderImage';

export default class OrderTile extends LightningElement {
    @track orders = [];  // Initialize orders as an empty array
    @track cartItems = [];  // Initialize cart items as an empty array
    @track totalOrderValue = 0;  // Initialize total order value to 0
    @track error;
    @track isModalOpen = false;
    orderImage = staticResourceURL;

    // Fetch the orders using the wire service
    @wire(getOrders)  //'$recordId'
    wiredOrders({ error, data }) {
        if (data) {
            this.orders = data;  // Assign fetched data to orders
        } else if (error) {
            this.error = error;
        }
    }

    // Handle the view details button click
    handleViewDetails(event) {
        const shoppingCartId = event.target.dataset.id;
        this.fetchCartItems(shoppingCartId);
    }

    // Fetch cart items based on the shopping cart
    fetchCartItems(shoppingCartId) {
        getCartItemsByShoppingCart({ shoppingCartId })
            .then(result => {
                this.cartItems = result;
                // Calculate total order value
                this.totalOrderValue = result.reduce((sum, item) => sum + item.Total_Price__c, 0);
                this.isModalOpen = true;
            })
            .catch(error => {
                this.error = error;
            });
    }

    // Close the modal
    closeModal() {
        this.isModalOpen = false;
    }
}
