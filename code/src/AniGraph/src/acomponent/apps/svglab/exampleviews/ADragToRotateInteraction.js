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


/**
 * Below you will implement interactions that work on models in a transformation hierarchy (scene graph)
 *
 * *****HINT: In this version of AniGraph, interactions are written slightly differently to how they were in A1. To see
 * an example of what the A1 interactions look like in this newer version, read through ReferenceA1InteractionImplementations.js
 * This will help you get a better sense of how you will want to approach writing the interactions for this A2.
 */

export default class ADragToRotateInteraction extends ADragInteraction{
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

        //define the drag start callback
        interaction.setDragStartCallback(event=>{
            if(!interaction.elementIsTarget(event)){return;}
            event.preventDefault();
            interaction.childArm = Arm(interaction.model, interaction.getEventPositionInContext(event));
        });

        //now define a drag move callback
        interaction.setDragMoveCallback(event=> {
            event.preventDefault();
            // First we transform our new cursor location to scale space.
            const newCursorScreenCoordinates = interaction.getEventPositionInContext(event);
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
