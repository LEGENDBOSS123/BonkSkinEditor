export class Layer {

    static properties = new Set(['id', 'scale', 'angle', 'x', 'y', 'flipX', 'flipY', 'color']);

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
        for (let key of Object.keys(json)) {
            if (!Layer.properties.has(key)) {
                throw new Error(`Unknown property in Layer JSON: ${key}`);
            }
        }
        for(let property of Layer.properties) {
            if (!(property in json)) {
                throw new Error(`Missing property in Layer JSON: ${property}`);
            }
        }
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