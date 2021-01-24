import {
    Vec2,
    Vec3,
    P2D,
    Matrix3x3,
    AView2D,
    PointList2D,
    AParticleView,
    ASliderSpec
} from "../../../../index";
import tinycolor from "tinycolor2";
import AParticleEuler from "./AParticleEuler";


export default class PingPongParticleView extends AParticleView{
    static GUISpecs = [
        new ASliderSpec({
            name: 'FireRate',
            minVal: 0,
            maxVal: 5,
            defaultValue: 1
        }),
        new ASliderSpec({
            name: 'LaunchSpeed',
            minVal: 0,
            maxVal: 10,
            defaultValue: 1
        }),
        new ASliderSpec({
            name: 'Elasticity',
            minVal: 0,
            maxVal: 1.1,
            defaultValue: 1
        }),
        new ASliderSpec({
            name: 'ParticleRadius',
            minVal: 0,
            maxVal: 75,
            defaultValue: 10
        }),
        new ASliderSpec({
            name: 'Randomness',
            minVal: 0,
            maxVal: 1,
            defaultValue: 0
        })
    ]
    static DefaultParticleClass = AParticleEuler;
    static DefaultNParticles = 80;
    initGraphics() {
        super.initGraphics();
    }

    getGravity(){
        return this.getSliderVariable("Gravity");
    }

    _initAppVariable(name, val){
        if(this.getComponentAppState(name)===undefined){
            this.getController().getComponent().setAppState(name, val);
        }
        this._sliderVariableTypes[name]='app';
    }
    _initModelVariable(name, val){
        if(this.getModel().getProperty(name)===undefined){
            this.getModel().setProperty(name, val);
        }
        this._sliderVariableTypes[name]='model';
    }

    initSliderVariablesApp(){
        super.initSliderVariablesApp();
        this._initAppVariable("Speed", 1);
        this._initAppVariable("Gravity", 1);
        // this._initAppVariable("ParticleRadius", 10);
        // this._initAppVariable("LaunchSpeed", 1);
        // this._initAppVariable("FireRate", 1);
        // this._initAppVariable("Elasticity", 0.8);
        // this._initAppVariable("Randomness", 0);
    }

    initSliderVariablesModel(){
        super.initSliderVariablesModel();
        this._initModelVariable("ParticleRadius", 10);
        this._initModelVariable("LaunchSpeed", 1);
        this._initModelVariable("FireRate", 1);
        this._initModelVariable("Elasticity", 0.8);
        this._initModelVariable("Randomness", 0);
    }

    initGeometry() {
        super.initGeometry();
        const allmodels = this.getComponentAppState('model').getDescendantList();
        console.log(allmodels);
        this.nParticles = this.constructor.DefaultNParticles;
        this.boundWidth = 500;
        this.boundHeight = 500;

        this.initSliderVariablesApp();
        this.lastLaunchTime=0;
        this.particles = [];
        for(let p=0;p<this.nParticles;p++){
            this.particles.push(this.createParticle());
            this.particles[p].hide();
        }
    }

    emitParticle(pt){
        super.emitParticle(pt);  // shows element if it is currently hidden

        pt.radius =this.getSliderVariable('ParticleRadius');
        pt.radius = (pt.radius!==undefined)? pt.radius : 10;
        pt.mass = pt.radius/5;
        var launchSpeed =this.getSliderVariable('LaunchSpeed')*10;
        launchSpeed = (launchSpeed!==undefined)? launchSpeed: 1;
        pt.position = this.getModel().getWorldPosition();
        pt.velocity = this.getModel().getObjectToWorldMatrix().times(new Vec3(0,-1, 0)).getNonHomogeneous().getNormalized().times(launchSpeed);
        const randomness = this.getSliderVariable("Randomness");
        if(randomness){
            pt.velocity = Matrix3x3.Rotation(Math.random()*Math.PI*2*randomness).times(pt.velocity);
        }
        pt.setVertices(PointList2D.EquilateralTriangle(pt.position, 2*pt.radius*Math.cos(Math.PI/6)));
    }

    updateParticle(particle, args){
        // pt, model, time, elasticity=1
        const pt = particle;
        const model = this.getModel();
        const time = args.time;
        const elasticity = args.elasticity;
        const dtime = (time-pt.lastUpdateTime)*this.getSliderVariable('Speed')*0.01;
        pt.eulerStep(dtime, new Vec2(0,this.getGravity()));
        pt.lastUpdateTime = time;


        if(pt.position.y>this.boundHeight-pt.radius && pt.velocity.y>0){
            pt.velocity.y=-pt.velocity.y*elasticity;
        }
        if(pt.position.y<pt.radius && pt.velocity.y<0){
            pt.velocity.y=-pt.velocity.y*elasticity;
        }
        if(pt.position.x>this.boundWidth-pt.radius && pt.velocity.x>0){
            pt.velocity.x=-pt.velocity.x*elasticity;
        }
        if(pt.position.x<pt.radius && pt.velocity.x<0){
            pt.velocity.x=-pt.velocity.x*elasticity;
        }
        pt.setVertices(PointList2D.EquilateralTriangle(pt.position, 2*pt.radius*Math.cos(Math.PI/6)));
        // pt.setMatrix(Matrix3x3.Translation(pt.position).elements);
    }

    updateViewElements(){
        super.updateViewElements();
        if(this.particles===undefined){
            return;
        }
        var time = this.getComponentAppState('appTime');
        time = (time!==undefined)? time : 0;
        const model = this.getModel();
        var elasticity = this.getSliderVariable("Elasticity");
        elasticity = (elasticity!==undefined)? elasticity : 1.0;

        this.shape.setVertices(model.getVertices());
        this.shape.setAttributes(model.getProperty('attributes'));

        this.nextParticleToLaunchIndex = (this.nextParticleToLaunchIndex!==undefined)?this.nextParticleToLaunchIndex: 0;
        if(this.nextParticleToLaunchIndex>=this.nParticles){
            this.nextParticleToLaunchIndex=0;
        }
        if((time-this.lastLaunchTime)>(1000/(this.getSliderVariable("FireRate")*10*this.getSliderVariable("Speed")))){
            this.emitParticle(this.particles[this.nextParticleToLaunchIndex]);
            this.particles[this.nextParticleToLaunchIndex].lastUpdateTime =time;
            this.lastLaunchTime=time;
        }

        this.nextParticleToLaunchIndex=this.nextParticleToLaunchIndex+1;
        for(let p=0;p<this.particles.length;p++) {
            var particle = this.particles[p];
            if(!particle.hidden) {
                this.updateParticle(particle, {
                    time: time,
                    elasticity: elasticity
                });
            }
        }


        // for(let p=0;p<this.particles.length;p++){
        //     // let alpha = p/(this.nParticles-1);
        //     let pt = this.particles[p];
        //     let age = time-pt.t0;
        //     if(age>period){
        //         pt.t0=time-(age-period);
        //         pt.alpha = Math.random();
        //         pt.start = P2D((pbounds[0].x*alpha)+pbounds[1].x*(1-alpha), pbounds[1].y);
        //         if(pt.period!==period){
        //             pt.t0 = pt.t0-Math.random()*period
        //             pt.period = period;
        //         }
        //         pt.t0=pt.t0-Math.random()*period*(1/this.nParticles);
        //         pt.amp = height;
        //         pt.zig = flamezig;
        //         pt.width = width;
        //         pt.startSize = startsize;
        //         pt.flip = Math.random()>0.5;
        //     }
        //     let phase = ((time-pt.t0)%pt.period)/pt.period;
        //     let xoffset = pt.zig*pt.width*0.5*Math.sin(phase*2*Math.PI);
        //     if(pt.flip){
        //         xoffset=-xoffset;
        //     }
        //     let yoffset = -(phase*pt.amp);
        //     this.particles[p].setVertices(this.particleVerts(pt.start.plus(P2D(xoffset, yoffset)),
        //                     pt.startSize*(1-phase+0.1), phase*Math.PI*2
        //     ));
        //     this.particles[p].setAttribute('opacity', 1.0-phase);
        //     this.particles[p].setAttribute('fill', model.getAttribute('stroke'));
        // }
    }
}