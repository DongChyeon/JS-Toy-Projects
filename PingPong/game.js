/* 
아래에 있는 플레이어가 선공 - 두번씩 서브 (서브 방식은 드래그로)
왼쪽 오른쪽 경계선을 넘어가면 아웃
11점을 먼저 달성하는 쪽이 승리
*/

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'white';
        this.radius = 20;
        this.dx = 0;
        this.dy = 0;
        this.speed = 0.05;
    }

    update() {
        // 라켓에 충돌할 시 공의 이동 방향이 바뀜
        if (collision(this, player1)) {
            this.y = player1.top - this.radius;
            this.dx *= -1.1;
            this.dy *= -1.1;
        } else if (collision(this, player2)) {
            this.y = player2.bottom + this.radius;
            this.dx *= -1.1;
            this.dy *= -1.1;
        }

        this.x += this.dx;
        if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) this.dx *= -1;
        this.y += this.dy;

        getScore(ball);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
}

class Racket {
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.size = 100;
        this.player = player;
        this.speed = 10;
    }

    update() {
        if (this.player == PLAYER_BOTTOM) {
            if (keys[37]) player1.x -= player1.speed;
            if (keys[39]) player1.x += player1.speed;
            if (keys[38]) player1.y -= player1.speed;
            if (keys[40]) player1.y += player1.speed;
            // 이동 범위를 벗어나지 않게 함
            if (player1.x < 0) player1.x = 0;
            if (player1.x > canvas.width - player1.size) player1.x = canvas.width - player1.size;
            if (player1.y < canvas.height / 2) player1.y = canvas.height / 2;
            if (player1.y > canvas.height - 20) player1.y = canvas.height - 20;
        } else if (this.player == PLAYER_TOP) {
            if (keys[65]) player2.x -= player2.speed;
            if (keys[68]) player2.x += player2.speed;
            if (keys[87]) player2.y -= player2.speed;
            if (keys[83]) player2.y += player2.speed;
            // 이동 범위를 벗어나지 않게 함
            if (player2.x < 0) player2.x = 0;
            if (player2.x > canvas.width - player2.size) player2.x = canvas.width - player2.size;
            if (player2.y < 0) player2.y = 0;
            if (player2.y > (canvas.height / 2) - 20) player2.y = (canvas.height / 2) - 20;
        }
    }

    draw() {
        if (this.player == PLAYER_TOP) {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.size, 10);
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y + 10, this.size, 10);
        } else if (this.player == PLAYER_BOTTOM) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.size, 10);
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y + 10, this.size, 10);
        }
    }
}

const PLAYER_TOP = -1;
const PLAYER_BOTTOM = -2;

const canvas = document.getElementById('canvas');
const status = document.getElementById('status');
canvas.width = 450;
canvas.height = 630;
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext('2d');
const ball = new Ball(canvas.width * 0.5, canvas.height - 50);
const player1 = new Racket((canvas.width - 100) * 0.5, canvas.height - 30, PLAYER_BOTTOM);
const player2 = new Racket((canvas.width - 100) * 0.5, 10, PLAYER_TOP);

// 키보드 입력을 처리하기 위한 딕셔너리
const keys = {};
keys[37] = false;
keys[39] = false;
keys[38] = false;
keys[40] = false;
keys[65] = false;
keys[68] = false;
keys[87] = false;
keys[83] = false;

// 드래그해서 서브하는 과정을 처리하기 위한 변수들
let drag = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let running = true;
let turn = PLAYER_BOTTOM;
let player1_score = 0;
let player2_score = 0;

function render() {
    // 탁구대를 그림
    ctx.fillStyle = 'rgba(32,70,141, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.5, 0);
    ctx.lineTo(canvas.width * 0.5, canvas.height);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.5);
    ctx.lineTo(canvas.width, canvas.height * 0.5);
    ctx.stroke();
    ctx.closePath();

    // 공과 라켓의 위치를 수시로 업데이트 해서 그림
    // 드래그하는 동안은 공의 움직임을 멈춤
    if (!drag) ball.update();
    ball.draw();

    player1.update();
    player2.update();
    player1.draw();
    player2.draw();

    // 어느 한 쪽 플레이어가 승리하지 않았다면 게임 계속 진행
    if (running == !checkWin()) requestAnimationFrame(render);
}

// 드래그할 때 힘의 세기를 화살표로 그림
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
    ctx.lineWidth = 30;
    ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);

    ctx.moveTo(length - aLength, -aWidth);
    ctx.lineTo(length, 0);
    ctx.lineTo(length - aLength, aWidth);

    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// 플레이어가 점수를 획득했는지 판별하는 함수
function getScore(ball) {
    if (ball.y + ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        if (ball.y + ball.radius <= 0) player1_score += 1;
        if (ball.y + ball.radius >= canvas.height) player2_score += 1;

        let msg = player1_score + ' : ' + player2_score;

        // 서브는 2번씩 차례대로 돌아감
        if ((player1_score + player2_score) % 2 == 0) {
            (turn == PLAYER_BOTTOM) ? turn = PLAYER_TOP : turn = PLAYER_BOTTOM;
        }

        (turn == PLAYER_BOTTOM) ? msg += "<br>플레이어 1의 서비스" : msg += "<br>플레이어 2의 서비스";
        status.innerHTML = msg;

        ball.x = canvas.width / 2;
        (turn == PLAYER_BOTTOM) ? ball.y = canvas.height - 50 : ball.y = 50;

        ball.dx = 0;
        ball.dy = 0;
    }
}

// 어느 한 쪽 플레이어가 승리헀는지 판별하는 함수
function checkWin() {
    if (player1_score == 11) {
        msg = "플레이어 1의 승리입니다<br>다시 할려면 새로고침하시오";
        status.innerHTML = msg;
        return true;
    } else if (player2_score == 11) {
        msg = "플        running = false;레이어 2의 승리입니다<br>다시 할려면 새로고침하시오";
        status.innerHTML = msg;
        return true;
    }

    return false;
}

// 라켓과 공이 충돌했는지 판별하는 함수
function collision(ball, racket) {
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    racket.top = racket.y;
    racket.bottom = racket.y + 20;
    racket.left = racket.x;
    racket.right = racket.x + racket.size;

    return (ball.right > racket.left && ball.bottom > racket.top && ball.left < racket.right && ball.top < racket.bottom);
}

function keyDown(event) {
    if (event.keyCode == 37) keys[37] = true;
    if (event.keyCode == 39) keys[39] = true;
    if (event.keyCode == 38) keys[38] = true;
    if (event.keyCode == 40) keys[40] = true;

    if (event.keyCode == 65) keys[65] = true;
    if (event.keyCode == 68) keys[68] = true;
    if (event.keyCode == 87) keys[87] = true;
    if (event.keyCode == 83) keys[83] = true;

    event.preventDefault();
}

function keyUp(event) {
    if (event.keyCode == 37) keys[37] = false;
    if (event.keyCode == 39) keys[39] = false;
    if (event.keyCode == 38) keys[38] = false;
    if (event.keyCode == 40) keys[40] = false;

    if (event.keyCode == 65) keys[65] = false;
    if (event.keyCode == 68) keys[68] = false;
    if (event.keyCode == 87) keys[87] = false;
    if (event.keyCode == 83) keys[83] = false;

    event.preventDefault();
}

function mouseDown(event) {
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;

    // 볼을 클릭했을 시에만 드래그 모드로 바꿈
    if (ball.x + ball.radius >= startX && ball.x - ball.radius <= startX && ball.y + ball.radius >= startY && ball.y - ball.radius <= startY) {
        // 볼이 너무 빠르게 움직일 시 드래그를 못하게 함
        if (ball.dx > 10 && ball.dy > 10) return;
        drag = true;
        startX = ball.x;
        startY = ball.y;
    }
}

function mouseMove(event) {
    if (!drag) return;
    endX = event.clientX - rect.left;
    endY = event.clientY - rect.top;

    drawArrow(startX, startY, endX, endY);
}

function mouseUp(event) {
    if (drag) {
        drag = false;
        if (Math.abs(startX - endX) + Math.abs(startY - endY) < 20) return;

        let power = Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2));
        let radian = Math.atan2((endX - startX), (endY - startY));
        ball.dx = power * Math.sin(radian) * ball.speed;
        ball.dy = power * Math.cos(radian) * ball.speed;
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
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    render();
}