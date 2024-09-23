import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import registerUser from '@salesforce/apex/RegisterControllerLwc.registerUser';
import { NavigationMixin } from 'lightning/navigation';
import COMPANY_LOGO from '@salesforce/resourceUrl/companyLogo';
 

export default class RegisterFormLwc extends LightningElement {
    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    password = '';
    confirmPassword = '';
    logoUrl = COMPANY_LOGO;

    handleChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    handleRegister() {
        if (this.password !== this.confirmPassword) {
            this.showToast('Error', 'Passwords do not match', 'error');
            return;
        }

        const fields = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            password: this.password
        };

        registerUser({ fields })
            .then(result => {
                this.showToast('Success', 'Registration Successful!', 'success');
                this.clearForm();
                // Redirect to login page after successful registration
                this[NavigationMixin.Navigate]({
                    type: 'comm__loginPage'
                });
            })
            .catch(error => {
                console.log(error);
                this.showToast('Error', error.body.message, 'error');
            });
    }

    clearForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.password = '';
        this.confirmPassword = '';
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(evt);
    }
}