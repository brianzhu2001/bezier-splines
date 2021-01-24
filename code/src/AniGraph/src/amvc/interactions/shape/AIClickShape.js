import AClickInteraction from "../AClickInteraction";


export default class AIClickShape extends AClickInteraction{
    clickCallback(event) {
        this.requestingController.clickShape({controller: this.controller});
    }
}