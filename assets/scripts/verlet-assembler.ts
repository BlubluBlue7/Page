import PageEffectAssemblerBase from "./page-effect-assembler-base";

const gfx = cc.gfx

let vfmtPosUvColorFront = new gfx.VertexFormat([
    { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
    { name: "a_isFront", type: gfx.ATTR_TYPE_FLOAT32, num: 1},
]);

export default class VerletAssembler extends PageEffectAssemblerBase {

    init(comp: cc.RenderComponent) {
        super.init(comp);

        //@ts-ignore
        let segmentCount = comp.pointsCount - 1;
        this.verticesCount = 4 * segmentCount;
        this.indicesCount = 6 * segmentCount;
        this.floatsPerVert = 6;
        
        this.initData();
    }

    getVfmt() {
        return vfmtPosUvColorFront;
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
            let verts = this.renderData.vDatas[0];
            // 写verts时的下标
            let dstOffset = 0;
            for (let i = 1; i < pointNum; i++) {
                let lastPoint = pointList[i - 1]
                let nextPoint = pointList[i]
                nextU = lastU + gapU

                // 顶点和质点一一对应
                // 顶点数据写入verts
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

                lastU = nextU
            }

            this.updateColor(comp, null);
        }
    }
}