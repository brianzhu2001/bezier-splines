import AObjectNode from "../aobject/AObjectNode";
import Matrix3x3 from "../amath/Matrix3x3";

export default class AGLElement extends AObjectNode{
    /** Get set geometry */
    set geometry(value){this._geometry = value;}
    get geometry(){return this._geometry;}

    constructor(args){
        super(args);
        this._hidden = null;
        this._matrix = Matrix3x3.Identity();
        // this.parentGroup = null;
    }

    release(args){
        // this.removeFromParentGroup();
        super.release(args);
    }

    /** Get set hidden */
    set hidden(value){this._hidden = value;}
    get hidden(){return this._hidden;}

    /** Get set parentGroup */
    // set parentGroup(value){this._parentGroupOnShow = value;}
    // get parentGroup(){return this._parentGroupOnShow;}

    // setDOMItem(element){throw("Cannot set "+this.constructor.name+" element directly");}
    // getDOMItem(){return this.getTwoJSObject()._renderer.elem;};

    setThreeJSHandle(threeJSHandle){
        this.threeJSHandle = threeJSHandle;
        this.threeJSHandle._matrix.manual = true;
    }

    getThreeJSHandle(){return this.threeJSHandle;}

    // addToGroup(parentGroup){
    //     this.parentGroup = parentGroup;
    //     this.hidden = false;
    //     if(!this.hidden){
    //         parentGroup.add(this);
    //     }
    // }

    // removeFromParentGroup(){
    //     if(this.getParent()){
    //         this.getParent().removeChild(this);
    //     }
    //     this.hidden=true;
    // }

    // hide(){
    //     if(!this.hidden) {
    //         this.removeFromParentGroup();
    //     }
    // }
    // show(){
    //     if(this.hidden){
    //         if(this.parentGroup===null){
    //             console.warn("Tried to show element that was never added to parent group");
    //         }else{
    //             this.addToGroup(this.parentGroup);
    //         }
    //         this.hidden = false;
    //     }
    // }


    // setAttributes(attributes){
    //     for(let key in attributes){
    //         // this.getThreeJSHandle()[key]=attributes[key];
    //     }
    // }
    // setAttribute(name, value){
    //     // this.getThreeJSHandle()[name]=value;
    // }
    // getAttribute(name){
    //     // return this.getThreeJSHandle()[name];
    // }

    /** Getter and setter that map [view] to tempState, which means it wont be serialized.*/
    get view(){return this._tempState.view;}
    set view(value){this._tempState.view = value;}

    getView(){return this.view};
    setView(view){this.view = view;}

    setVertices(verts){
        const anchors = verts.map(v=> new Two.Anchor(v.x, v.y));
        this.getThreeJSHandle().vertices = anchors;
    }

    // setID(value){
    //     this.getThreeJSHandle().id=value;
    // }
    // getID(){
    //     return this.getThreeJSHandle().id;
    // }

}