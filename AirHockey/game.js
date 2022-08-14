/*
개선한 점
1. 반복된 곱하기 0.6 연산으로 소수점이 터무니 없이 많아지지 않도록 제한
2. 볼이 좌표 위치가 항상 정수가 되도록 제한

To-do
1. 이동할 수 없는 곳에 라켓이 움직임
2. 타이머를 적용해 타이머가 종료시 더 많은 점수를 획득한 쪽이 승리
*/

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.nx = x;
        this.ny = y;
        this.velocity = { x: 0, y: 0 };
        this.color = 'red';
        this.radius = 20;
        this.mass = 1;
        this.corFactor = 1.2;
    }

    // x축과 y축으로 속도를 결정하는 함수
    getVelocity(racket) {
        return {
            x: ((this.mass - racket.mass * this.corFactor) / (this.mass + racket.mass) * this.velocity.x) + ((racket.mass + racket.mass * this.corFactor) / (this.mass + racket.mass) * racket.velocity.x),
            y: ((this.mass - racket.mass * this.corFactor) / (this.mass + racket.mass) * this.velocity.y) + ((racket.mass + racket.mass * this.corFactor) / (this.mass + racket.mass) * racket.velocity.y)
        };
    }

    // 라켓과 공이 충돌했는지 판별하는 함수
    collision(racket) {
        // 중심점 좌표 사이의 거리가 두 반지름의 합보다 작으면 충돌
        let distanceUnits = Math.sqrt(Math.pow(Math.abs(this.x - racket.x), 2) + Math.pow(Math.abs(this.y - racket.y), 2));
        let sumRadius = this.radius + racket.radius;

        return (distanceUnits < sumRadius);
    }

    update() {
        console.log({ x: this.x, y: this.y });
        console.log(this.velocity);

        // 라켓에 충돌할 시 공의 이동 방향이 바뀜
        if (this.collision(player1)) {
            this.velocity = this.getVelocity(player1)
        } else if (this.collision(player2)) {
            this.velocity = this.getVelocity(player2);
        }

        getScore(this);

        this.nx = this.x + this.velocity.x;
        this.ny = this.y + this.velocity.y;
        if (this.nx + this.radius >= canvas.width) {
            this.nx = canvas.width - this.radius;
            this.velocity.x = Math.round((this.velocity.x * -0.6) * 100000) / 100000;
        }
        if (this.nx - this.radius <= 0) {
            this.nx = this.radius;
            this.velocity.x = Math.round((this.velocity.x * -0.6) * 100000) / 100000;
        }
        if (this.ny + this.radius >= canvas.height) {
            this.ny = canvas.height - this.radius;
            this.velocity.y = Math.round((this.velocity.y * -0.6) * 100000) / 100000;
        }
        if (this.ny - this.radius <= 0) {
            this.ny = this.radius;
            this.velocity.y = Math.round((this.velocity.y * -0.6) * 100000) / 100000;
        }
        this.x = Math.round(this.nx);
        this.y = Math.round(this.ny);

        let cnt = 0;
        // 공과 라켓이 겹치지 않도록 함
        if (this.collision(player1) || this.collision(player2)) {
            this.velocity = { x: this.velocity.x * -1, y: this.velocity.y * -1 };
            while (this.collision(player1) || this.collision(player2)) {
                // 무한 계산 방지
                if (cnt == 10) break;
                this.nx = this.x + this.velocity.x;
                this.ny = this.y + this.velocity.y;
                if (this.nx + this.radius >= canvas.width) {
                    this.nx = canvas.width - this.radius;
                    this.velocity.x = Math.round((this.velocity.x * -0.6) * 100000) / 100000;
                }
                if (this.nx - this.radius <= 0) {
                    this.nx = this.radius;
                    this.velocity.x = Math.round((this.velocity.x * -0.6) * 100000) / 100000;
                }
                if (this.ny + this.radius >= canvas.height) {
                    this.y = canvas.height - this.radius;
                    this.velocity.y = Math.round((this.velocity.y * -0.6) * 100000) / 100000;
                }
                if (this.ny - this.radius <= 0) {
                    this.ny = this.radius;
                    this.velocity.y = Math.round((this.velocity.y * -0.6) * 100000) / 100000;
                }
                this.x = Math.round(this.nx);
                this.y = Math.round(this.ny);
                cnt += 1;
            }
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

class Racket {
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.nx = x;
        this.ny = y;
        this.velocity = { x: 0, y: 0 };
        this.color = 'red';
        this.radius = 30;
        this.mass = 3;
        this.player = player;
        this.speed = 5;
    }

    update() {
        this.velocity = { x: 0, y: 0 };
        if (this.player == PLAYER_BOTTOM) {
            if (keys[37]) this.velocity.x -= this.speed;
            if (keys[39]) this.velocity.x += this.speed;
            if (keys[38]) this.velocity.y -= this.speed;
            if (keys[40]) this.velocity.y += this.speed;
            this.nx = this.x + this.velocity.x;
            this.ny = this.y + this.velocity.y;
            // 상하 이동 범위를 벗어나지 않게 함
            if (this.ny < canvas.height / 2 + this.radius + ball.radius) this.ny = canvas.height / 2 + this.radius + ball.radius;
            if (this.ny > canvas.height - this.radius) this.ny = canvas.height - this.radius;
        } else if (this.player == PLAYER_TOP) {
            if (keys[65]) this.velocity.x -= this.speed;
            if (keys[68]) this.velocity.x += this.speed;
            if (keys[87]) this.velocity.y -= this.speed;
            if (keys[83]) this.velocity.y += this.speed;
            this.nx = this.x + this.velocity.x;
            this.ny = this.y + this.velocity.y;
            // 상하이동 범위를 벗어나지 않게 함
            if (this.ny < this.radius) this.ny = this.radius;
            if (this.ny > canvas.height / 2 - this.radius - ball.radius) this.ny = canvas.height / 2 - this.radius - ball.radius;
        }
        // 좌우 이동 범위를 벗어나지 않게 함
        if (this.nx < this.radius) this.nx = this.radius;
        if (this.nx > canvas.width - this.radius) this.nx = canvas.width - this.radius;

        // 이 부분만 어떻게든 고쳐보자
        // 상하 사이드에서 공이 바로 붙어있을 때 라켓을 움직이지 못하게 함
        if (this.ny >= canvas.height - ball.radius * 2 - this.radius && ball.y >= canvas.height - ball.radius && ball.collision(this)) this.ny = canvas.height - ball.radius * 2 - this.radius;
        if (this.ny <= ball.radius * 2 + this.radius && ball.y <= ball.radius && ball.collision(this)) this.ny = ball.radius * 2 + this.radius;
        // 좌우 사이드에서 공이 바로 붙어있을 때 라켓을 움직이지 못하게 함
        if (this.nx >= canvas.width - ball.radius * 2 - this.radius && ball.x >= canvas.width - ball.radius && ball.collision(this)) this.nx = canvas.width - ball.radius * 2 - this.radius;
        if (this.nx <= ball.radius * 2 + this.radius && ball.x <= ball.radius && ball.collision(this)) this.nx = ball.radius * 2 + this.radius;

        this.x = Math.round(this.nx);
        this.y = Math.round(this.ny);
    }

    draw() {
        ctx.lineWidth = 3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
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
const ball = new Ball(canvas.width * 0.5, canvas.height - 150);
const player1 = new Racket(canvas.width * 0.5, canvas.height - 60, PLAYER_BOTTOM);
const player2 = new Racket(canvas.width * 0.5, 60, PLAYER_TOP);

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

let running = true;
let turn = PLAYER_BOTTOM;
let player1_score = 0;
let player2_score = 0;

function render() {
    // 탁구대를 그림
    ctx.fillStyle = 'rgba(32,70,141, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.5);
    ctx.lineTo(canvas.width, canvas.height * 0.5);
    ctx.arc(canvas.width * 0.5, canvas.height * 0.5, 50, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width * 2 / 3, 0);
    ctx.lineTo(canvas.width * 2 / 3 - 20, 20);
    ctx.lineTo(canvas.width / 3 + 20, 20);
    ctx.lineTo(canvas.width / 3, 0);
    ctx.moveTo(canvas.width / 3, canvas.height);
    ctx.lineTo(canvas.width * 2 / 3, canvas.height);
    ctx.lineTo(canvas.width * 2 / 3 - 20, canvas.height - 20);
    ctx.lineTo(canvas.width / 3 + 20, canvas.height - 20);
    ctx.lineTo(canvas.width / 3, canvas.height)
    ctx.fill();
    ctx.closePath();

    // 공과 라켓의 위치를 수시로 업데이트 해서 그림
    ball.update();
    ball.draw();

    player1.update();
    player2.update();
    player1.draw();
    player2.draw();

    // 어느 한 쪽 플레이어가 승리하지 않았다면 게임 계속 진행
    if (!running == checkWin()) requestAnimationFrame(render);
}

// 플레이어가 점수를 획득했는지 판별하는 함수
function getScore(ball) {
    if (ball.y - ball.radius <= 20 && ball.x + ball.radius <= canvas.width * 2 / 3 && ball.x >= canvas.width / 3) {
        turn = PLAYER_TOP
        player1_score += 1;

        player1.x = canvas.width * 0.5;
        player1.y = canvas.height - 60;
        player2.x = canvas.width * 0.5;
        player2.y = 60;
        ball.velocity = { x: 0, y: 0 };

        let msg = player1_score + ' : ' + player2_score;

        (turn == PLAYER_BOTTOM) ? msg += "<br>플레이어 1의 서비스" : msg += "<br>플레이어 2의 서비스";
        status.innerHTML = msg;

        ball.x = canvas.width / 2;
        (turn == PLAYER_BOTTOM) ? ball.y = canvas.height - 150 : ball.y = 150;

        ball.dx = 0;
        ball.dy = 0;
    }
    if (ball.y + ball.radius >= canvas.height - 20 && ball.x + ball.radius <= canvas.width * 2 / 3 && ball.x >= canvas.width / 3) {
        turn = PLAYER_BOTTOM;
        player2_score += 1;

        player1.x = canvas.width * 0.5;
        player1.y = canvas.height - 60;
        player2.x = canvas.width * 0.5;
        player2.y = 60;
        ball.velocity = { x: 0, y: 0 };

        let msg = player1_score + ' : ' + player2_score;

        (turn == PLAYER_BOTTOM) ? msg += "<br>플레이어 1의 서비스" : msg += "<br>플레이어 2의 서비스";
        status.innerHTML = msg;

        ball.x = canvas.width / 2;
        (turn == PLAYER_BOTTOM) ? ball.y = canvas.height - 150 : ball.y = 150;

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
        msg = "플레이어 2의 승리입니다<br>다시 할려면 새로고침하시오";
        status.innerHTML = msg;
        return true;
    }

    return false;
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

function init() {
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    render();
}