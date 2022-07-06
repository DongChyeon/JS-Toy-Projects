// 몇 수에 어떤 돌을 놓았는지 저장할 스택
class Stack {
	constructor() {
		this.data = [];
	}
	push(item) {
		this.data.push(item);
	}
	pop() {
		return this.data.pop();
	}
}

// 오목판에 놓여질 돌
class goStone {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
	}
	setColor(color) {
		this.color = color;
	}
}

const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const undoBtn = document.getElementById("undo");
const ctx = canvas.getContext("2d");
const stack = new Stack();
const goStones = new Array(16);
for (var i = 0; i < goStones.length; i++) {
	goStones[i] = new Array(16);
}

// 게임의 진행 여부
let running = true;
// 현재 플레이어의 턴
let turn = "black";
let turnCount = 1;

canvas.addEventListener("click", placeStone);
undoBtn.addEventListener("click", undo);

// 게임 초기화
function init() {
	for (let y = 1; y <= 15; y++) {
		for (let x = 1; x <= 15; x++) {
			goStones[y][x] = new goStone(x, y, "none");
		}
	}
	update();
	turn = "black";
	turnCount = 1;
}

// 정해진 좌표에 흑돌을 그림
function drawBlack(x, y) {
	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.arc(x * 40, y * 40, 18, 0, Math.PI * 2, true);
	ctx.fill();
	ctx.closePath();
}

// 정해진 좌표에 백돌을 그림
function drawWhite(x, y) {
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.arc(x * 40, y * 40, 18, 0, Math.PI * 2, true);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

// 게임 진행 사항 업데이트
function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	// 바둑판 그리기
	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";
	for (let y = 1; y < 15; y++) {
		for (let x = 1; x < 15; x++) {
			ctx.strokeRect(40 * y, 40 * x, 40, 40);
			// 바둑판 중간중간에 구분점을 그려줌
			if ((y == 4 && x == 4) || (y == 4 && x == 12) || (y == 8 && x == 8) || (y == 12 && x == 4) || (y == 12 && x == 12)) {
				ctx.beginPath();
				ctx.arc(x * 40, y * 40, 3, 0, Math.PI * 2, true);
				ctx.fill();
				ctx.closePath();
			}
		}
	}

	// 오목판에 돌을 그려줌
	for (let y = 1; y <= 15; y++) {
		for (let x = 1; x <= 15; x++) {
			if (goStones[y][x].color == "black") drawBlack(x, y);
			else if (goStones[y][x].color == "white") drawWhite(x, y);
		}
	}

	if (running) {
		// 상태 메시지 변경
		let message = "현재 턴 : ";
		turn == "black" ? message += "●<br>" : message += "○<br>";
		message += turnCount + " 번째 턴입니다.";
		status.innerHTML = message;
	} else {
		// 한쪽이 승리한 경우 몇번째 수에 어떤 돌을 놓았는지 출력
		for (let i = 0; i < stack.data.length; i++) {
			ctx.font = "bold 20px sans-serif";
			ctx.textAlign = "center";
			ctx.fillStyle = "red";
			ctx.fillText(i + 1, stack.data[i].x * 40, stack.data[i].y * 40 + 7);
		}
	}
}

// 승리 체크 함수 (승리한 플레이어가 있을 시 true 반환)
function checkWin() {
	for (let y = 1; y <= 15; y++) {
		for (let x = 1; x <= 15; x++) {
			// 바둑돌이 놓여진 곳이라면 승리 조건 체크 시작
			if (goStones[y][x].color != "none") {
				if (checkRight(x, y) || checkDown(x, y) || checkUpRight(x, y) || checkDownRight(x, y)) {
					if (goStones[y][x].color == "black") {
						message = "흑돌이 " + turnCount + " 턴만에 승리하였습니다.<br>"
					} else {
						message = "백돌이 " + turnCount + " 턴만에 승리하였습니다.<br>";
					}
					message += "다시 시작할려면 새로고침 하시오.";
					status.innerHTML = message;

					return true;
				}
			}
		}
	}
	return false;
}

// 가로로 승리 조건 체크
function checkRight(x, y) {
	var target = goStones[y][x].color;
	for (let i = 1; i < 5; i++) {
		// 인덱스 초과 방지
		if (x + 4 > 15) {
			return false;
		}
		if (goStones[y][x + i].color != target) {
			return false;
		}
	}
	return true;
}

// 세로로 승리 조건 성립
function checkDown(x, y) {
	var target = goStones[y][x].color;
	for (let i = 1; i < 5; i++) {
		// 인덱스 초과 방지
		if (y + 4 > 15) {
			return false;
		}
		if (goStones[y + i][x].color != target) {
			return false;
		}
	}
	return true;
}

// / 방향 대각선으로 승리 조건 성립
function checkUpRight(x, y) {
	var target = goStones[y][x].color;
	for (let i = 1; i < 5; i++) {
		// 인덱스 초과 방지
		if (x + 4 > 15 || y - 4 < 1) {
			return false;
		}
		if (goStones[y - i][x + i].color != target) {
			return false;
		}
	}
	return true;
}

// \ 방향 대각선으로 승리 조건 성립
function checkDownRight(x, y) {
	var target = goStones[y][x].color;
	for (let i = 1; i < 5; i++) {
		// 인덱스 초과 방지
		if (x + 4 > 15 || y + 4 > 15) {
			return false;
		}
		if (goStones[y + i][x + i].color != target) {
			return false;
		}
	}
	return true;
}

function placeStone(event) {
	if (!running) return;

	// 캔버스 상에서의 마우스 클릭 좌표를 획득
	let rect = canvas.getBoundingClientRect();
	let x = Math.round((event.clientX - rect.left) / 40);
	let y = Math.round((event.clientY - rect.top) / 40);

	// 첫번째 턴에는 중앙에만 바둑돌을 놓을 수 있도록 함
	if (turnCount == 1) {
		if (x == 8 && y == 8) {
			stack.push(new goStone(x, y, turn));
			goStones[y][x].setColor(turn);
			turn == "black" ? turn = "white" : turn = "black";
			turnCount += 1;
			update();
		} else {
			status.innerHTML = "첫 번째 턴에는 정중앙에만 바둑돌을 놓을 수 있습니다.";
		}
	} else {
		// 어떤 바둑돌도 놓여지지 않은 위치라면 바둑돌을 놓을 수 있도록 함
		if (x >= 1 && x <= 15 && y >= 1 && y <= 15) {
			if (goStones[y][x].color == "none") {
				stack.push(new goStone(x, y, turn));
				goStones[y][x].setColor(turn);
				// 승리 체크 (한쪽이 승리한 경우 running을 false로 바꿈)
				if (running = !checkWin()) {
					turn == "black" ? turn = "white" : turn = "black"
					turnCount += 1;
				}
				update();
			} else {
				status.innerHTML = "이미 바둑돌을 놓은 위치에는 바둑돌을 놓을 수 없습니다.";
			}
		} else {
			status.innerHTML = "바둑돌을 놓을 수 있는 위치가 아닙니다.";
		}
	}
}

// 한 수 무르기
function undo() {
	if (!running) return;

	if (turnCount <= 1) {
		status.innerHTML = "아무것도 안 둔 상태에서는 한 수 무르기를 사용할 수 없습니다.";
	} else {
		let lastStone = stack.pop();
		goStones[lastStone.y][lastStone.x].setColor("none");
		turn == "black" ? turn = "white" : turn = "black";
		turnCount -= 1;
		update();
	}
}