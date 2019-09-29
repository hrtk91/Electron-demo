export { Vector2 }

/* ベクトル */
class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public normalize() {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y)
        this.x *= 1 / mag;
        this.y *= 1 / mag;
    }

    public mul(mul: number) {
        this.x *= mul;
        this.y *= mul;
    }
}
