import ADragValueInteraction from "../ADragValueInteraction";

export default class AIDragToMoveAnchorPoint extends ADragValueInteraction{
    getValueFunction(){
        return this.controller.getModel().getWorldPosition();
    }

    setValueFunction(value){
        this.controller.getModel().setWorldPosition(value, false);
        this.controller.getModel().updateMatrixProperties();
    }
}




