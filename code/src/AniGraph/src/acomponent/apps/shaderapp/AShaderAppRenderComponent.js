import AGraphicsComponent3D from "./AniGraph/src/acomponent/AGraphicsComponent3D";
import AComponentController3D from "./AniGraph/src/amvc/controllers/AComponentController3D";
import AController3D from "./AniGraph/src/amvc/controllers/AController3D";
import AGraphicsContext3D from "./AniGraph/src/acontext/AGraphicsContext3D";
import AView3D from "./AniGraph/src/amvc/views/AView3D";
// import AModel3D from "./AniGraph/src/amvc/models/AModel3D";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

import BufferGeometryUtils from "./js/BufferGeometryUtils";
import PhongShader from "./shaderspecs/PhongShader";
import AModel2D from "./AniGraph/src/amvc/models/AModel2D";
import AShaderView3D from "./AShaderView3D";


const sphereobj = require('./static/meshes/sphere.obj');

export default class AShaderAppRenderComponent extends AGraphicsComponent3D{
    static ComponentControllerClass = AComponentController3D;
    static GraphicsContextClass = AGraphicsContext3D;
    static ModelClassMap = {
        'default': {
            controllerClass: AController3D,
            viewClass: AShaderView3D,
            modelClass: AModel2D
        }
    }
    constructor(props) {
        super(props);
        this.initA6Vars();
    }

    initCameraControls(){
        //Camera Controls
        this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    //##################//--OBJ--\\##################
    //<editor-fold desc="OBJ">
    /** Get set group */
    set group(value){this._group = value;}
    get group(){return this._group;}

    /** Get set normalLength */
    set normalLength(value){
        this.setAppState('normalLength', value);
        this._setNormalLength();
    }
    get normalLength(){return this.getAppState('normalLength');}
    /** Get set Exposure */
    set exposure(value){
        this.setAppState('exposure', value);
        // this.setUniformLog('exposure', value)
    }
    get exposure(){return this.getAppState('exposure');}
    /** Create getter/setter for roughness that aliases App State*/
    set roughness(value){
        this.setAppState('roughness', value);
        this.setUniformLog('roughness', value)
    }
    get roughness(){return this.getAppState('roughness');}
    /** Create getter/setter for fixLightsToCamera that aliases App State*/
    set fixLightsToCamera(value){this.setAppState('fixLightsToCamera', value);}
    get fixLightsToCamera(){return this.getAppState('fixLightsToCamera');}
    /** Create getter/setter for axesVisible that aliases App State*/
    set axesVisible(value){this.setAppState('axesVisible', value);}
    get axesVisible(){return this.getAppState('axesVisible');}
    /** Create getter/setter for normalsVisisble that aliases App State*/
    set normalsVisible(value){this.setAppState('normalsVisisble', value);}
    get normalsVisible(){return this.getAppState('normalsVisisble');}
    /** Create getter/setter for wireframeVisible that aliases App State*/
    set wireframeVisible(value){this.setAppState('wireframeVisible', value);}
    get wireframeVisible(){return this.getAppState('wireframeVisible');}

    initAppState(){
        super.initAppState();
        const component = this;
        component.addAppStateListener('axesVisible', function(show){
            if(show){
                component.scene.add(component.axesGroup);
            }else{
                component.scene.remove(component.axesGroup);
            }
        });

        component.addAppStateListener('wireframeVisible', function(show){
            if(show){
                component.wireframeMaterial.opacity=1.0;
            }else{
                component.wireframeMaterial.opacity=0.0;
            }
        });

        component.addAppStateListener('normalsVisible', function(show){
            if(show){
                component.normalLineMaterial.opacity=1.0;
            }else{
                component.normalLineMaterial.opacity=0.0;
            }
        });

        // component.addAppStateListener('fixLightsToCamera', function(show){
        // });

        component.addAppStateListener('normalLength', function(normalLength){
            component._setNormalLength(normalLength);
        });

        component.addAppStateListener('roughness', function(value){
            component.setUniformLog('roughness', value)
        });

        component.addAppStateListener('exposure', function(value){
            // component.exposure = value;
            component.setUniformLog('exposure', value);
        });



        component.setAppState('onLoadOBJFile', this.onLoadOBJFile);
        this.fixLightsToCamera = this.fixLightsToCamera;
        this.normalsVisible = this.normalsVisible;
        this.axesVisible = this.axesVisible;

    }
    //
    // async onLoadOBJFile(file){
    //     // const text = await file.blobFile.text();
    //     // var object = new OBJLoader().parse(text);
    //     // object.name = file.name;
    //     // this.setOBJGroup(object);
    // }

    onLoadOBJFile(file){
        var reader = new FileReader();
        const self = this;
        reader.addEventListener('load', function(event) {
            var contents = event.target.result;
            // var object = new OBJLoader().parse(contents);
            // var sphereobjlocal = sphereobj;
            // console.log(sphereobjlocal);
            self.loadOBJ(contents, file.name);
            // object.name = file.name;
            // console.log(object);
            // console.log(contents);
            // console.log(sphereobj);
            // self.setOBJGroup(object);
        });
        reader.readAsText(file);
    }

    loadOBJ(contents, name){
        var object = new OBJLoader().parse(contents);
        object.name = name;
        this.setOBJGroup(object);
    }


    _setNormalLength(length) {
        if (this.group != null) {
            if (this.normalLines != null) {
                this.scene.remove(this.normalLines);
            }
            this.normalLines = new THREE.Group();
            const nlines = this.normalLines;
            const self = this;
            this.group.children.map(function(object) {
                nlines.add(self.make_normals(object, self.normalLength));
            });
            this.scene.add(this.normalLines);
        }
    }

    setUniformLog(uniformName, logValue) {
        var value = Math.pow(2, logValue);
        if (this.meshMaterial != null) {
            this.meshMaterial.uniforms[uniformName] = { 'type' : 'f', 'value' : value };
        }
    }

    initA6Vars(){
        this.normalLines = null;
        // this.group = null;
        this.backGroup = null;
        this.wireframeGroup = null;
        this.axesGroup = null;
        this.meshMaterial = null;
        this.backMaterial = null;
        this.wireframeMaterial = null;
        this.normalLineMaterial = null;
        this.lightPositions = [];
        this.defaultTextureTarget = null;
    }

    make_normals(object, scale) {
        // Create a Line geometry that will draw the normals for the given object.
        // For now assumes the object is a non-indexed mesh.
        var geom = object.geometry;
        var posns = geom.getAttribute('position');
        var norms = geom.getAttribute('normal');
        if (norms) {
            var n = norms.count;

            var linePosns = [];

            if (n != posns.count) {
                console.error("Help! normals and positions different length!");
            }
            for (let i = 0; i < norms.count; i++) {
                linePosns.push(posns.getX(i), posns.getY(i), posns.getZ(i));
                linePosns.push(
                    posns.getX(i) + scale * norms.getX(i),
                    posns.getY(i) + scale * norms.getY(i),
                    posns.getZ(i) + scale * norms.getZ(i)
                );
            }

            var buffergeometry = new THREE.BufferGeometry();
            buffergeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePosns), 3));
            var material = this.normalLineMaterial;
            return new THREE.LineSegments(buffergeometry, material);
        }
    }

    setOBJGroup(OBJgroup) {
        const self = this;
        if (self.group != null) {
            self.scene.remove(self.group);
        }
        if (self.normalLines != null) {
            self.scene.remove(self.normalLines);
        }
        if (self.backGroup != null) {
            self.scene.remove(self.backGroup);
        }
        if (self.wireframeGroup != null) {
            self.scene.remove(self.wireframeGroup);
        }
        if (OBJgroup == null) {
            console.log("mesh is null");
            return;
        }

        self.group = OBJgroup;
        self.backGroup = OBJgroup.clone(true);
        self.wireframeGroup = OBJgroup.clone(true);
        self.scene.add(self.group);
        self.scene.add(self.backGroup);
        self.scene.add(self.wireframeGroup);

        self.normalLines = new THREE.Group();
        self.group.children.map(function(object) {
            BufferGeometryUtils.computeTangents(object.geometry);
            object.material = self.meshMaterial;
            self.normalLines.add(self.make_normals(object, self.normalLength));
        });
        self.scene.add(self.normalLines);

        self.backGroup.children.map(function(object) {
            object.material = self.backMaterial;
        });

        self.wireframeGroup.children.map(function(object) {
            object.material = self.wireframeMaterial;
        });

    }
    //</editor-fold>
    //##################\\--OBJ--//##################


    initCamera(){
        super.initCamera();
    }


    initGraphicsContext() {
        super.initGraphicsContext();
        this.renderScene();
        this.startAnimation();
    }


    setShader(shaderSpec){
        shaderSpec.initShader(this);
        // this.meshMaterial = new THREE.ShaderMaterial( {
        //     uniforms : {
        //         'lightPositions' : { 'type' : 'v3v', 'value' : []},
        //         'lightColors' : { 'type' : 'v3v', 'value' : []},
        //     },
        //     vertexShader: phongv.default,
        //     fragmentShader: phongf.default,
        // });
    }

    addLight(position, color) {
        this.lightPositions.push(position);
        this.meshMaterial.uniforms.lightColors.value.push(color);
        this.meshMaterial.fragmentShader = '#define NUM_LIGHTS ' + this.lightPositions.length + '\n' + this.currentShaderSpec.FragmentShader;
        // console.log(this.meshMaterial.fragmentShader);
    }

    initScene(){
        super.initScene();

        this.setShader(PhongShader);

        // const vshader = phongv.default;
        // const fshader = phongf;
        // console.log(vshader);
        // console.log(fshader);

        this.meshMaterial.side = THREE.FrontSide;
        this.backMaterial = new THREE.MeshBasicMaterial({ color: 0xaaa000 });
        this.backMaterial.side = THREE.BackSide;
        this.wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true });
        this.normalLineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, transparent: true });
        if(!this.normalsVisible){
            this.normalLineMaterial.opacity=0.0;
        }
        if(!this.wireframeVisible){
            this.wireframeMaterial.opacity=0.0;
        }

        // Load a 1x1 texture into the diffuseTexture uniform
        // So the default non-textured color is not black
        // (using a data URI for a #cccccc pixel)
        var contents = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mM88x8AAp0BzdNtlUkAAAAASUVORK5CYII=';
        var loader = new THREE.TextureLoader();
        const component = this;
        loader.load(contents, function(texture) {
            component.meshMaterial.uniforms['diffuseTexture'] = { type: 't', value: texture };
            component.meshMaterial.needsUpdate = true;
        });

        this.axesGroup = new THREE.AxesHelper(1.5);

        // component.initA6Vars();

        // var object = new OBJLoader().parse(sphereobj);
        // object.name = 'simplesphere';
        // this.setOBJGroup(sphereobj);


        // // Account for cached state in some browsers
        // document.getElementById('showAxesCheckbox').onchange();
        // document.getElementById('showWireframeCheckbox').onchange();
        // document.getElementById('showNormalsCheckbox').onchange();
        // document.getElementById('fixLightsToCameraCheckbox').onchange();
        // document.getElementById('normalLengthRange').oninput();
        // document.getElementById('exposureRange').oninput();
        //
        // window.addEventListener('drop', function(e) {
        //     e = e || event;
        //     e.preventDefault();
        //     e.stopPropagation();
        //     var file = e.dataTransfer.files[0];
        //     var fileType = file.name.split(".").pop();
        //     if (fileType === 'obj') {
        //         loadFile(file);
        //     } else if (file.type.match(/image.*/) && defaultTextureTarget != null) {
        //         loadTexture(file, defaultTextureTarget);
        //     } else {
        //         console.log("Unknown file type: " + file.name);
        //     }
        // }, false);
        //
        // window.addEventListener('dragover', function(e) {
        //     e = e || event;
        //     e.preventDefault();
        // }, false);
        //
        // window.addEventListener('resize', onWindowResize, false);
        //
        // const geometry = new THREE.BoxGeometry(5, 5, 5);
        // // const geometry = new THREE.TorusBufferGeometry(5,3,15);
        // const material = new THREE.MeshBasicMaterial({
        //     color: "#0F0"
        // });
        // this.cube = new THREE.Mesh(geometry, material);
        // this.addElementToScene(this.cube);

        // // -----Step 2--------
        // //LOAD TEXTURE and on completion apply it on SPHERE
        // new THREE.TextureLoader().load(
        //     "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        //     texture => {
        //         //Update Texture
        //         this.cube.material.map = texture;
        //         this.cube.material.needsUpdate = true;
        //     },
        //     xhr => {
        //         //Download Progress
        //         console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        //     },
        //     error => {
        //         //Error CallBack
        //         console.log("An error happened" + error);
        //     }
        // );

        this.loadOBJ(sphereobj.default);

    }

    addViewClass(vclass){
        console.log(vclass.name);
        this.viewClassesDict[vclass.name]=vclass;
        AObject.RegisterClass(vclass);
    }

    initViewClasses(){
        this.viewClassesDict = {
        };
    }

    release(){
        this.stopTimer();
        super.release();
    }

    // setViewMode(viewMode){
    //     this.componentController.replaceViewClass(this.viewClassesDict[viewMode]);
    // }
    bindMethods() {
        super.bindMethods();
        this.onAppUpdate = this.onAppUpdate.bind(this);
        this.onLoadOBJFile = this.onLoadOBJFile.bind(this);
        this.renderScene = this.renderScene.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
        this.stopAnimation = this.stopAnimation.bind(this);
        this.animate = this.animate.bind(this);
        this.setUniformLog = this.setUniformLog.bind(this);
        // this.startTimer = this.startTimer.bind(this);
        // this.tick = this.tick.bind(this);
        // this.stopTimer = this.stopTimer.bind(this);
    }

    onAppUpdate() {
        this.getModel().notifyDescendants();
    }


    //##################//--Animation & Rendering--\\##################
    //<editor-fold desc="Animation & Rendering">
    renderScene() {
        if (this.renderer){
            const self=this;
            this.meshMaterial.uniforms.lightPositions.value =
                this.lightPositions.map(function (p) {
                    if (self.fixLightsToCamera) {
                        return p.clone();
                    } else {
                        return p.clone().applyMatrix4(self.camera.matrixWorldInverse);
                    }
                });
            this.renderer.render(this.scene, this.camera);
        }
    }

    startAnimation(){
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    }
    stopAnimation(){
        cancelAnimationFrame(this.frameId);
    }

    animate(){
        // -----Step 3--------
        //Rotate Models
        // if (this.cube){
        //     this.cube.rotation.y += 0.01;
        // }
        // if(this.freedomMesh){
        //     this.freedomMesh.rotation.y += 0.01;
        // }
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    };
    //</editor-fold>
    //##################\\--Animation & Rendering--//##################


}