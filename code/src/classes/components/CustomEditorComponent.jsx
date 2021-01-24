import {
    ASVGLabEditGraphicsComponent,
    ABoundingBox2DController,
    AIDragScaleAroundAnchor,
    AIDragAnchor,
    AIDragShapePosition,
    ADragToRotateInteraction
} from "../../AniGraph/src"
import A2DShapeController from "../../AniGraph/src/amvc/controllers/A2DShapeController";
import AView2D from "../../AniGraph/src/amvc/views/AView2D";
import AModel2D from "../../AniGraph/src/amvc/models/AModel2D";
import AAnimatedModel from "../../AniGraph/src/amvc/models/AAnimatedModel";
import A2JointIKInteraction from "../../AniGraph/src/acomponent/apps/svglab/exampleviews/A2JointIKInteraction";

export default class CustomEditorComponent extends ASVGLabEditGraphicsComponent{
    static ModelClassMap = {
        default: {
            controllerClass: A2DShapeController,
            viewClass: AView2D,
            modelClass: AAnimatedModel
        }
    };
    initEditModes(){
        super.initEditModes();

        this.addSelectionController('Example', new ABoundingBox2DController({
            component: this,
            handleInteractionClasses: [AIDragScaleAroundAnchor],
            anchorInteractionClasses: [AIDragAnchor],
            hostViewInteractionClasses: [],
            groupBoxInteractionClasses: []
        }));

        this.addSelectionController('Rotation', new ABoundingBox2DController({
            component: this,
            handleInteractionClasses: [AIDragScaleAroundAnchor],
            anchorInteractionClasses: [AIDragAnchor],
            hostViewInteractionClasses: [ADragToRotateInteraction],
            groupBoxInteractionClasses: [ADragToRotateInteraction]
        }));
        //
        this.addSelectionController('TwoJointIK', new ABoundingBox2DController({
            component: this,
            handleInteractionClasses: [AIDragScaleAroundAnchor],
            anchorInteractionClasses: [AIDragAnchor],
            hostViewInteractionClasses: [A2JointIKInteraction],
            groupBoxInteractionClasses: [A2JointIKInteraction]
        }));

    }

}