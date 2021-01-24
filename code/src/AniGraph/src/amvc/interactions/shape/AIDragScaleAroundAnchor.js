import ADragScaleAroundPointInteraction from "./ADragScaleAroundPointInteraction";


export default class AIDragScaleAroundAnchor extends ADragScaleAroundPointInteraction{
    getTransformOriginInWorldCoordinates(){
        return this.controller.getModel().getWorldPosition();
    }

}
