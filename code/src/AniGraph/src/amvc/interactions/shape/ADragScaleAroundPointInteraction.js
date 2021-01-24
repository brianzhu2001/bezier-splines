// import {
//     Matrix3x3,
//     Vec2,
//     Precision,
//     ADragInteraction,
//     ADragValueInteraction
// } from "AniGraph"

import {Matrix3x3, Vec2, Precision} from "../../../amath"
import ADragInteraction from "../ADragInteraction";
import ADragValueInteraction from "../ADragValueInteraction";

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

export default class ADragScaleAroundPointInteraction extends ADragInteraction{
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
        interaction.pO2W = interaction.controller.getModel().getParentSpaceMatrix();
        interaction.pW2O = interaction.pO2W.getInverse();

        //define the drag start callback
        interaction.setDragStartCallback(event=>{
            if(!interaction.elementIsTarget(event)){return;}
            event.preventDefault();

            // Get start cursor position
            interaction.startCursorScreenCoordinates = interaction.getEventPositionInContext(event);
            interaction.startCursor = interaction.pW2O.times(interaction.startCursorScreenCoordinates);

            interaction.transformOriginScreenCoords=interaction.getTransformOriginInWorldCoordinates();
            // Get the origin of the transform we are going to apply at the start of the drag
            // getTransformOrigin is a placeholder function that we will set to a different point
            // depending on what point we want our interaction to transform the model around
            interaction.startTransformOrigin = interaction.pW2O.times(interaction.transformOriginScreenCoords);

            // This part is easiest to understand if you imagine transforming around a specific point.
            // For example, if getTransformOrigin() returns interaction.controller.getModel().getPosition()
            // then TR is just the position matrix times the rotation matrix.
            interaction.TR=Matrix3x3.Translation(interaction.startTransformOrigin).times(
                Matrix3x3.Rotation(interaction.controller.getModel().getRotation())
            );

            // We will get the inverse of TR, which would transform world coordinates (which our
            // cursor is defined in) so that our transform origin is at the current origin (meaning it's [0,0])
            // and our x- and y-axes are aligned with the bounding box of our model.
            // Let's call this transformed space our 'Scale Space'.
            interaction.RiTi=interaction.TR.getInverse();

            // Now let's grab the model's current matrix
            interaction.startMatrix = interaction.controller.getModel().matrix;

            // And, for convenience, we'll calculate our cursor coordinates in scale space here
            // so we won't have to recalculate them every time the mouse moves.
            interaction.startCursorScaleCoords = interaction.RiTi.times(interaction.startCursor);
        });

        //now define a drag move callback
        interaction.setDragMoveCallback(event=> {
            event.preventDefault();

            // First we transform our new cursor location to scale space.
            const newCursorScreenCoordinates = interaction.getEventPositionInContext(event);
            if(newCursorScreenCoordinates.x==interaction.transformOriginScreenCoords.y){
                newCursorScreenCoordinates.x=newCursorScreenCoordinates.x+1;
            }
            if(newCursorScreenCoordinates.y==interaction.transformOriginScreenCoords.y){
                newCursorScreenCoordinates.y=newCursorScreenCoordinates.y+1;
            }
            const newCursor = interaction.RiTi.times(
                interaction.pW2O.times(
                    newCursorScreenCoordinates
                )
            );

            ////////////////////////////////////////////////////////////////
            // In general, our scale factors in x and y will be the element-wise ratios of our new
            // cursor location to our old cursor location. However, this can lead to a degeneracy if
            // any numerators or denominators become zero. One way to deal with this is to use
            // random rotation. While that solution is mathematically elegant, it involves creating
            // a confusing API standard to solve a corner-case. So, instead, we added functions to
            // AniGraph called Precision.signedTiny and Precision.signedTinyInt, which round very small
            // values to some minimum absolute value epsilon (where epsilon=1 for signedTinyInt) while
            // preserving the sign of the value.
            const denomX = Precision.signedTiny(interaction.startCursorScaleCoords.x);
            const denomY = Precision.signedTiny(interaction.startCursorScaleCoords.y);
            var rescaleX = Precision.signedTiny(newCursor.x)/denomX;
            var rescaleY = Precision.signedTiny(newCursor.y)/denomY;
            ////////////////////////////////////////////////////////////////////////
            // Here we add functionality where, if the user holds down the shift key while dragging,
            // the model will scale uniformly.
            if(event.shiftKey != !!interaction.controller.getModel().isModelGroup){
                const absval = Math.max(Math.abs(Precision.signedTiny(rescaleX)), Math.abs(Precision.signedTiny(rescaleY)));
                rescaleX = rescaleX<0? -absval : absval;
                rescaleY = rescaleY<0? -absval : absval;
            }
            ////////////////////////////////////////////////////////////////////////

            // Here we update our matrix to M=>TR*S*(TR).inverse*M
            // This applies the desired scale.
            interaction.controller.getModel().setMatrix(interaction.TR.times(
                Matrix3x3.Scale(rescaleX, rescaleY)).times(
                interaction.RiTi
                ).times(interaction.startMatrix)
            );
        });
        //we can optionally define a drag end callback
        interaction.setDragEndCallback(event=>{
            event.preventDefault();
        });

        //Finally, return the interaction
        return interaction;
    }

    /**
     * We can override this function in subclasses to transform around different points
     * @returns {Vec2}
     */
    getTransformOriginInWorldCoordinates(){
        return new Vec2(0,0);
    }
}

