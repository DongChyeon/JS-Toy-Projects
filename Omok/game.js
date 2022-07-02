/*
수정해야 하는 사항들
1. checkWin 함수 (오류 제거)
2. UI 개선 (몇 턴인지 어떤 색의 돌이 현재 턴인지 화면에 표시)
3. 무르기 기능 (여유나면 스택을 통해 구현)
4. 코드 간결하게
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let go_stones = new Array(15);
for (var i = 0; i < go_stones.length; i++) {
    go_stones[i] = new Array(15);
}
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
				ctx.arc(x * 40, y * 40, 3, 0, Math.PI * 2, true)
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

function checkWin(color) {
	for (let y = 0; y < 15; y++) {
		for (let x = 0; x < 15; x++) {
			// 가로로 승리 조건 성립
			if (go_stones[y][x].color == color && go_stones[y][x + 1].color == color && go_stones[y][x + 2].color == color && go_stones[y][x + 3].color == color && go_stones[y][x + 4].color == color) {
				if (color == "black") {
					alert("흑돌이 " + turn_count + " 턴만에 승리하였습니다.");
				} else {
					alert("백돌이 " + turn_count + " 턴만에 승리하였습니다.");
				}
				break;
			} // 세로로 승리 조건 성립
			else if (go_stones[y][x].color == color && go_stones[y + 1][x].color == color && go_stones[y + 2][x].color == color && go_stones[y + 3][x].color == color && go_stones[y + 4][x].color == color) {
				if (color == "black") {
					alert("흑돌이 " + turn_count + " 턴만에 승리하였습니다.");
				} else {
					alert("백돌이 " + turn_count + " 턴만에 승리하였습니다.");
				}
				break;
			} // / 방향 대각선으로 승리 조건 성립
			else if (go_stones[y][x].color == color && go_stones[y - 1][x + 1].color == color && go_stones[y - 2][x + 2].color == color && go_stones[y - 3][x + 3].color == color && go_stones[y - 4][x + 4].color == color) {
				if (color == "black") {
					alert("흑돌이 " + turn_count + " 턴만에 승리하였습니다.");
				} else {
					alert("백돌이 " + turn_count + " 턴만에 승리하였습니다.");
				}
				break;
			} // \ 방향 대각선으로 승리 조건 성립
			else if (go_stones[y][x].color == color && go_stones[y + 1][x + 1].color == color && go_stones[y + 2][x + 2].color == color && go_stones[y + 3][x + 3].color == color && go_stones[y + 4][x + 4].color == color) {
				if (color == "black") {
					alert("흑돌이 " + turn_count + " 턴만에 승리하였습니다.");
				} else {
					alert("백돌이 " + turn_count + " 턴만에 승리하였습니다.");
				}
				break;
			}
		}HTMLCanvasElement
	}
}

function onclick(event){ 
	// 캔버스의 위치를 고려해 마우스 좌표를 취득 
	let x = event.clientX - ctx.canvas.offsetLeft; 
	let y = event.clientY - ctx.canvas.offsetTop;
	x = Math.round(x / 40) - 1;
	y = Math.round(y / 40) - 1;

	// 첫번째 턴에는 중앙에만 바둑돌을 놓을 수 있도록 함
	if (turn_count == 1) {
		if (x == 7 && y == 7) {
			go_stones[y][x].setColor(turn);
			if (turn == "black") {
				turn = "white";
			} else {
				turn = "black";
			}
			turn_count += 1;
		} else {
			alert("첫 번째 턴에는 정중앙에만 바둑돌을 놓을 수 있습니다.");
		}
	} else {
		// 어떤 바둑돌도 놓여지지 않은 위치라면 바둑돌을 놓을 수 있도록 함
		if (x >= 0 && x <= 14 && y >= 0 && y <= 14) {
			if (go_stones[y][x].color == "none") {
				go_stones[y][x].setColor(turn);
				// 승리 체크
				checkWin(turn);
				if (turn == "black") {
					turn = "white";
				} else {
					turn = "black";
				}
				turn_count += 1;
			} else {
				alert("이미 바둑돌을 놓은 위치에는 바둑돌을 놓을 수 없습니다.")
			}
		} else {
			alert("바둑돌을 놓을 수 있는 위치가 아닙니다.")
		}
	}
}
