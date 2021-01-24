import {P2D} from "./Vec2";
import {Matrix3x3} from "./index";


export default class PointList2D extends Array{
    static EquilateralTriangle(location, sidelen=10, rotation=0){
        const h = 0.86602540378*sidelen;
        const offset = location? location : P2D(0,0);
        var verts = [
            P2D(-sidelen*0.5,-h/3),
            P2D(sidelen*0.5,-h/3),
            P2D(0,h*2/3)
        ];
        return Matrix3x3.Translation(offset).times(Matrix3x3.Rotation(rotation)).applyToPoints(verts);
    }
}


// PointList2D.from([
//     P2D(1,2),
//     P2D(3,4)
//     P2D(5,6)
// ])

// const newarray = new PointList2D(p1, p2, p3)
// = PointList2D.of(...normalArray);