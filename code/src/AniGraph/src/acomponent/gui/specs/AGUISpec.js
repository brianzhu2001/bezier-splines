import AObject from "../../../aobject/AObject";
import AGUIElementSpecGroup from "./AGUIElementSpecGroup";
import {ACheckboxSpec} from "./index";


export default class AGUISpec extends AObject{
    constructor(args){
        super(args);

        if(args && args.appGUI){
            this._appGUISpecs = args.appGUI;
        }else{
            this._appGUISpecs = new AGUIElementSpecGroup();
        }

        if(args && args.modelGUI){
            this._modelGUISpecs = args.modelGUI;
        }else{
            this._modelGUISpecs = new AGUIElementSpecGroup();
        }

        if(args && args.viewGUI){
            this._viewGUISpecs = args.viewGUI;
        }else{
            this._viewGUISpecs = new AGUIElementSpecGroup();
        }
    }

    /** Get set appGUISpecs */
    get appGUISpecs(){return this._appGUISpecs;}

    /** Get set modelGUISpecs */
    set modelGUISpecs(value){this._modelGUISpecs = value;}
    get modelGUISpecs(){return this._modelGUISpecs;}

    /** Get set viewGUISpecs */
    set viewGUISpecs(value){this._viewGUISpecs = value;}
    get viewGUISpecs(){return this._viewGUISpecs;}

    addAppGUIElement(spec){
        this.appGUISpecs.push(spec);
    }
    addModelGUIElement(spec){
        this.modelGUISpecs.push(spec);
    }
    addViewGUIElement(spec){
        this.modelGUISpecs.push(spec);
    }
}