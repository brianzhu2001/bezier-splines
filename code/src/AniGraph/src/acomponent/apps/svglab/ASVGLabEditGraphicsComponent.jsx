import AIDragScaleAroundAnchor from "../../../amvc/interactions/shape/AIDragScaleAroundAnchor";
import AIDragShapePosition from "../../../amvc/interactions/shape/AIDragShapePosition";
import AIDragAnchor from "../../../amvc/interactions/shape/AIDragAnchor";

import A2DShapeEditorComponent from "../shape/A2DShapeEditorComponent";
import AView2D from "../../../amvc/views/AView2D"
import AModel2D from "../../../amvc/models/AModel2D";
import A2DShapeController from "../../../amvc/controllers/A2DShapeController"

import ABoundingBox2DController from "../../../amvc/controllers/supplemental/bbox/ABoundingBox2DController";

export default class ASVGLabEditGraphicsComponent extends A2DShapeEditorComponent{
    // Our A2GraphicsComponent class is a React Component that manages an mvc hierarchy with the following classes.
    static ModelClassMap = {
        default: {
            controllerClass: A2DShapeController,
            viewClass: AView2D,
            modelClass: AModel2D
        }
    };

    /**
     * In this function, you will initialize the controllers representing different edit modes.
     * These controllers will show up as options that the user can select from a drop down menu,
     * with only one controller being active at a time.
     *
     * In Anigraph V2 we can create different bounding box controllers by simply providing different
     * AInteraction subclasses to a constructor (see below). For each AInteraction subclass, callbacks
     * are defined in the `static Create(args)` function.
     */
    initEditModes(){

        // Once you reach the A2Model checkpoint, the `A1Transform` controller should let you
        // move objects around and safely transform direct children of our scene graph's root.
        // However, you will notice that, for example, if you make one leaf node the child of
        // another and attempt to scale each of them separately, strange things begin to happen.
        // This is because our controllers in A1 assumed that a model's matrix mapped object
        // coordinates to screen (world) corrdinates, which may no longer be the case.
        // You will write the interactions for a new version of the Transform controller from
        // A1 that works with hierarchies. The starter code for these interactions can be
        // found in [`../interactions/SceneGraphElementInteractions`](../interactions/SceneGraphElementInteractions)
        //
        this.addSelectionController('Transform', new ABoundingBox2DController({
            component: this,
            handleInteractionClasses: [AIDragScaleAroundAnchor],
            anchorInteractionClasses: [AIDragAnchor],
            hostViewInteractionClasses: [AIDragShapePosition],
            groupBoxInteractionClasses: [AIDragShapePosition]
        }));


        // Here you can set the default edit mode to whichever one you are currently working on
        // this.switchToEditMode('A1Transform');
        this.switchToEditMode('Transform');
        // this.switchToEditMode('Isolation Mode');

        this.setCurrentSelectionMode("Single");
    }


    initSelectionModes(){
        super.initSelectionModes();
        const component = this;
        this.defineSelectionMode('Descendants', {
            getWorldSpaceBoundingBox: function(){
                return component.getSelectedModel().getChildTreeWorldSpaceBoundingBox();
            }
        });

        this.defineSelectionMode('Group', {
            getWorldSpaceBoundingBox: function(){
                return component.getSelectedModel().getChildTreeWorldSpaceBoundingBox();
            },
            selectController: function(controller){
                function groupsearch(c){
                    if(c.getModel().isModelGroup || (!c.getParent().getModel().getParent())){
                        return c;
                    }else{
                        return groupsearch(c.getParent());
                    }
                }
                return groupsearch(controller);
            }
        });
    }




}