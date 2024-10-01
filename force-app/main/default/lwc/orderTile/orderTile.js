import { LightningElement, wire, track } from 'lwc';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getCartItemsByShoppingCart from '@salesforce/apex/OrderController.getCartItemsByShoppingCart';
import staticResourceURL from '@salesforce/resourceUrl/OrderImage';

export default class OrderTile extends LightningElement {
    @track orders = [];
    @track paginatedOrders = []; // Paginated subset of orders
    @track currentPage = 1;
    @track cartItems = [];
    @track totalOrderValue = 0;
    @track error;
    @track isModalOpen = false;
    orderImage = staticResourceURL;
    ordersPerPage = 9; // Number of orders to display per page

    // Get the total number of pages based on the total orders and orders per page
    get totalPages() {
        return Math.ceil(this.orders.length / this.ordersPerPage);
    }

    // Check if current page is the first page
    get isFirstPage() {
        return this.currentPage === 1;
    }

    // Check if current page is the last page
    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    // Fetch the orders using the wire service
    @wire(getOrders)
    wiredOrders({ error, data }) {
        if (data) {
            this.orders = data;
            this.updatePaginatedOrders();
        } else if (error) {
            this.error = error;
        }
    }

    // Pagination methods
    updatePaginatedOrders() {
        const start = (this.currentPage - 1) * this.ordersPerPage;
        const end = this.currentPage * this.ordersPerPage;
        this.paginatedOrders = this.orders.slice(start, end);
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
            this.updatePaginatedOrders();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updatePaginatedOrders();
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
