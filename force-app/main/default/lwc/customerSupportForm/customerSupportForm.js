import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import CASE_REASON_FIELD from '@salesforce/schema/Case.Reason';
import CASE_OBJECT from '@salesforce/schema/Case';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import createCase from '@salesforce/apex/CaseController.createCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomerSupportForm extends LightningElement {
    @track caseReasons = [];
    @track selectedReason = '';
    @track email = '';
    @track subject = '';
    @track description = '';

    // Fetch Case Reason picklist values
    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    caseObjectInfo;

    @wire(getPicklistValues, { recordTypeId: '$caseObjectInfo.data.defaultRecordTypeId', fieldApiName: CASE_REASON_FIELD })
    wiredCaseReasonPicklist({ data, error }) {
        if (data) {
            this.caseReasons = data.values;
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }

    handleReasonChange(event) {
        this.selectedReason = event.detail.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleSubmit() {
        console.log("Inside Submit");

        // Validate required fields
        if (!this.selectedReason || !this.email || !this.subject || !this.description) {
            this.showToast('Error', 'All fields are required.', 'error');
            return; // Exit the method if validation fails
        }

        const caseDetails = {
            reason: this.selectedReason,
            email: this.email,
            subject: this.subject,
            description: this.description
        };

        console.log('Case Details --> ' + JSON.stringify(caseDetails));

        createCase({ caseDetails: caseDetails })
            .then(result => {
                console.log('Case created successfully:', result);
                this.showToast('Case Created Successfully', 'Our Customer Support Team will get back to you soon', 'success');
                this.resetForm(); 
            })
            .catch(error => {
                console.error('Error creating case:', JSON.stringify(error));
                this.showToast('Error Creating Case', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    resetForm() {
        this.selectedReason = '';
        this.email = '';
        this.subject = '';
        this.description = '';
    }
}
