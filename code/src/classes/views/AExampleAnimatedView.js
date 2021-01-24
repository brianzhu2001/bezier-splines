import AView2D from "../../AniGraph/src/amvc/views/AView2D";
import AAnimatedColorPickerSpec from "../../AniGraph/src/acomponent/gui/specs/AAnimatedColorPickerSpec";
import Matrix3x3 from "../../AniGraph/src/amath/Matrix3x3";
import ASliderSpec from "../../AniGraph/src/acomponent/gui/specs/ASliderSpec";
import Vector from "../../AniGraph/src/amath/Vector";
import AObject from "../../AniGraph/src/aobject/AObject";

export default class AExampleAnimatedView extends AView2D{
    static GUISpecs = [
        new AAnimatedColorPickerSpec({
            name: 'FillColor',
            defaultValue: new Vector([0,1,1,1]),
            canAnimate: true
        }),
        new ASliderSpec({
            name: 'ShadowScale',
            defaultValue: 1.5,
            minVal: 0,
            maxVal: 5,
            canAnimate: true
        })
    ];


    initGeometry() {
        this.shadow = this.createShapeElement(this.getModel());
        this.addGraphic(this.shadow);
        this.shadow.setAttribute('fill', 'rgbs(0,0,0,0.8)');

        super.initGeometry();

    }

    updateViewElements() {
        this.shadow.setVertices(Matrix3x3.Scale(this.getModel().getProperty('ShadowScale')).applyToPoints(this.getModel().getVertices()));
        super.updateViewElements();
        this.shape.setAttribute('fill', this.getAnimatedColorString('FillColor'));

    }
}
AObject.RegisterClass(AExampleAnimatedView);