import AGraphicsContext from "./AGraphicsContext";
import ASVGElement from "../aweb/svg/ASVGElement";
import ASVGGroup from "../aweb/svg/ASVGGroup";
import AWebElement from "../aweb/AWebElement";
import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import AGraphicsContext2D from "./AGraphicsContext2D";

export default class AGraphicsContext3D extends AGraphicsContext{




    /** Get set scene */
    set scene(value){this._scene = value;}
    get scene(){return this._scene;}


    //##################//--cameras--\\##################
    //<editor-fold desc="cameras">

    /** Get set camera */
    set camera(value){this._camera = value;}
    get camera(){return this._camera;}

    //
    // /** Get set currentCamera */
    // setCurrentCamera(key){
    //     this._currentCamera = this.getCamera(key);
    // }
    // get currentCamera(){return this._currentCamera;}
    // /** Get set cameras */
    // get cameras(){
    //     if(this._cameras === undefined){
    //         this._cameras = new Map();
    //     }
    //     return this._cameras;
    // }
    // get cameraList(){
    //     return Array.from(this._cameras.entries());
    // }
    // setCamera(key, camera){
    //     this.cameras.set(key, camera);
    // }
    // hasCamera(key){
    //     return this.cameras.has(key);
    // }
    // getCamera(key){
    //     return this.cameras.get(key);
    // }
    // deleteCamera(key){
    //     if(this.hasCamera(key)){
    //         this.getCamera(key).release();
    //         return this.cameras.delete(key);
    //     }
    //     console.warn(`tried to delete camera '${key}', but did not find a camera with that key`)
    // }
    //</editor-fold>
    //##################\\--cameras--//##################


    /** Get set renderer */
    set renderer(value){this._renderer = value;}
    get renderer(){return this._renderer;}

    constructor(args){
        super(args);
        const passArgs = args ? args : {};
    }

    createScene(args){
        return new THREE.Scene();
    }

    initRenderer(){
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor("#263238");
        this.renderer.setSize(this.getWidth(), this.getHeight());
        this.getStageElement().appendChild(this.renderer.domElement);
    }

    initThreeJS(){
        this.setWidth(AGraphicsContext2D.DEFAULT_CONTEXT_WIDTH);
        this.setHeight(AGraphicsContext2D.DEFAULT_CONTEXT_HEIGHT);
        this.scene = this.createScene();
        this.initRenderer();
        // this.initCamera();
        // this.initCameraControls();
        // this.initLights();
    }


    addElement(element){
        this.scene.add(element.handle);
    }

    update(){
        if(this.updatesAreOnHold){
            return;
        }
        // const two = this.two;
        // two.update(...arguments);
    }



    appendTo(){
        super.appendTo(...arguments);
        this.initThreeJS();

        this.getStageElement().appendChild(this.renderer.domElement)
        this.update();
        const contextElement = new AWebElement({
            context: this
        });
        contextElement.setDOMItem(this.renderer.domElement);
        this.setElement(contextElement);
    }

    getDOMItem() {
    }

    // getSVGDOMItem(){
    //     return this.two.renderer.domElement;
    // }

    // saveSVG(){
    //     console.log("Saving SVG...");
    //     var svgData = this.getSVGDOMItem().outerHTML;
    //     var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    //     var svgUrl = URL.createObjectURL(svgBlob);
    //     var downloadLink = document.createElement("a");
    //     downloadLink.href = svgUrl;
    //     downloadLink.download = "AGraphicsContext2D_SVG.svg";
    //     downloadLink.click();
    // }
}