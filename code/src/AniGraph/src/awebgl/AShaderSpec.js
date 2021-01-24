import AObject from "../aobject/AObject";
import * as THREE from "three";

export default class AShaderSpec extends AObject{
    static VertexShader = undefined;
    static FragmentShader = undefined;
    static initShader(host){
        host.currentShaderSpec = this;
        var uniforms = Object.assign(host.meshMaterial? host.meshMaterial.uniforms: {}, this.Uniforms);
        host.meshMaterial = new THREE.ShaderMaterial( {
            uniforms : uniforms,
            vertexShader: this.VertexShader,
            fragmentShader: this.FragmentShader
        });
    }

}