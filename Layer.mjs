export class Layer {
    constructor(id) {
        this.id = id;
        this.scale = 0.25;
        this.angle = 0;
        this.x = 0;
        this.y = 0;
        this.flipX = false;
        this.flipY = false;
        this.color = 0xffffff;
    }


    static fromJSON(json){
        const layer = new Layer(json.id);
        layer.scale = json.scale;
        layer.angle = json.angle;
        layer.x = json.x;
        layer.y = json.y;
        layer.flipX = json.flipX;
        layer.flipY = json.flipY;
        layer.color = json.color;
        return layer;
    }
}