import AView2D from "../../../../amvc/views/AView2D"

// This view simply draws an open path instead of a closed one.
export default class PathView extends AView2D{
    constructor(args) {
        super(args);
    }

    initGraphics() {
        super.initGraphics();
    }

    createShapeElement(model){
        // Our createShapeElement will look just like createBoxElement.
        // We create the svg path and and set it's initial attributes
        const context = this.getGraphicsContext();
        const verts = model.getVertices();
        const shape = context.makeOpenPath(verts);
        shape.setAttributes(model.getProperty('attributes'));
        shape.setVertices(model.getVertices());

        return shape;
    }

}