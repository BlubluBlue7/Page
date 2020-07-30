import GTSimpleSpriteAssembler2D from "./GTSimpleSpriteAssembler2D";

const gfx = cc.gfx

let vfmtPosUvColorFront = new gfx.VertexFormat([
    { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
    { name: "a_isFront", type: gfx.ATTR_TYPE_FLOAT32, num: 1},
]);

export default class VerletAssembler extends GTSimpleSpriteAssembler2D {

    init(comp: cc.RenderComponent) {
        super.init(comp);

        //@ts-ignore
        let segmentCount = comp.pointsCount - 1;
        this.verticesCount = 4 * segmentCount;
        this.indicesCount = 6 * segmentCount;
        this.floatsPerVert = 6;
        
        //@ts-ignore
        this._renderData = new cc.RenderData();
        this._renderData.init(this);

        // this.initLocal();
        // this.initData();

        let data = this._renderData;
        // createFlexData支持创建指定格式的renderData
        data.createFlexData(0, this.verticesCount, this.indicesCount, this.getVfmt());

        // 顶点数固定的情况下索引不变化
        let indices = data.iDatas[0];
        let count = indices.length / 6;
        for (let i = 0, idx = 0; i < count; i++) {
            let vertextID = i * 4;
            indices[idx++] = vertextID;
            indices[idx++] = vertextID+1;
            indices[idx++] = vertextID+2;
            indices[idx++] = vertextID+1;
            indices[idx++] = vertextID+3;
            indices[idx++] = vertextID+2;
        }
    }

    getVfmt() {
        return vfmtPosUvColorFront;
    }

    getBuffer() {
        //@ts-ignore
        return cc.renderer._handle.getBuffer("mesh", this.getVfmt());
    }
    
    public updateRenderData (comp: any) {
        if (comp) {
            let pointList: cc.Vec2[] = comp.getPointList()
            let pointNum: number = pointList.length
            if (pointNum < 2) {
                return
            }

            let node = comp.node
            let height = node.height
            let width = node.width
            let posX = - width * node.anchorX
            let posY = - height * node.anchorY

            let gapU = 1 / (pointNum - 1)
            let lastU = 0
            let nextU = 0

            let floatsPerVert = this.floatsPerVert;
            let verts = this._renderData.vDatas[0];
            let dstOffset;          // index of verts[]
            for (let i = 1; i < pointNum; i++) {
                let lastPoint = pointList[i - 1]
                let nextPoint = pointList[i]
                nextU = lastU + gapU

                // 顶点和质点一一对应
                // same as updateVerts()
                dstOffset = floatsPerVert * (i-1) * 4;
                verts[dstOffset]     = posX + lastPoint.x;
                verts[dstOffset + 1] = posY + lastPoint.y;
                verts[dstOffset + 2] = lastU;
                verts[dstOffset + 3] = 1;
                dstOffset += floatsPerVert;

                verts[dstOffset]     = posX + nextPoint.x;
                verts[dstOffset + 1] = posY + nextPoint.y;
                verts[dstOffset + 2] = nextU;
                verts[dstOffset + 3] = 1;
                dstOffset += floatsPerVert;

                verts[dstOffset]     = posX + lastPoint.x;
                verts[dstOffset + 1] = posY + height + lastPoint.y;
                verts[dstOffset + 2] = lastU;
                verts[dstOffset + 3] = 0;
                dstOffset += floatsPerVert;

                verts[dstOffset]     = posX + nextPoint.x;
                verts[dstOffset + 1] = posY + height + nextPoint.y;
                verts[dstOffset + 2] = nextU;
                verts[dstOffset + 3] = 0;
                // dstOffset += floatsPerVert;

                lastU = nextU
            }
        }
    }
}