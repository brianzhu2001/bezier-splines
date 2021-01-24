// import {Vec2, Vec3, P2D, Matrix3x3, AView2D, PointList2D} from "AniGraph";
import {Vec2, Vec3, P2D, Matrix3x3, PointList2D} from "../../amath"
import AView2D from "./AView2D";
import tinycolor from "tinycolor2";
import ASVGParticle from "../../aweb/svg/ASVGParticle";


export default class AParticleView extends AView2D{
    static DefaultParticleClass = ASVGParticle;
    static DefaultNParticles = 50;
    initGraphics() {
        super.initGraphics();
    }

    getGravity(){
        return this.getSliderVariable("Gravity");
    }

    createParticle(args){
        const ParticleClass = (args && args.ParticleClass)? args.ParticleClass : this.constructor.DefaultParticleClass;
        const verts = (args && args.verts)? args.verts : PointList2D.EquilateralTriangle();
        const curved = (args && args.curved!==undefined)? args.curved : true;
        const context = this.getGraphicsContext();
        var particle;
        if(curved) {
            particle= context.makeCurve(verts, {ElementClass: ParticleClass});
        }else{
            particle= context.makePath(verts, {ElementClass: ParticleClass});
        }
        this.addGraphic(particle);
        return particle;
    }

    initGeometry() {
        super.initGeometry();
        this.initSliderVariablesApp();
        this.initSliderVariablesModel();

        // this.nParticles = this.constructor.DefaultNParticles;
        // this.lastLaunchTime=0;
        // this.particles = [];
        // for(let p=0;p<this.nParticles;p++){
        //     this.particles.push(this.createParticle());
        //     this.particles[p].hide();
        // }
    }

    emitParticle(pt){
        if(pt.hidden){
            pt.show();
        }
        // launch the particle
    }

    updateParticle(particle, args){
        // customize
    }

    updateViewElements(){
        super.updateViewElements();

        // var time = this.getComponentAppState('appTime');
        // time = (time!==undefined)? time : 0;
        // const model = this.getModel();
        // ...

        // for(let p=0;p<this.particles.length;p++) {
        //     var particle = this.particles[p];
        //     if(!particle.hidden) {
        //         this.updateParticle(args);
        //     }
        // }
    }
}