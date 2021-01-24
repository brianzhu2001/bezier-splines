import AWebElement from "../AWebElement";
import Matrix3x3 from "../../amath/Matrix3x3";

export default class ASVGElement extends AWebElement{
    constructor(args){
        super(args);
        this._hidden = null;
        this._matrix = Matrix3x3.Identity();
        this.parentGroup = null;
        if(this.getTwoJSObject()!==undefined){
            this.twoJSObject._matrix.manual = true;
        }
    }

    release(args){
        this.removeFromParentGroup();
        super.release(args);
    }

    /** Get set _automatic */
    set _automatic(value){this.getTwoJSObject().automatic = value;}
    get _automatic(){return this.getTwoJSObject().automatic;}

    /** Get set hidden */
    set hidden(value){this._hidden = value;}
    get hidden(){return this._hidden;}

    /** Get set parentGroup */
    set parentGroup(value){this._parentGroupOnShow = value;}
    get parentGroup(){return this._parentGroupOnShow;}

    setDOMItem(element){throw("Cannot set "+this.constructor.name+" element directly");}
    getDOMItem(){return this.getTwoJSObject()._renderer.elem;};

    setTwoJSObject(twoJSObject){
        this.twoJSObject = twoJSObject;
        this.twoJSObject._matrix.manual = true;
    }

    getTwoJSObject(){return this.twoJSObject;}


    noFill(){return this.getTwoJSObject().noFill();}
    noStroke(){return this.getTwoJSObject().noStroke();}

    addToGroup(parentGroup){
        this.parentGroup = parentGroup;
        this.hidden = false;
        if(!this.hidden){
            parentGroup.add(this);
        }
    }

    removeFromParentGroup(){
        if(this.getParent()){
            this.getParent().removeChild(this);
        }
        this.hidden=true;
    }

    hide(){
        if(!this.hidden) {
            this.removeFromParentGroup();
        }
    }
    show(){
        if(this.hidden){
            if(this.parentGroup===null){
                console.warn("Tried to show element that was never added to parent group");
            }else{
                this.addToGroup(this.parentGroup);
            }
            this.hidden = false;
        }
    }


    setAttributes(attributes){
        for(let key in attributes){
            this.getTwoJSObject()[key]=attributes[key];
        }
    }
    setAttribute(name, value){
        this.getTwoJSObject()[name]=value;
    }
    getAttribute(name){
        return this.getTwoJSObject()[name];
    }

    /** Getter and setter that map [view] to tempState, which means it wont be serialized.*/
    get view(){return this._tempState.view;}
    set view(value){this._tempState.view = value;}

    getView(){return this.view};
    setView(view){this.view = view;}

    setVertices(verts){
        const anchors = verts.map(v=> new Two.Anchor(v.x, v.y));
        this.getTwoJSObject().vertices = anchors;
    }

    setAnchors(anchors){
        var twoanchors = [];
        var a;
        for(let aind=0;aind<anchors.length;aind++){
            a = anchors[aind];
            var newanchor = new Two.Anchor(
                a.x,
                a.y,
                a.leftHandle.x - a.x,
                a.leftHandle.y - a.y,
                a.rightHandle.x - a.x,
                a.rightHandle.y - a.y,
                Two.Commands.curve);
            twoanchors.push(newanchor);
        }
        if(anchors.length) {
            twoanchors[0].command = Two.Commands.move;
            a = anchors[anchors.length-1];
            // twoanchors.push(
            //     new Two.Anchor(
            //         a.x,
            //         a.y,
            //         a.leftHandle.x - a.x,
            //         a.leftHandle.y - a.y,
            //         a.rightHandle.x - a.x,
            //         a.rightHandle.y - a.y,
            //         Two.Commands.close)
            // );
        }
        this.getTwoJSObject().vertices = twoanchors;
    }

    noFill(){
        return this.getTwoJSObject().noFill();
    }

    /** Get set closed */
    set closed(value){this.getTwoJSObject().closed = value;}
    get closed(){return this.getTwoJSObject().closed;}

    setID(value){
        this.getTwoJSObject().id=value;
    }
    getID(){
        return this.getTwoJSObject().id;
    }

}