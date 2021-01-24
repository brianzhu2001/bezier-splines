import AModel from "./AModel";
import Vec2 from "../../amath/Vec2";
import AModel2D from "./AModel2D";


export default class AGeometryModel extends AModel{

    // constructor(args) {
    //     super(args);
    // }

    set matrix(value){this.modelProperties.matrix = value;}
    get matrix(){return this.modelProperties.matrix;}
    set objectVertices(value){this.setProperty('objectVertices', value);}
    get objectVertices(){return this._modelProperties['objectVertices'];}

    getObjectToWorldMatrix(){
        console.error(`getObjectToWorldMatrix not implemented in ${this.constructor.name}`);
    }
    getWorldToObjectMatrix(){return this.getObjectToWorldMatrix().getInverse();}

    get objectSpaceBounds(){console.error(`objectSpaceBounds not implemented in ${this.constructor.name}`);}


    /** Get set attributes */
    set attributes(value){this._modelProperties['attributes'] = value;}
    get attributes(){return this._modelProperties['attributes'];}

    set objectSpaceCorners(value){this._objectSpaceCorners = value;}
    get objectSpaceCorners(){return this._objectSpaceCorners;}


    /**
     * In case anything needs to be recalculated or reinitialized after loading from a serialized representation
     * @param args
     */
    afterLoadFromJSON(args) {
        super.afterLoadFromJSON(args);
        this.setAttributes(this.getAttributes());
    }

    //##################//--Object Matrix--\\##################
    //<editor-fold desc="Object Matrix">
    setMatrix(value){
        this.setProperty('matrix', value);
        this.updateMatrixProperties();
    }
    setMatrixAndPosition(matrix, position){
        this.setPosition(position, false);
        this.setMatrix(matrix);
    }

    updateMatrix(){
        console.error(`updateMatrix not implemented in AGeometryModel subclass '${this.constructor.name}'`);
    }

    updateMatrixProperties(updateRotation = true){
        console.error(`updateMatrixProperties not implemented in AGeometryModel subclass '${this.constructor.name}'`);
    }


    /**
     * Set one of the matrix properties, update the object matrix, and notify listeners
     * @param name
     * @param value
     * @param update
     */
    setMatrixProperty(name, value, update=true){
        this.modelProperties[name] = value;
        if(update) {
            this.updateMatrix();
            // var passargs = {propname: name};
            // passargs[name]=value;
            this.notifyPropertySet({
                name: name,
                value: value,
            });
        }
    }

    getMatrixProperty(name){
        return this.getProperty(name);
    }



    /**
     * AModel property [position] setter
     * @param position Value to set position
     * @param update Whether or not to update listeners
     */
    setPosition(position, update=true){
        this.setMatrixProperty('position', position, update);
    }
    getPosition(){return this.getMatrixProperty('position');}

    /**
     * AModel property [anchor] setter
     * @param shift Value to set anchor shift to (Vec2)
     * @param update Whether or not to update listeners
     */
    setAnchorShift(anchor, update=true){
        this.setMatrixProperty('anchorshift', anchor, update);
    }
    getAnchorShift(){return this.getMatrixProperty('anchorshift');}

    /**
     * AModel property [scale] setter
     * @param scale Value to set scale
     * @param update Whether or not to update listeners
     */
    setScale(scale, update=true){
        if(Array.isArray(scale)){
            this.setMatrixProperty('scale', scale, update);
            return;
        }
        if(scale.elements){
            this.setMatrixProperty('scale', scale, update);
            return;
        }
        this.setMatrixProperty('scale', scale, update);
    }
    getScale(scale){return this.getMatrixProperty('scale');}

    /**
     * AModel property [rotation] setter in radians
     * @param rotation Value to set rotation in radians
     * @param update Whether or not to update listeners
     */
    setRotation(rotation, update=true){
        this.setMatrixProperty('rotation', rotation, update);
    }
    getRotation(rotation){return this.getMatrixProperty('rotation');}

    /**
     * AModel property [rotation] setter in degrees
     * @param rotation Value in degrees to set rotation
     * @param update Whether or not to update listeners
     */
    setRotationDegrees(rotation, update=true){
        this.setRotation(rotation*Math.PI/180, update);
    }
    getRotationDegrees(rotation){return this.getRotation()*180/Math.PI;}

    //</editor-fold>
    //##################\\--Object Matrix--//##################
}


// export class AGeometryModelGroup extends AGeometryModel{
//     /**
//      * Convenience accessor to see if a model is an A2ModelGroup. So, `model.isModelGroup` will be
//      * true if model is an AModelGroup
//      * @return {boolean}
//      * */
//     get isModelGroup(){return true;}
//
//     getWorldSpaceBBoxCorners() {
//         if(!this.getChildrenList().length){
//             return;
//         }
//         return this.getChildTreeWorldSpaceBoundingBox();
//     }
//
//     /**
//      * Groups cannot have their own vertices. They exist only for manipulating other shapes.
//      * It is a grim existence: living only to serve others, trapped in the shadows of a
//      * hierarchical system... Take a moment to ponder this. Then, perhaps, have a quick stretch.
//      * After that, you should probably get back to work on the assignment. Also, now that we've
//      * personified model groups, try not to think too much about how that analogy plays out in
//      * the implementation for ungroupChildren(). There is enough darkness in the world today;
//      * you don't need some kind of imagined ethical dilemma adding to the madness.
//      * @param value
//      */
//     setVertices(value) {
//         return;
//     }
//
//     /**
//      * ungroupChildren works slightly differently on groups than on regular models,
//      * in that we remove the group node after promoting its children to siblings.
//      * This ensures that `model.groupChildren().ungroupChildren()` leaves the graph unchanged,
//      * and brings the fleeting life of an A2ModelGroup to an abrupt end. Don't think about that
//      * last part too hard; in the words of Albert Camus, "to understand the world, one has to
//      * turn away from it on occasion."
//      * @returns {*}
//      */
//     ungroupChildren() {
//         const parent = this.getParent();
//         if(!parent){
//             return;
//         }
//         super.ungroupChildren();
//         this.release();
//         return parent;
//     }
// }
// AGeometryModel.GroupClass = AGeometryModelGroup