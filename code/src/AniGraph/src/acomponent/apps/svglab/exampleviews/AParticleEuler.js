import {P2D, Vec2} from "../../../../amath"




export default class AParticleEuler extends ASVGParticle{
    constructor(args) {
        super(args);
        this.position = (args && args.position)? args.position : P2D(0,0);
        this.velocity = (args && args.velocity)? args.velocity : new Vec2(0,0);
        this.mass = (args && args.mass)? args.mass : 1;
        this.radius = (args && args.radius)? args.radius : 10;
    }

    eulerStep(stepsize, force){
        force = (force!==undefined) ? force : new Vec2(0.0,0.0);
        const acceleration = force.times(stepsize/this.mass);

        this.position = this.position.plus(this.velocity.times(stepsize));
        this.velocity = this.velocity.plus(acceleration);
        this.lifetime = this.lifetime+stepsize;
    }
}