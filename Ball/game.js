class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'blue';
        this.radius = 50;
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        this.x += this.dx;
        this.dx *= 0.995;
        if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
            this.dx *= -1;
            if (Math.abs(this.dx) < 2) this.dx *= 2;
        }

        this.y += this.dy;
        this.dy *= 0.995;
        if (this.y + this.radius >= canvas.height || this.y - this.radius <= 0) {
            this.dy *= -1;
            if (Math.abs(this.dy) < 2) this.dy *= 2;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 480;
canvas.height = 640;
const ball = new Ball((canvas.width) * 0.5, (canvas.height) * 0.5)

let rect = canvas.getBoundingClientRect();
let drag = false;
let x2 = 0;
let y2 = 0;
let mouseX = 0;
let mouseY = 0;

function animate() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 드래그하는 동안은 공의 움직임을 멈춤
    if (!drag) ball.update();
    ball.draw();
    requestAnimationFrame(animate);
}

function drawArrow(x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let angle = Math.atan2(dy, dx);
    let length = Math.sqrt(dx * dx + dy * dy);
    let aWidth = 20;
    let aLength = 20;

    ctx.translate(x0, y0);
    ctx.rotate(angle);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 50;
    ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);

    ctx.moveTo(length - aLength, -aWidth);
    ctx.lineTo(length, 0);
    ctx.lineTo(length - aLength, aWidth);

    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function mouseDown(event) {
    x2 = event.clientX - rect.left;
    y2 = event.clientY - rect.top;

    // 볼을 클릭했을 시에만 드래그 모드로 바꿈
    if (ball.x + ball.radius >= x2 && ball.x - ball.radius <= x2 && ball.y + ball.radius >= y2 && ball.y - ball.radius <= y2) {
        // 볼이 너무 빠르게 움직일 시 드래그를 못하게 함
        if (ball.dx > 10 && ball.dy > 10) return;
        drag = true;
        x2 = ball.x;
        y2 = ball.y;
    }
}

function mouseMove(event) {
    if (!drag) return;
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    drawArrow(x2, y2, mouseX, mouseY);
}

function mouseUp(event) {
    if (drag) {
        drag = false;
        if (Math.abs(x2 - mouseX) + Math.abs(y2 - mouseY) < 20) return;

        ball.dx = (mouseX - x2) * 0.3;
        ball.dy = (mouseY - y2) * 0.3;
    }
}

function mouseOut(event) {
    drag = false;
}

function init() {
    canvas.ondragstart = () => { return false; }
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseOut, false);

    animate();
}