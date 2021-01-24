import AModel from "./AModel";
import Vec2 from "../../amath/Vec2";
import Vec3 from "../../amath/Vec3";
import Matrix3x3 from "../../amath/Matrix3x3";
import AObject from "../../aobject/AObject";
import Precision from "../../amath/Precision";
import AGeometryModel from "./AGeometryModel";

/**
 * Class represents a 2D graphical element. Extends the AModel class, which has properties and listeners.
 * This will be the base class for creating your own elements.
 */
export default class AModel2D extends AGeometryModel{

    /** Get set objectSpaceBounds */
    get objectSpaceBounds(){return [this.objectSpaceCorners[0], this.objectSpaceCorners[2]];}

    /**
     * Default properties include:
     * @param args An object containing the properties:
     * <p><b> position </b>: the center of the graphic's coordinate system.</p>
     * <p><b> position </b>: the position of the graphic relative to its parent's coordinate system.</p>
     * <p><b> scale </b>: the scale of the graphic's coordinate system</p>
     * <p><b> rotation </b>: the rotation of the graphic's coordinate system</p>
     * @returns GraphicElement2D object
     */
    constructor(args) {
        super(args);
        // this._modelProperties will be filled with defaults from super class and populated with
        // anything in arge.modelProperties

        const verts = [];

        const defaultProps = {
            matrix: new Matrix3x3(),
            position: new Vec2(0,0),
            anchorshift: new Vec2(0,0),
            scale: new Vec2(1,1),
            rotation: 0,
            objectVertices: verts,
            attributes: {
                fill: '#9ECFFF',
                opacity: 1.0,
                stroke: '#000000',
                linewidth: 2
            }
        }
        // update any defaults not set explicitly with arguments
        this.setDefaultProperties(defaultProps);
        this.matrix = Matrix3x3.Identity();
        this.objectSpaceCorners = [];
        this.initModel(args);
    }

    initModel(args){
        //set any props based on args that aren't in args.modelProperties here
    }


    //##################//--The Object Matric--\\##################
    //<editor-fold desc="The Object Matric">


    /**
     * Set the current matrix based on the current matrix properties.
     * This will be called when a matrix property is set directly.
     * It should take the current matrix properties and set the current matrix
     * based on those properties.
     */
    updateMatrix(){
        this.matrix = Matrix3x3.FromProperties({
            position: this.getPosition(),
            rotation: this.getRotation(),
            scale: this.getScale(),
            anchorshift: this.getAnchorShift()
        });
    }

    /**
     * Set the matrix properties based on the current matrix.
     * This will be called after the matrix is changed directly,
     * so you can assume that the matrix is accurate and the matrix properties
     * should be updated to reflect the current matrix.
     * The same matrix could be the result of different combinations of
     * anchor and position, or of scale and rotation, so by default we will assume that the
     * position property is accurate and only uodate anchor shift.
     * Similarly, we will assume that the current value of rotation is correct by default,
     * though we can override this wirth an additional argument, in which case rotation will
     * be calculated using atan2.
     */
    updateMatrixProperties(updateRotation = true){
        const ex = new Vec3(1,0,0);
        const ey = new Vec3(0,1,0);

        if(updateRotation) {
            const Mex = this.matrix.times(ex);
            this.setRotation(Math.atan2(Mex.y, Mex.x), false);
        }
        const noRo = Matrix3x3.Rotation(-this.getRotation()).times(this.matrix);
        const scaleX = noRo.times(ex);
        const scaleY = noRo.times(ey);
        this.setScale(new Vec2(Precision.signedTiny(scaleX.x), Precision.signedTiny(scaleY.y)), false);

        var ORSinv = Matrix3x3.Translation(this.getPosition()).times(
            Matrix3x3.Rotation(this.getRotation()).times(
                Matrix3x3.Scale(this.getScale())
            )
        ).getInverse();

        if(ORSinv===null){
            console.warn("tried to compute inverse when determinant was zero");
        }

        const anchorM = ORSinv.times(this.matrix);
        const anchor = anchorM.times(new Vec2(0,0));

        this.setAnchorShift(anchor, false);
        this.notifyPropertySet({
            name: 'anchorShift',
            value: this.getAnchorShift()
        });
        this.notifyPropertySet({
            name: 'position',
            value: this.getPosition()
        });
        this.notifyPropertySet({
            name: 'scale',
            value: this.getScale()
        });
        this.notifyPropertySet({
            name: 'rotation',
            value: this.getRotation()
        });

    }


    /**
     * AModel property [position] setter
     * @param position Value to set position
     * @param update Whether or not to update listeners
     */
    setPosition(position, update=true){
        this.setMatrixProperty('position', position, update);
    }
    getPosition(){return this.getProperty('position');}

    /**
     * AModel property [anchor] setter
     * @param shift Value to set anchor shift to (Vec2)
     * @param update Whether or not to update listeners
     */
    setAnchorShift(anchor, update=true){
        this.setMatrixProperty('anchorshift', anchor, update);
    }
    getAnchorShift(){return this.getProperty('anchorshift');}

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
        if(typeof scale == 'number'){
            this.setMatrixProperty('scale', new Vec2(scale, scale), update);
            return;
        }
        this.setMatrixProperty('scale', scale, update);
    }
    getScale(scale){return this.getProperty('scale');}

    /**
     * AModel property [rotation] setter in radians
     * @param rotation Value to set rotation in radians
     * @param update Whether or not to update listeners
     */
    setRotation(rotation, update=true){
        this.setMatrixProperty('rotation', rotation, update);
    }
    getRotation(rotation){return this.getProperty('rotation');}

    /**
     * AModel property [rotation] setter in degrees
     * @param rotation Value in degrees to set rotation
     * @param update Whether or not to update listeners
     */
    setRotationDegrees(rotation, update=true){
        this.setRotation(rotation*Math.PI/180, update);
    }
    getRotationDegrees(rotation){return this.getRotation()*180/Math.PI;}


    /**
     * This is only correct in A1-Style situations where everything is a direct child of the root node and the root node
     * has the identity matrix.
     * @param position
     * @param update
     */
    setWorldPosition(position, update=true){
        if(!this.getParent()){
            this.setPosition(position, update);
        }else{
            this.setPosition(this.getParent().getWorldToObjectMatrix().times(position), update);
        }
    }


    /**
     * This is only correct in A1-Style situations where everything is a direct child of the root node and the root node
     * has the identity matrix.
     * @returns {*}
     */
    getWorldPosition(){
        return this.getProperty('position');
    }

    getAnchorMatrix(){
        //Anchor matrix is PRSA.times(A.getInverse());
        return this.matrix.times(Matrix3x3.Translation(this.getAnchorShift().times(-1)));
    }


    //</editor-fold>
    //##################\\--The Object Matric--//##################

    //##################//--Vertices--\\##################
    //<editor-fold desc="Vertices">
    /** Get set vertices */
    getVertices() {
        return this.objectVertices? this.getObjectToWorldMatrix().applyToPoints(this.objectVertices): undefined;
    }
    /**
     * setVertices should take vertices in world coordinates and use them to set geometry in object coordinates.
     * Transform the provided vertices into object coordinates, and assign objectVertices to these transformed values.
     * Update the objectSpaceCorners for our object (since we're changing the geometry, the bounds of that geometry might change).
     * @param value
     */
    setVertices(value) {
        const mat=this.getWorldToObjectMatrix();
        const point0 = Matrix3x3.Multiply(mat, value[0]);
        const bounds = [point0.dup(),point0.dup()];
        this.objectVertices = value.map(vi=>{
            var v = mat.times(vi);
            for(let d=0;d<point0.elements.length;d++){
                if(v.elements[d]<bounds[0].elements[d]){
                    bounds[0].elements[d]=v.elements[d];
                }
                if(v.elements[d]>bounds[1].elements[d]){
                    bounds[1].elements[d]=v.elements[d];
                }
            }
            return v;
        });
        this.objectSpaceCorners = [
            bounds[0],
            new Vec2(bounds[1].x, bounds[0].y),
            bounds[1],
            new Vec2(bounds[0].x, bounds[1].y)
        ];
    }

    //</editor-fold>
    //##################\\--Vertices--//##################

    //##################//--Object Bounds--\\##################
    //<editor-fold desc="Object Bounds">

    /* setter for objectSpaceCorners, a list of Vec2 for the 4 corners of the object's bounding box.
     * Should be in the form:
     * [Vec2(minX, minY),
     * Vec2(maxX, minY),
     * Vec2(maxX, maxY),
     * Vec2(minX, maxY)]
     */
    setObjectSpaceCorners(vertList){
        this.objectSpaceCorners=vertList;
    }

    getWorldSpaceBBoxCorners(){
        return this.getObjectToWorldMatrix().applyToPoints(this.objectSpaceCorners);
    }

    _calcWorldSpaceBBoxCorners(){
        const wbounds = this._calcWorldBounds();
        return [wbounds[0], new Vec2(wbounds[1].x, wbounds[0].y), wbounds[1], new Vec2(wbounds[0].x, wbounds[1].y)];
    }
    _calcWorldBounds(){
        return Vec2.GetPointBounds(this.getVertices());
    }


    //</editor-fold>
    //##################\\--Object Bounds--//##################


    //##################//--Attributes--\\##################
    //<editor-fold desc="Attributes">
    /**
     * Get an SVG attribute. These have significant overlap with CSS properties.
     * @param name
     * @returns {*}
     */
    getAttribute(name){
        return this.attributes[name];
    }

    /**
     * Set an SVG attribute. These have significant overlap with CSS properties
     * @param name
     * @param value
     */
    setAttribute(name, value, update=true){
        this.attributes[name]=value;
        if(update){
            var passargs = {};
            passargs[name]=value;
            this.notifyListeners({
                type: "setAttributes",
                args: passargs
            });
        }
    }

    getAttributes(){
        return this.attributes;
    }

    /**
     * Set multiple attributes at once using a dictionary
     * @param attrs - a dictionary of attributes
     * @param update - whether to update listeners
     */
    setAttributes(attrs, update){
        if(attrs === undefined){return;}
        for(let key of Object.keys(attrs)){
            this.setAttribute(key, attrs[key], update);
        }
        // this.attributes = Object.assign(this.attributes, attrs);
        // if(update){
        //     this.notifyListeners({
        //         type: "setAttributes",
        //         args: attrs
        //     });
        // }

    }

    //</editor-fold>
    //##################\\--Attributes--//##################

    /**
     * Renormalize vertices should:
     * - translate and scale the model's objectVertices so that their bounding box is the -0.5,0,5 box.
     * - adjust the model's matrix so that the return value of getVertices is not changes by the anchor/scaling.
     * - adjust the models
     * - call updateMatrixProperties() to update matrix properties to reflect the new matrix.
     *
     * If the centerOrigin argument is true, this will reset the position to the center of the object's bounding box,
     * and set anchor to be zero.
     *
     * This function should work even if matrix properties have not been set or initialized.
     * You should only need the current matrix and vertices.
     * You may assume that this.objectSpaceCorners is accurate, as it should be updated whenever vertices are set.
     */
    renormalizeVertices(centerOrigin=false){
        // We will assume that objectSpaceBounds is already up to date
        // first, let's get the anchor and scaling we need to transform the bounding box to -0.5, 0,5
        const oldVerts = this.objectVertices;
        if(oldVerts===undefined || oldVerts.length<2){return;}
        const oldBounds = this.objectSpaceBounds;
        const oldCenter = oldBounds[0].plus(oldBounds[1]).times(0.5);
        const oldScale = oldBounds[1].minus(oldBounds[0]);

        // We will play some precision tricks to avoid trouble if, for example, all of the points match in one coordinate.
        var scaleX = Math.abs(oldScale.x);
        scaleX = Precision.signedTiny(scaleX, 1);
        var scaleY = Math.abs(oldScale.y);
        scaleY = Precision.signedTiny(scaleY, 1);

        // Calculate a matrix that centers and scales appropriately
        const adjust = Matrix3x3.Multiply(
            Matrix3x3.Scale(1/scaleX, 1/scaleY),
            Matrix3x3.Translation(-oldCenter.x, -oldCenter.y)
        );

        //apply it to the objectVertices
        this.objectVertices = adjust.applyToPoints(this.objectVertices);

        //and apply the inverse to the model matrix to keep everything the same in world coordinates
        this.matrix = Matrix3x3.Multiply(this.matrix, adjust.getInverse());

        // update objectSpaceCorners
        this.objectSpaceCorners = [
            new Vec2(-(0.5*oldScale.x/scaleX), -(0.5*oldScale.y/scaleY)),
            new Vec2((0.5*oldScale.x/scaleX), -(0.5*oldScale.y/scaleY)),
            new Vec2(0.5*oldScale.x/scaleX, 0.5*oldScale.y/scaleY),
            new Vec2(-(0.5*oldScale.x/scaleX), (0.5*oldScale.y/scaleY))
        ];
        if(centerOrigin){
            this.setPosition(this.matrix.times(new Vec2(0,0)), false);
            this.setAnchorShift(new Vec2(0,0), false);
        }
        // update matrix properties
        this.updateMatrixProperties();
    }

    getViewGroupClassName(){
        return this.getAttribute("viewGroupClassName");
    }
    setViewGroupClassName(value){
        this.setAttribute("viewGroupClassName", value);
    }


    setViewClass(viewClass){
        this.setProperty('viewClass', viewClass.name, false);
        this.notifyListeners({
            type: 'setViewClass',
            viewClass: viewClass
        });
    }


    //##################//--Assignment 2--\\##################
    //<editor-fold desc="Assignment 2">
    /**
     * Throughout this assignment, it can be easy to lose track of what behavior to
     * expect from different operations under different circumstances. As is often the
     * case with hierarchical algorithms, it's useful to approach things inductively.
     * Most of the behavior in this assignment reduces to what you implemented in
     * Assignment 1 when all objects are children of the same root node (assuming
     * that root node has the identity as its matrix).<br>
     *
     * For this reason, it will often be useful to think of the behavior at each node
     * in the object coordinates of its parent. To that end, the following simple
     * function may prove handy.
     *
     * @returns {Matrix3x3}
     */
    getParentSpaceMatrix(){
        if(this.getParent()){
            // You will reimplement getObjectToWorldMatrix later in this file
            return this.getParent().getObjectToWorldMatrix();
        }else{
            return Matrix3x3.Identity();
        }
    }

    /**
     * Get the bounding box for the entire subtree of children rooted at this model.
     * You will implement the getChildTreeObjectSpaceBoundingBox() function in the code
     * at the bottom of this file.
     *
     * If the model has no geometry and no children with geometry, then this function should
     * not return anything (or equivalently, return `undefined`).
     * Returns nothing if getChildTreeObjectSpaceBoundingBox returns nothing
     * @returns {*}
     */
    getChildTreeWorldSpaceBoundingBox(){
        const objectSpaceBoxPoints = this.getChildTreeObjectSpaceBoundingBox();
        if(objectSpaceBoxPoints) {
            return this.getObjectToWorldMatrix().applyToPoints(objectSpaceBoxPoints);
        }
    }

    /**
     * A function for getting the bounds of every element sharing a common ancestor.
     * This is similar to the bounds displayed when selecting by group in apps like Powerpoint.
     * @returns {*}
     */
    getGroupWorldSpaceBoundingBox(){
        function groupRoot(m){
            if(m.getParent() && m.getParent().getParent()){
                return groupRoot(m.getParent());
            }else{
                return m;
            }
        }
        return groupRoot(this).getChildTreeWorldSpaceBoundingBox();
    }

    /**
     * The reparent operation detaches a subtree from its parent, and re-attaches it elsewhere.
     * You will have to write code that handles the impact of these edits on object matrices in the definitions of
     * removeFromParent() and attachToNewParent(newParent), found later in this file.
     * @param newParent
     */
    reparent(newParent){
        this.removeFromParent();
        this.attachToNewParent(newParent);
    }

    /**
     * groupChildren will take all the children of a node and reparent them to a new A2ModelGroup,
     * which will then be the only child of this model. After calling this function, all previous
     * children should be grandchildren, and the only child of the current model should be the new
     * AGroupModel.
     *
     * You will need to write the function recenterAnchorInSubtree() which is called at the end of
     * this function to set the position of the new group.
     */
    groupChildren(){
        const newGroup = this.constructor.CreateGroup();
        const childList = this.getChildrenList();
        this.addChild(newGroup);
        for(let c of childList){
            c.reparent(newGroup);
        }
        newGroup.recenterAnchorInSubtree();
        return newGroup;
    }

    /**
     * Ungroup children is *almost* an inverse of groupChildren. More specifically,
     * if you call `this.groupChildren().ungroupChildren()`, then you should end up
     * with the same graph you started with. More generally, you can use ungroupChildren
     * to remove the dependencies of a node's children from that node.
     */
    ungroupChildren(){
        // Can't ungroup children of root node...
        if(!this.getParent()){
            return;
        }
        const childList = this.getChildrenList();
        for(let c of childList){
            c.reparent(this.getParent());
        }
        return this;
    }

    //</editor-fold>
    //##################\\--Assignment 2--//##################

    //##################//--Assignment 2 implement functions--\\##################
    //<editor-fold desc="Assignment 2 implement functions">
    /**
     * Should calculate the matrix that transforms object coordinates to world (pixel) coordinates
     * In this case, remember that our models form a scene graph, with world coordinates
     * corresponding to the coordinate system at the root of our scene graph.
     *
     * The transformation matrix, say we name it M_toWorld, that transforms points on the selected
     * model M to the world coordinate is given by M_toWorld = Parent's M_toWorld * M's model matrix.
     *
     * In other words, if we have the following model hierarchy p_root -> p_1 ->  p.
     * The vertex v of model p in world coordinate is given by Mp_root * Mp_1 * Mp * v
     *
     * Thus, we can get objectToWorldMatrix M_toWorld by calling a recursive method until we reach the
     * root node in the scene graph.
     *
     * Note that the M_toWorld of the root model M_root is simply M_root's model matrix.
     * @returns {*}
     */
    getObjectToWorldMatrix(){
        if(this.getParent()){
            return this.getParent().getObjectToWorldMatrix().times(this.matrix);
            // return this.getParentSpaceMatrix().times(this.matrix);
        }else{
            return this.matrix;
        }
    }


    /**
     * super.removeFromParent() will remove this model from its parent's children, and set this model's parent property
     * to be undefined (no parent).
     *
     * Note that different from the M = ORST model we had from A1, we have M = PRSA in A2 where P is referred to as Position.
     * And conceptually, P is used to move a child's anchor from origin (0,0) to the anchor position in the parent's
     * coordinate system (not the world!). And we can retrieve this position by doing this.getPosition.
     *
     * And since the anchor position is in the parent's coordinate removing a model from its parent will change the
     * value of its ObjectToWorldMatrix (retrieved using this.getObjectToWorldMatrix() ) and thus change the
     * position of the shape.
     *
     * However, we do not want this operation to change the shape on our canvas.
     * To ensure this, we will need to change our model's object matrix and Position.
     *
     * Hint: Think about how removing from the parent will change the Position & ObjectToWorldMatrix of the model
     * and what should we do to counteract the effect.
     *
     * Hint: Consider using setMatrixAndPosition and think about what values should be passed in.
     */
    removeFromParent() {
        const parentO2W = this.getParentSpaceMatrix();
        const currentWorldPosition = this.getPosition();
        this.setMatrixAndPosition(parentO2W.times(this.matrix), parentO2W.times(currentWorldPosition));
        this._removeFromParent();
        this.notifyPropertySet();
        //    TODO: check on position when group nodes are removed. also, check on delete...
    }

    /**
     * Here we attach the selected model to the given parent.
     *
     * Similar to removeFromParent, our job is to ensure that the worldpositions of our model
     * (retrieved using this.getWorldPosition you will implement) remain consistent after the attachment.
     *
     * Hint: Think about how adding a parent will change the Position & ObjectToWorldMatrix of the model and what
     * should we do to counteract the effect.
     *
     * @param newParent
     */
    attachToNewParent(newParent) {
        const parentO2W = newParent.getObjectToWorldMatrix();
        const parentW2O = parentO2W.getInverse();
        const currentWorldPosition = this.getWorldPosition();
        this.setMatrixAndPosition(parentW2O.times(this.matrix), parentW2O.times(currentWorldPosition));
        this._attachToNewParent(newParent);
        this.notifyPropertySet();
    }

    /**
     * Now that a model's matrix may not map directly to world coordinates, we may need an additional step
     * to calculate position on the screen.
     * Hint: you can retrieve the model's position by this.getPosition().
     *       What is this position? (refer to earlier comments if you are confused)
     * Hint: what should you do if the model has no parent? What should you do if the model has a parent?
     * @returns {*}
     */
    getWorldPosition() {
        if(!this.getParent()){
            return this.getPosition();
        }else{
            return this.getParent().getObjectToWorldMatrix().times(this.getPosition());
        }
    }

    // /**
    //  * Set the position of this model such that subsequent transformations will
    //  * happen around the provided point, which is given in world coordinates.
    //  *
    //  * Hint: Given Position in WorldSpace, set the model's position by calling this.setPosition(someposition, update).
    //  * Hint: What should this "someposition" be if the model has no parent? What if the model has a parent?
    //  *
    //  * @param position
    //  * @param update
    //  */
    // setWorldPosition(position, update= true){
    //     if(!this.getParent()){
    //         this.setPosition(position, update);
    //     }else{
    //         this.setPosition(this.getParent().getWorldToObjectMatrix().times(position), update);
    //     }
    // }

    /**
     * In our hierarchy, when we group up shapes, we create a model Mg that is the parent of all the shapes in the group.
     * This function sets the World Position of the group model Mg to be the center of the bounding box of all models
     * within the group, without changing the world space vertices of any model in the scene.
     *
     * If Mg is a group with no children, set the world position to be the same as the model's parent's world position.
     *
     * Hint: you can get the child bounding box through this.getChildTreeWorldSpaceBoundingBox (you will implement it next).
     *
     */
    recenterAnchorInSubtree(){
        const subtreeBounds = this.getChildTreeWorldSpaceBoundingBox();
        if(!subtreeBounds){
            this.setWorldPosition(this.getParent().getWorldPosition(), false);
            return;
        }else{
            this.setWorldPosition(subtreeBounds[0].plus(subtreeBounds[2]).times(0.5), false);
        }
        this.updateMatrixProperties()
    }


    /**
     * Calculates the corners of a bounding box for this model and its entire tree of descendants. The returned bounding
     * box should be in the object space coordinates of this model. For example, if a model has no children, then this
     * function should return this.objectSpaceCorners.
     *
     * Note that this.children is not a list; it's a javascript Map, which you can think of as an ordered dictionary.
     * If you're not familiar with javascript Maps, we recommend iterating over children using one of the following methods:
     * <br>
     * getChildrenList() will return a list of children that you can iterate over:
     *
     * ```javascript
     * const childList = this.getChildrenList();
     * ```
     *
     * mapOverChildren(fn) will apply the function fn to each child:
     *
     * ```javascript
     * this.mapOverChildren(child=>{
     *      //some code function on child
     * })
     * ```
     *
     * Hint: The function vec2.GetPointBounds(pointList) might be helpful
     * Hint: Remember to keep track of what space all the vertices are in and perform any necessary transformations
     * Hint: You will want the function to be recursive
     *
     * Should be in the form:
     * [Vec2(minX, minY),
     * Vec2(maxX, minY),
     * Vec2(maxX, maxY),
     * Vec2(minX, maxY)]
     * @returns {Vec2[]}
     */
    getChildTreeObjectSpaceBoundingBox(){
        var childBoxVerts = this.objectSpaceCorners;
        this.mapOverChildren(c=>{
            const childObBox = c.getChildTreeObjectSpaceBoundingBox();
            if(childObBox){
                const childBox = c.matrix.applyToPoints(childObBox);
                childBoxVerts = childBoxVerts.concat(childBox);
            }
        });
        if(childBoxVerts.length<1){
            return;
        }
        const b = Vec2.GetPointBounds(childBoxVerts);
        return [
            new Vec2(b[0].x, b[0].y),
            new Vec2(b[1].x, b[0].y),
            new Vec2(b[1].x, b[1].y),
            new Vec2(b[0].x, b[1].y)
        ];
    }
    //</editor-fold>
    //##################\\--Assignment 2 implement functions--//##################
    /**
     * This function will create an A2ModelGroup (defined below).
     * You do not need to change this function.
     * @param args
     * @returns {A2ModelGroup}
     * @constructor
     */
    static CreateGroup(args){
        const newGroup = new (this.GroupClass)(args);
        return newGroup;
    }

    getArmToWorldMatrix(){
        return this.getObjectToWorldMatrix().times(Matrix3x3.Translation(this.getAnchorShift().times(-1)));
    }
    getWorldToArmMatrix(){
        return this.getArmToWorldMatrix().getInverse();
    }
}


//##################//--Model Group Class--\\##################
//<editor-fold desc="Model Group Class">

/**
 * Below you will find the A2ModelGroup class. You don't need to edit it,
 * but are welcome to look at its implementation. Its main purposes are to
 * 1) Provide a way to add transformations to the hierarchy without adding
 * additional geometry, and 2) provide a mechanism for adding transformations
 * to an object that its children should not inherit (see video for details).
 */
export class AModel2DGroup extends AModel2D{
    /**
     * Convenience accessor to see if a model is an A2ModelGroup. So, `model.isModelGroup` will be
     * true if model is an AModelGroup
     * @return {boolean}
     * */
    get isModelGroup(){return true;}

    getWorldSpaceBBoxCorners() {
        if(!this.getChildrenList().length){
            return;
        }
        return this.getChildTreeWorldSpaceBoundingBox();
    }

    /**
     * Groups cannot have their own vertices. They exist only for manipulating other shapes.
     * It is a grim existence: living only to serve others, trapped in the shadows of a
     * hierarchical system... Take a moment to ponder this. Then, perhaps, have a quick stretch.
     * After that, you should probably get back to work on the assignment. Also, now that we've
     * personified model groups, try not to think too much about how that analogy plays out in
     * the implementation for ungroupChildren(). There is enough darkness in the world today;
     * you don't need some kind of imagined ethical dilemma adding to the madness.
     * @param value
     */
    setVertices(value) {
        return;
    }

    /**
     * ungroupChildren works slightly differently on groups than on regular models,
     * in that we remove the group node after promoting its children to siblings.
     * This ensures that `model.groupChildren().ungroupChildren()` leaves the graph unchanged,
     * and brings the fleeting life of an A2ModelGroup to an abrupt end. Don't think about that
     * last part too hard; in the words of Albert Camus, "to understand the world, one has to
     * turn away from it on occasion."
     * @returns {*}
     */
    ungroupChildren() {
        const parent = this.getParent();
        if(!parent){
            return;
        }
        super.ungroupChildren();
        this.release();
        return parent;
    }
}
AModel2D.GroupClass = AModel2DGroup
//</editor-fold>
//##################\\--Model Group Class--//##################

AObject.RegisterClass(AModel2D);
AObject.RegisterClass(AModel2DGroup);