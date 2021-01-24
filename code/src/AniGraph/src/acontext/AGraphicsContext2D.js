import AGraphicsContext from "./AGraphicsContext";
import ASVGElement from "../aweb/svg/ASVGElement";
import ASVGGroup from "../aweb/svg/ASVGGroup";
import AWebElement from "../aweb/AWebElement";


export default class AGraphicsContext2D extends AGraphicsContext{
    static DEFAULT_CONTEXT_WIDTH=600;
    static DEFAULT_CONTEXT_HEIGHT=500;
    static GetDefaultTwoJSType(){
        return Two.Types['svg'];
    }


    constructor(args){
        super(args);
        const passArgs = args ? args : {};
        passArgs.type = this.constructor.GetDefaultTwoJSType();
        this._twoJSType = passArgs.type;
        this.two = new Two(passArgs);
        this.two.scene.id = 'anigraph-root-group';
            this._rootGroup = new ASVGGroup({
            twoJSObject: this.two.scene,
        });
        this.rootGroup.setContext(this);
        this.registerDOMItem(this.rootGroup);
    }

    /** Get set twoJSType */
    get twoJsType(){return this._twoJSType;}

    /** Get set sceneRootGroup */
    // set sceneRootGroup(value){this._sceneRootGroup = new ASVGGroup();}
    // get sceneRootGroup(){return this._sceneRootGroup;}

    /** Get set rootGroup */
    get rootGroup(){return this._rootGroup;}

    setWidth(width){this.two.width = width;}
    getWidth(){return this.two.width;}
    setHeight(height){this.two.height = height;}
    getHeight(){return this.two.height;}

    makeElement(twoJSObject, args) {
        const ElementClass = (args && args.ElementClass)? args.ElementClass:ASVGElement;
        const graphic =  new ElementClass({
            twoJSObject: twoJSObject,
        });
        graphic.setContext(this);

        this.update();
        // graphic.setTwoJSShape(twoJSShape);
        // graphic.context = this;
        this.registerDOMItem(graphic);
        return graphic;
    }

    makeGroup(){
        const group = new ASVGGroup({
                twoJSObject: this.two.makeGroup(...arguments),
                context: this,
            }
        );
        this.registerDOMItem(group);
        return group;
        // return this.two.makeGroup(...arguments);
    }

    makeRectangle(x,y, width, height){
        const graphic = this.makeElement(
            this.two.makePath(
                [new Two.Anchor(x-width*0.5, y-height*0.5),
                new Two.Anchor(x-width*0.5, y+height*0.5),
                new Two.Anchor(x+width*0.5, y+height*0.5),
                new Two.Anchor(x+width*0.5, y-height*0.5)],
                false
            )
        );
        return graphic;
    }

    makePath(verts, args){
        const graphic = this.makeElement(
            this.two.makePath(verts.map(v=> new Two.Anchor(v.x, v.y))),
            args
        );
        return graphic;
    }

    makeOpenPath(verts, args){
        const graphic = this.makeElement(
            this.two.makePath(verts.map(v=> new Two.Anchor(v.x, v.y)), true),
            args
        );
        return graphic;
    }
    //
    // makeSplint(anchors, args){
    //     `<path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M200.5,204.792
    //     c0,0-35.703,58.341-99.988,58.341C36.223,263.132,0.5,210.862,0.5,131.531C0.5,52.204,38.584,0.5,100.5,0.5
    //     c61.924,0,85.354,51.704,85.354,51.704"/>`
    // }

    makeSpline(anchors, args){
        var twoanchors = [];
        for(let aind=0;aind<anchors.length;aind++){
            var a = anchors[aind];
            var newanchor = new Two.Anchor(
                a.x,
                a.y,
                a.leftHandle.x - a.x,
                a.leftHandle.y - a.y,
                a.rightHandle.x - a.x,
                a.rightHandle.y - a.y,
                Two.Commands.curve);
            twoanchors.push(newanchor);
            // if(aind===0) {
            //     twoanchors.push(new Two.Anchor(a.x, a.y, a.startHandle.x - a.x, a.startHandle.y - a.y, a.endHandle.x - a.x, a.endHandle.y - a.y, Two.Commands.move));
            // }else{
            //     if(aind===(anchors.length-1)){
            //         twoanchors.push(new Two.Anchor(a.x, a.y, a.startHandle.x - a.x, a.startHandle.y - a.y, a.endHandle.x - a.x, a.endHandle.y - a.y, Two.Commands.close));
            //     }else {
            //         twoanchors.push(new Two.Anchor(a.x, a.y, a.startHandle.x - a.x, a.startHandle.y - a.y, a.endHandle.x - a.x, a.endHandle.y - a.y, Two.Commands.curve));
            //     }
            // }

            // if(aind===0) {
            //     twoanchors.push(new Two.Anchor(a.x, a.y, 0, 0, 0, 0, Two.Commands.move));
            // }else{
            //     if(aind===(anchors.length-1)){
            //         twoanchors.push(new Two.Anchor(a.x, a.y, 0,0,0,0, Two.Commands.close));
            //     }else {
            //         twoanchors.push(new Two.Anchor(a.x, a.y, 0,0,0,0, Two.Commands.curve));
            //     }
            // }
        }

        if(anchors.length) {
            twoanchors[0].command = Two.Commands.move;
            a = anchors[anchors.length-1];
            // twoanchors.push(
            //     new Two.Anchor(
            //         a.x,
            //         a.y,
            //         a.startHandle.x - a.x,
            //         a.startHandle.y - a.y,
            //         a.endHandle.x - a.x,
            //         a.endHandle.y - a.y,
            //         Two.Commands.close)
            // );
        }
        var path = new Two.Path(twoanchors, false);
        path.automatic=false;
        // path.noFill();
        // path.curved = true;
        this.two.add(path);
        const graphic = this.makeElement(
            path,
            args
        );
        graphic.setAttributes({
            stroke: '#000000',
            linewidth: 1
        });
        graphic.setCSSClass('interpolation-path')
        graphic.noFill();
        graphic.setAnchors(anchors);
        graphic.closed = false;
        return graphic;
    }

    makeCurve(verts, args){
        const graphic = this.makeElement(
            this.two.makeCurve(verts.map(v=> new Two.Anchor(v.x, v.y))),
            args
        );
        return graphic;
    }

    makeCircle(args){
        var x = (args && args.x!==undefined)? args.x : 0;
        var y = (args && args.y!==undefined)? args.y : 0;
        var radius = (args && args.radius!==undefined)? args.radius : 10;
        const graphic = this.makeElement(this.two.makeEllipse(x,y, radius*2, radius*2), args);
        return graphic;
    }

    makeEllipse(){
        const graphic = this.makeGraphic(this.two.makeEllipse(...arguments));
        return graphic;
    }

    update(){
        if(this.updatesAreOnHold){
            return;
        }
        const two = this.two;
        two.update(...arguments);
    }



    appendTo(){
        super.appendTo(...arguments);
        this.two.appendTo(...arguments);
        this.update();
        const contextElement = new AWebElement({
            context: this
        });
        contextElement.setDOMItem(this.two.renderer.domElement);
        this.setElement(contextElement);
    }

    getDOMItem() {
    }

    getSVGDOMItem(){
        return this.two.renderer.domElement;
    }

    saveSVG(){
        console.log("Saving SVG...");
        var svgData = this.getSVGDOMItem().outerHTML;
        var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "AGraphicsContext2D_SVG.svg";
        downloadLink.click();
    }
}