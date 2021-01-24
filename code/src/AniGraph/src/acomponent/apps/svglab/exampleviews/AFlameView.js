import {Vec2, P2D, Matrix3x3, AView2D, ASliderSpec} from "AniGraph";
import tinycolor from "tinycolor2";


export default class AFlameView extends AView2D{
    static NParticlesTotal = 100;
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
            maxVal: 3,
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
            maxVal: 30,
            defaultValue: 15
        }),
        new ASliderSpec({
            name: 'Randomness',
            minVal: 0,
            maxVal: 1,
            defaultValue: 0
        })
    ]
    initGraphics() {
        super.initGraphics();
    }

    makeParticle(sidelen=10){
        const particle = this.createCurvedShapeWithVertices(this.particleVerts(P2D(0,0)), sidelen);
        this.addGraphic(particle);
        return particle;
    }

    particleVerts(location, sidelen=10, rotation=0){
        const h = 0.86602540378*sidelen;
        const offset = location? location : P2D(0,0);
        var verts = [
            P2D(-sidelen*0.5,-h/3),
            P2D(sidelen*0.5,-h/3),
            P2D(0,h*2/3)
        ];
        return Matrix3x3.Translation(offset).times(Matrix3x3.Rotation(rotation)).applyToPoints(verts);
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
        if(this._sliderVariableTypes===undefined) {
            this._sliderVariableTypes = {};
        }
        // this._initAppVariable("ParticleRadius", 5);
        // this._initAppVariable("LaunchSpeed", 1);
        // this._initAppVariable("FireRate", 1);
        // this._initAppVariable("Elasticity", 1);
        // this._initAppVariable("Randomness", 10);
        this._initAppVariable("Speed", 1);
        this._initAppVariable("Gravity", 1);

    }

    initSliderVariablesModel(){
        if(this._sliderVariableTypes===undefined) {
            this._sliderVariableTypes = {};
        }
        this._initModelVariable("ParticleRadius", 15);
        this._initModelVariable("LaunchSpeed", 0.5);
        this._initModelVariable("FireRate", 1);
        this._initModelVariable("Elasticity", 1);
        this._initModelVariable("Randomness", 10);
        // this._initModelVariable("Speed", 1);
        // this._initModelVariable("Gravity", 1);
    }

    getSliderVariable(name){
        if(this._sliderVariableTypes[name]==='app'){
            return this.getComponentAppState(name);
        }else{
            return this.getModel().getProperty(name);
        }
    }



    initGeometry() {
        super.initGeometry();
        this.nParticles = this.constructor.NParticlesTotal;
        this.particles = [];
        // this.getModel().setProperty("Frequency", 1);
        // this.getModel().setProperty("Aplitude", 3);
        // this.getModel().setProperty("ParticleSize", 10);

        this.initSliderVariablesApp();
        this.initSliderVariablesModel();

        for(let p=0;p<this.nParticles;p++){
            this.particles.push(this.makeParticle());
            this.updateParticle(this.particles[p], this.getModel(), 0, 1000, [P2D(), P2D()], 0, 0, 0, 0);
        }
    }

    updateParticle(pt, model, time, period, pbounds, width, amp, flamezig, startsize){
        let age = (pt.t0!==undefined)? time-pt.t0: undefined;
        if(age!==undefined){
            age = age*this.getSliderVariable("Speed");
        }
        if((age===undefined) || age>period){
            if(age===undefined){
                age=period*(1+Math.random());
                pt.t0=time;
            }else{
                pt.t0=time-((age-pt.period)%period);
            }

            pt.alpha = Math.random();
            pt.start = P2D((pbounds[0].x*pt.alpha)+pbounds[1].x*(1-pt.alpha), pbounds[1].y);
            if(pt.period!==period){
                pt.t0 = pt.t0-Math.random()*period
                pt.period = period;
            }
            pt.t0=pt.t0-Math.random()*period*(0.1/this.nParticles);
            pt.amp = amp;
            pt.zig = flamezig;
            pt.width = width;
            pt.startSize = startsize;
            pt.flip = Math.random()>0.5;
            pt.randxPhase = Math.random();
        }

        let phase = ((time-pt.t0)%pt.period)/pt.period;
        let xoffset = pt.zig*pt.width*0.5*Math.sin((phase+pt.randxPhase)*2*Math.PI);
        if(pt.flip){
            xoffset=-xoffset;
        }
        let yoffset = -(phase*pt.amp);
        pt.setVertices(this.particleVerts(pt.start.plus(P2D(xoffset, yoffset)),
            pt.startSize*(1-phase+0.1), phase*Math.PI*2
        ));
        var op = (1-phase)*0.75;
        pt.setAttribute('opacity', op*op);
        var color = tinycolor('#ff0');
        color = color.spin(phase*-50);
        color= color.darken(phase*20);
        pt.setAttribute('fill', color.toString());
        pt.setAttribute('linewidth', 0);
    }

    updateViewElements(){
        super.updateViewElements();
        var time = this.getComponentAppState('appTime');
        time = (time!==undefined)? time : 0;
        const model = this.getModel();
        var vertices = model.getVertices();

        var freq = this.getSliderVariable("FireRate");
        var amplitude = this.getSliderVariable("LaunchSpeed")*10;
        amplitude = (amplitude!==undefined)? amplitude : 1.0
        var flamezig = this.getSliderVariable("Elasticity");
        flamezig = (flamezig!==undefined)? flamezig : 1.0;
        this.shape.setVertices(model.getVertices());
        this.shape.setAttributes(model.getProperty('attributes'));
        const modelbox = model.getWorldSpaceBBoxCorners();
        const center = modelbox[0].plus(modelbox[2]).times(0.5);
        const pbounds = Vec2.GetPointBounds(modelbox);
        const width = pbounds[1].x-pbounds[0].x;
        const height = (pbounds[1].y-pbounds[0].y)*amplitude;
        const particleSize = this.getSliderVariable("ParticleRadius");
        const startsize = (5*width/this.nParticles)*((particleSize!==undefined)? particleSize : 1);
        const period = 1000/freq;
        for(let p=0;p<this.particles.length;p++) {
            this.updateParticle(this.particles[p], model, time, period, pbounds, width, height, flamezig, startsize);
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