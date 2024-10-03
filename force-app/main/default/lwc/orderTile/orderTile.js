import { LightningElement, wire, track } from 'lwc';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getCartItemsByShoppingCart from '@salesforce/apex/OrderController.getCartItemsByShoppingCart';
import staticResourceURL from '@salesforce/resourceUrl/OrderImage';

export default class OrderTile extends LightningElement {
    @track orders = [];
    @track paginatedOrders = [];
    @track currentPage = 1;
    @track cartItems = [];
    @track totalOrderValue = 0;
    @track error;
    @track isModalOpen = false;
    orderImage = staticResourceURL;
    ordersPerPage = 9;

    get totalPages() {
        return Math.ceil(this.orders.length / this.ordersPerPage);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    @wire(getOrders)
    wiredOrders({ error, data }) {
        if (data) {
            this.orders = data;
            this.updatePaginatedOrders();
        } else if (error) {
            this.error = error;
        }
    }

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

    handleViewDetails(event) {
        const shoppingCartId = event.target.dataset.id;
        this.fetchCartItems(shoppingCartId);
    }

    fetchCartItems(shoppingCartId) {
        getCartItemsByShoppingCart({ shoppingCartId })
            .then(result => {
                this.cartItems = result;
                this.totalOrderValue = result.reduce((sum, item) => sum + item.Total_Price__c, 0);
                this.isModalOpen = true;
            })
            .catch(error => {
                this.error = error;
            });
    }

    closeModal() {
        this.isModalOpen = false;
    }
}
