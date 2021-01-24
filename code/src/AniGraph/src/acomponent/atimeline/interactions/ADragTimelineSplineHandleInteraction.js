import ADragValueInteraction from "../../../amvc/interactions/ADragValueInteraction";
import ADragInteraction from "../../../amvc/interactions/ADragInteraction";

export default class ADragTimelineSplineHandleInteraction extends ADragValueInteraction{
    static Create(args){
        const interaction = super.Create(args);
        interaction.keyframeElement = (args && args.keyframeElement!==undefined)? args.keyframeElement : undefined;
        // interaction.handleType = (args && args.handleType!==undefined)? args.handleType : undefined;
        interaction.onSetPosition = (args && args.onSetPosition!==undefined)? args.onSetPosition : undefined;
        console.assert(interaction.onSetPosition, {msg:"must include onSetPosition for handle drag interaction"});
        return interaction;
    }

    // To set the anchor point in world coordinates
    getValueFunction(){
        return this.element.position;
    }

    setValueFunction(value){
        var newval = value.dup();
        var timerange = this.keyframeElement.getHandleCanvasXBounds();
        if(newval.x<timerange[0]){
            newval.x = timerange[0];
        }
        if(newval.x>timerange[1]){
            newval.x = timerange[1];
        }

        this.element.setPosition(newval);
        this.onSetPosition(newval);
        this.controller.getComponent().getGraphicsContext().update();
    }
}