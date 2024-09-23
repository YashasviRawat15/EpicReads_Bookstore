import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import forgotPassword from '@salesforce/apex/RegisterControllerLwc.forgotPassword';
import COMPANY_LOGO from '@salesforce/resourceUrl/companyLogo';

export default class ForgotPasswordLwc extends LightningElement {
    email = '';
    logoUrl = COMPANY_LOGO;

    handleChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    handleForgotPassword() {
        forgotPassword({ email: this.email })
            .then(() => {
                this.showToast('Success', 'Password reset link sent!', 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
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
