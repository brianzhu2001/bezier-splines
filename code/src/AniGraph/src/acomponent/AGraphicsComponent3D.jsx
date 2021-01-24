import React from "react";
import AController2D from '../amvc/controllers/AController2D';
import AGraphicsComponent from "./AGraphicsComponent";
import AGraphicsContext2D from "../acontext/AGraphicsContext2D";
import AView2D from "../amvc/views/AView2D";
import AController3D from "../amvc/controllers/AController3D";
import AGraphicsContext3D from "../acontext/AGraphicsContext3D";
import AView3D from "../amvc/views/AView3D";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

// const AGraphicsComponent2DDefaultProps = {
//     width: 800,
//     height: 500,
// };
export default class AGraphicsComponent3D extends AGraphicsComponent {
    static ComponentControllerClass = AController3D;
    static GraphicsContextClass = AGraphicsContext3D;
    static ModelClassMap = {
        default: {
            controllerClass: AController3D,
            viewClass: AView3D
        }
    };


    /** Get set scene */
    set scene(value){this.getGraphicsContext().scene = value;}
    get scene(){return this.getGraphicsContext().scene;}

    // /** Get set camera */
    // registerCamera(camera, id){this.getGraphicsContext().setCamera(id, camera);}
    // getCameraWithID(id){this.getGraphicsContext().getCamera(id);}
    // // set currentCamera(value){this.getGraphicsContext().currentCamera = value;}

    set camera(value){this.getGraphicsContext().camera = value;}
    get camera(){return this.getGraphicsContext().camera;}
    // get currentCamera(){return this.getGraphicsContext().currentCamera;}
    // setCurrentCameraWithID(id){
    //     this.getGraphicsContext().currentCamera=this.getCameraWithID(id);
    // }
    /** Get set renderer */
    set renderer(value){this.getGraphicsContext().renderer = value;}
    get renderer(){return this.getGraphicsContext().renderer;}

    /** Get set lights */
    set lights(value){this.getGraphicsContext().lights = value;}
    get lights(){return this.getGraphicsContext().lights;}

    /** Get set cameraControls */
    set cameraControls(value){this._cameraControls = value;}
    get cameraControls(){return this._cameraControls;}

    addElementToScene(element){
        this.scene.add(element);
    }

    initCameraControls(){
        console.error("Not implemented");
    }

    initScene(){
        this.initCamera();
        this.initCameraControls();
        this.initLights();
    }

    initLights(){
        //LIGHTS
        this.lights = [];
        this.lights[0] = new THREE.PointLight(0x304ffe, 1, 0);
        this.lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        this.lights[2] = new THREE.PointLight(0xffffff, 1, 0);
        this.lights[0].position.set(0, 200, 0);
        this.lights[1].position.set(100, 200, 100);
        this.lights[2].position.set(-100, -200, -100);
        this.scene.add(this.lights[0]);
        this.scene.add(this.lights[1]);
        this.scene.add(this.lights[2]);
    }

    // initCamera(args){
    //     //add Camera
    //     this.currentCamera = new THREE.PerspectiveCamera(75, this.getWidth() / this.getHeight(), 0.1, 1000);
    //     this.currentCamera.position.z = 20;
    //     this.currentCamera.position.y = 5;
    // }

    initCamera(){
        this.camera = new THREE.PerspectiveCamera(35, this.getGraphicsContext().getWidth() / this.getGraphicsContext().getHeight(), 0.01, 50);
        this.camera.position.z = 10;
    }

    initGraphicsContext(){
        super.initGraphicsContext();
        this.initScene();
    }


    componentWillUnmount() {
        // this.stop();
        this.mount.removeChild(this.renderer.domElement);
        super.componentWillUnmount();
    }

}
// AGraphicsComponent3D.defaultProps = AGraphicsComponent2D.defauDefaultProps;

