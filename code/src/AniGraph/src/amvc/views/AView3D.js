import AView from "./AView";
import ASVGGroup from "../../aweb/svg/ASVGGroup";

export default class AView3D extends AView{
    static GUISpecs = [];
    constructor(args){
        super(args);
        // if(args && args.group){
        //     this.setGroup(args.group);
        // }
    }


    // getGroup(){return this.group;}
    // setGroup(group){this.group = group;}

    addGraphic(graphic){
        super.addGraphic(graphic);
        // graphic.addToGroup(this.getGroup());
    }

    initGraphics(){
        super.initGraphics();
        this.initViewElements();
        this.updateGraphicsContext();
    }

    hideGraphics(){
        // for(let graphic in this.getGraphics()){
        //     graphic.removeFromParentGroup();
        // }
        console.error("need to implement hideGraphics");
    }

    showGraphics(){
        // for(let graphic in this.getGraphics()){
        //     if(graphic.getParent()===undefined){
        //         this.getGroup().add(graphic);
        //     }
        // }
        console.error("need to implement showGraphics");
    }

    // updateGroup(){
    //     const contextType = this.getGraphicsContext().twoJsType;
    //     if(contextType==='svg' || contextType ==='SVGRenderer') {
    //         this.cssLabelClass = this.getViewGroupElementClassName();
    //     }
    // }

    releaseGraphics(args){
        super.releaseGraphics(args);
        // if(this.getGroup()) {
        //     this.getGroup().removeFromParentGroup();
        // }
    }

    _removeFromParent(){
        super._removeFromParent();
        // this.getGroup().removeFromParentGroup();
    }

    _attachToNewParent(newParent){
        super._attachToNewParent(newParent);
        // if(newParent instanceof ASVGGroup) {
        //     this.getGroup().addToGroup(newParent);
        // }else{
        //     this.getGroup().addToGroup(newParent.getGroup());
        // }
    }

    updateGraphicsContext(){
        this.getGraphicsContext().update();
    }

    updateGraphics() {
        // this.updateGroup();
        super.updateGraphics(); // calls updateViewElements
    }

    initViewElements(){
        this.initGeometry();
    }

    initGeometry(){
        // this.shape = this.createShapeElement(this.getModel());
        // this.addGraphic(this.shape);
    }

    updateViewElements(){
        const model = this.getModel();
        // this.shape.setVertices(model.getVertices());
        // this.shape.setAttributes(model.getProperty('attributes'));
    }

    //</editor-fold>
    //##################\\--Shape Funcs--//##################



}