import {
    Matrix3x3,
    Vec2,
    Precision,
    ADragInteraction,
    ADragValueInteraction
} from "../../../../index"

// import ATransform2D from "../math/ATransform2D";
import Arm from "./Arm";

/**
 * In assignment 1, you implemented supplemental controllers to add user interactions to the graphics
 * of a view class. You may recall that a single controller could be responsible for activating
 * and deactivating multiple interactions (e.g., one interaction with the handle of a bounding box
 * and another with its anchor). Here we abstract the implementation of a single interaction into the
 * static Create(args) factory function so that it can be more easily reused in different controllers.
 */


function absThetaDiff(a,b){
    return (Math.min(Math.abs(a-b), Math.abs((b+2*Math.PI)-a)));
}

/**
 * Below you will implement interactions that work on models in a transformation hierarchy (scene graph)
 *
 * *****HINT: In this version of AniGraph, interactions are written slightly differently to how they were in A1. To see
 * an example of what the A1 interactions look like in this newer version, read through ReferenceA1InteractionImplementations.js
 * This will help you get a better sense of how you will want to approach writing the interactions for this A2.
 */
export default class A2JointIKInteraction extends ADragInteraction{
    /**
     * Creates a drag interaction for scaling the controller's model around a specified point
     * based on the value returned by getValue (in general, we assume these
     * represent the same value, but they need not necessarily).
     * Example args dictionary:
     * ``` javascript
     * args = {
     *     name: 'drag-position',
     *     element: myShape,
     *     controller: myController
     * }
     * ```
     * @param args
     * @returns {*}
     * @constructor
     */
    static Create(args){
        // Use the super class's Create function to instantiate the AInteraction subclass that we will return
        const interaction = super.Create(args);
        interaction.model = interaction.controller.getModel();
        interaction.parentModel = interaction.model.getParent();

        //define the drag start callback
        interaction.setDragStartCallback(event=>{
            if(!interaction.elementIsTarget(event)){return;}
            event.preventDefault();
            interaction.childArm = Arm(interaction.model, interaction.getEventPositionInContext(event));
            interaction.parentArm = interaction.parentModel? Arm(interaction.parentModel, interaction.model.getWorldPosition()): undefined;

        });

        //now define a drag move callback
        interaction.setDragMoveCallback(event=> {
            event.preventDefault();
            // First we transform our new cursor location to scale space.
            const newCursorScreenCoordinates = interaction.getEventPositionInContext(event);

            if(interaction.parentArm){
                const dist = newCursorScreenCoordinates.minus(interaction.parentArm.getAnchor()).L2();
                const clen = interaction.childArm.getLength();
                const plen = interaction.parentArm.getLength();
                if(dist>(clen+plen)||
                    (dist+Math.min(clen, plen))<Math.max(clen, plen)){
                    interaction.parentArm.rotateToWorldPoint(newCursorScreenCoordinates);
                }else{
                    const cosC = (plen*plen+dist*dist-clen*clen)/(2*plen*dist);
                    const aC = Math.acos(cosC);
                    const crb = interaction.parentArm.getRotationToWorldPoint(newCursorScreenCoordinates);
                    const r1 = crb+aC;
                    const r2 = crb-aC;
                    const crot = interaction.parentArm.model.getRotation();
                    const r1dif = absThetaDiff(r1,crot);
                    const r2dif = absThetaDiff(r2,crot);
                    var ruse = (r1dif<r2dif)? r1 : r2;
                    if(Math.abs(r1dif-r2dif)<Precision.tinyValue){
                        ruse = Math.random()>0.5? r1 : r2;
                    }
                    interaction.parentArm.setRotation(ruse);
                }
            }
            interaction.childArm.rotateToWorldPoint(newCursorScreenCoordinates);
        });
        //we can optionally define a drag end callback
        interaction.setDragEndCallback(event=>{
            event.preventDefault();
        });

        //Finally, return the interaction
        return interaction;
    }
}
