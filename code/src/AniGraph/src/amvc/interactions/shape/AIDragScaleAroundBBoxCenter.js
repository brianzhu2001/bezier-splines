import ADragScaleAroundPointInteraction from "./ADragScaleAroundPointInteraction";


export default class AIDragScaleAroundBBoxCenter extends ADragScaleAroundPointInteraction{
    getTransformOriginInWorldCoordinates(){
        const corners = this.controller.getModel().objectSpaceCorners;
        return corners[0].plus(corners[2]).times(0.5);
    }
}