import { api, LightningElement } from 'lwc';

export default class CallBarLwc extends LightningElement {
    @api cameraIsActivate;
    @api microIsActivate;
    @api recordIsActivate;
    @api hasConversation;

    /**
     * Handle toggle the action of micro
     * @param {*} e 
     */
    handleToggleMicroAction(e) {

        console.log("handleToggleMicroAction in callBar");
        
        const handletogglemicroevent = new CustomEvent("handletogglemicroevent", {
            detail: e.target.value,
            bubbles: true,
            composed: true,
        })

        console.log("Click micro icon !");
        this.dispatchEvent(handletogglemicroevent);
    }

    /**
     * Handle toggle the action of camera
     * @param {*} e 
     */
    handleToggleCameraAction(e) {

        console.log("handleToggleCameraAction in callBar");

        const handletogglecameraevent = new CustomEvent("handletogglecameraevent", {
            detail: e.target.value,
            bubbles: true,
            composed: true,
        })

        console.log("Click camera icon !");
        this.dispatchEvent(handletogglecameraevent);
    }

    /**
     * Handle toggle screen
     * @param {*} e 
     */
    handleToggleScreenAction(e) {

        console.log("handleToggleScreenAction in callBar");

        const handletogglescreenevent = new CustomEvent("handletogglescreenevent", {
            detail: e.target.value,
            bubbles: true,
            composed: true,
        })

        console.log("Click screen icon !");
        this.dispatchEvent(handletogglescreenevent);
    }

    /**
     * Handle toggle screen
     * @param {*} e 
     */
    handleToggleRecordAction(e) {

        console.log("handleToggleRecordAction in callBar");

        const handletogglerecordevent = new CustomEvent("handletogglerecordevent", {
            detail: e.target.value,
            bubbles: true,
            composed: true,
        })

        console.log("Click record icon !");
        this.dispatchEvent(handletogglerecordevent);
    }
}