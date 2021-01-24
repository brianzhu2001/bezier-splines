import AGUIElementSpec from "./AGUIElementSpec";
import AObject from "../../../aobject/AObject";


export default class AUploaderSpec extends AGUIElementSpec{
    constructor(args) {
        super(args);
    }

    // async onUpload(file){
    //     const text = await file.blobFile.text();
    //     const aobj = AObject.NewFromJSON(text);
    //     if(aobj.recenterAnchorInSubtree){
    //         aobj.recenterAnchorInSubtree();
    //     }
    //     this.getAppState('loadNewModel')(aobj);
    // }

}