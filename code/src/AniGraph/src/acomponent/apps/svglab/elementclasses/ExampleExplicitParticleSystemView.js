import {PointList2D, Vec2, ASVGParticle, Matrix3x3, P2D} from "AniGraph";

export default class ExampleExplicitParticleSystemView extends ASVGParticle{
    constructor(args){
        super(args);

        this._position = (args && args.position)? args.position : new Vec2(0,0);
        this._radius = (args && args.radius)? args.radius : 10;
        this.updateVertices();

        // add velocity if you are doing euler integration
        // this.velocity = new Vec2(...)...

        //Or, you could do the full state as one big vector. *OR* you could even do the whole particle
        //system as one long vector of degrees of freedom. If we were doing this in numpy, that would probably
        //make a big performance difference. In Javascript, probably not quite as significant.
    }

    updateParticle(args){
        // customize this...
        const time = (args && args.time)? args.time:0;
        const age = (time-this.t0)/1000;//in seconds

        const period = 1/this.frequency;
        const phase = (age%period)/period;
        const orbit = this.orbitRadius;
        particle.setPosition(this.getModel().getWorldPosition().plus(
            Matrix3x3.Rotation(phase*2*Math.PI).times(P2D(orbit,0))
        ));
    }


    /** Get set position */
    get position(){return this._position;}

    setPosition(position){
        this._position = position;
        this.updateVertices();
    }

    /** Get set radius */
    get radius(){return this._radius;}
    setRadius(radius){
        this._radius = radius;
        this.updateVertices();
    }

    updateVertices(){
        this.setVertices(PointList2D.EquilateralTriangle(this.position,  2*this.radius*Math.cos(Math.PI/6)));
    }
}