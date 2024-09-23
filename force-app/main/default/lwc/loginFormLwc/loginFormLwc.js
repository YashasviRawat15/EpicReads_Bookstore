import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import COMPANY_LOGO from '@salesforce/resourceUrl/companyLogo';

export default class LoginFormLwc extends LightningElement {
    email = '';
    password = '';
    logoUrl = COMPANY_LOGO;

    handleChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    handleLogin() {
        // Use standard Salesforce community login functionality
        const fields = {
            username: this.email,
            password: this.password
        };

        this[NavigationMixin.Navigate]({
            type: 'comm__loginPage',
            attributes: {
                actionName: 'login'
            },
            state: fields
        });
    }
}
