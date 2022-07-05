/*
수정해야 하는 사항들
1. 무르기 기능 (여유나면 스택을 통해 구현)
2. 코드 간결하게
*/
const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
const ctx = canvas.getContext("2d");
const go_stones = new Array(15);
for (var i = 0; i < go_stones.length; i++) {
    go_stones[i] = new Array(15);
}

// 게임의 진행 여부
let running = true;

// 현재 플레이어의 턴
let turn = "black";
let turn_count = 1;
canvas.addEventListener("click", onclick);

class Go_stone {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.color = "none";
	}
	
	setColor(color) {
		this.color = color;
		if (this.color == "white") {
			drawWhite(this.x, this.y);
		} else {
			drawBlack(this.x, this.y);
		}
	}
}

function init() {
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
	
	for (let y = 0; y < 15; y++) {
		for (let x = 0; x < 15; x++) {
			go_stones[y][x] = new Go_stone(x + 1, y + 1);
		}
	}
	
	turn = "black";
	turn_count = 1;
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

// 승리 체크 함수 (승리한 플레이어가 있을 시 true 반환)
function checkWin() {
	for (let y = 0; y < 15; y++) {
		for (let x = 0; x < 15; x++) {
			// 바둑돌이 놓여진 곳이라면 승리 조건 체크 시작
			if (go_stones[y][x].color != "none") {
				var target = go_stones[y][x].color;
				var win = true;
				// 가로로 승리 조건 성립
				for (let i = 1; i < 5; i++) {
					// 인덱스 초과 방지
					if (x + 4 > 14) {
						win = false;
						break
					}
					if (go_stones[y][x + i].color != target) {
						win = false;
						break;
					}
                }
                // 승리 메세지 출력
                if (win) {
                    target == "black" ? message = "흑돌이 " + turn_count + " 턴만에 승리하였습니다.<br>" : message = "백돌이 " + turn_count + " 턴만에 승리하였습니다.<br>";
                    message += "다시 시작할려면 새로고침 하시오.";
                    status.innerHTML = message;

                    return true;
                }

				win = true;
				// 세로로 승리 조건 성립
				for (let i = 1; i < 5; i++) {
					// 인덱스 초과 방지
					if (y + 4 > 14) {
						win = false;
						break;
					}
					if (go_stones[y + i][x].color != target) {
						win = false;
						break;
					}
                }
                // 승리 메세지 출력
				if (win) { 
                    target == "black" ? message = "흑돌이 " + turn_count + " 턴만에 승리하였습니다.<br>" : message = "백돌이 " + turn_count + " 턴만에 승리하였습니다.<br>";
                    message += "다시 시작할려면 새로고침 하시오.";
                    status.innerHTML = message;

                    return true;
                }

				win = true;
				// / 방향 대각선으로 승리 조건 성립
				for (let i = 1; i < 5; i++) {
					// 인덱스 초과 방지
					if (x + 4 > 14 || y - 4 < 0) {
						win = false;
						break;
					}
					if (go_stones[y - i][x + i].color != target) {
						win = false;
						break;
					}
                }
                // 승리 메세지 출력
				if (win) { 
                    target == "black" ? message = "흑돌이 " + turn_count + " 턴만에 승리하였습니다.<br>" : message = "백돌이 " + turn_count + " 턴만에 승리하였습니다.<br>";
                    message += "다시 시작할려면 새로고침 하시오.";
                    status.innerHTML = message;

                    return true;
                }

				win = true;
				// \ 방향 대각선으로 승리 조건 성립
				for (let i = 1; i < 5; i++) {
					// 인덱스 초과 방지
					if (x + 4 > 14 || y + 4 > 14) {
						win = false;
						break;
					}
					if (go_stones[y + i][x + i].color != target) {
						win = false;
						break;
					}
                }
                // 승리 메세지 출력
				if (win) { 
                    target == "black" ? message = "흑돌이 " + turn_count + " 턴만에 승리하였습니다.<br>" : message = "백돌이 " + turn_count + " 턴만에 승리하였습니다.<br>";
                    message += "다시 시작할려면 새로고침 하시오.";
                    status.innerHTML = message;

                    return true;
                }
			}
		}
    }
    return false;
}

function onclick(event) {
    if (!running) return;

    // 캔버스 상에서의 마우스 클릭 좌표를 획득
    let rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left; 
    let y = event.clientY - rect.top;
	x = Math.round(x / 40) - 1;
	y = Math.round(y / 40) - 1;

    let message = "현재 턴 : ";
	// 첫번째 턴에는 중앙에만 바둑돌을 놓을 수 있도록 함
	if (turn_count == 1) {
		if (x == 7 && y == 7) {
			go_stones[y][x].setColor(turn);
			turn == "black" ? turn = "white" : turn = "black";
            turn_count += 1;
            // 현재 누구 턴이고 몇 번째 턴인지 상태 메세지 업데이트
            turn == "black" ? message += "●<br>" : message += "○<br>";
            message += turn_count + " 번째 턴입니다.";
            status.innerHTML = message;
		} else {
            status.innerHTML = "첫 번째 턴에는 정중앙에만 바둑돌을 놓을 수 있습니다.";
		}
	} else {
		// 어떤 바둑돌도 놓여지지 않은 위치라면 바둑돌을 놓을 수 있도록 함
		if (x >= 0 && x <= 14 && y >= 0 && y <= 14) {
			if (go_stones[y][x].color == "none") {
				go_stones[y][x].setColor(turn);
                // 승리 체크
				if (running = !checkWin()) {
                    turn == "black" ? turn = "white" : turn = "black"
                    turn_count += 1;
                    // 현재 누구 턴이고 몇 번째 턴인지 상태 메세지 업데이트
                    turn == "black" ? message += "●<br>" : message += "○<br>";
                    message += turn_count + " 번째 턴입니다.";
                    status.innerHTML = message;
                }
			} else {
				status.innerHTML = "이미 바둑돌을 놓은 위치에는 바둑돌을 놓을 수 없습니다.";
			}
		} else {
			status.innerHTML = "바둑돌을 놓을 수 있는 위치가 아닙니다.";
		}
	}
}