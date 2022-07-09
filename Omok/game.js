// 렌주룰 기반으로 구현
// 4-4 금수 판정, 장목 금수 판정, 3-3 거짓 금수 판정 구현 남음

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
const stack = [];
const goStones = new Array(16);
for (var i = 0; i < goStones.length; i++) {
	goStones[i] = new Array(16);
}

const COLOR_NONE = 0;
const COLOR_BLACK = 1;
const COLOR_WHITE = 2;
const COLOR_FORBIDDEN = 3;

// 게임의 진행 여부
let running = true;
// 현재 플레이어의 턴
let turn = COLOR_BLACK;
let turnCount = 1;

canvas.addEventListener("click", placeStone);
undoBtn.addEventListener("click", undo);

// 게임 초기화
function init() {
	for (let y = 1; y <= 15; y++) {
		for (let x = 1; x <= 15; x++) {
			goStones[y][x] = new goStone(x, y, COLOR_NONE);
		}
	}
	updateCanvas();
	turn = COLOR_BLACK;
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
    ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(x * 40, y * 40, 18, 0, Math.PI * 2, true);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

// 정해진 좌표에 금수표시를 그림
function drawForbidden(x, y) {
    ctx.fillStyle = "#DFA450";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x * 40, y * 40 - 18);
    ctx.lineTo(x * 40 + 18, y * 40 + 18);
    ctx.lineTo(x * 40 - 18, y * 40 + 18)
    ctx.lineTo(x * 40, y * 40 - 18);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

// 캔버스에 게임 진행 사항 업데이트
function updateCanvas() {
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
			if (goStones[y][x].color == COLOR_BLACK) drawBlack(x, y);
			else if (goStones[y][x].color == COLOR_WHITE) drawWhite(x, y);
			// 흑돌 차례일 때만 금수 표시를 그려줌
            else if (turn == COLOR_BLACK && goStones[y][x].color == COLOR_FORBIDDEN) drawForbidden(x, y);
		}
	}

	if (!running) {
		// 한쪽이 승리한 경우 몇번째 수에 어떤 돌을 놓았는지 출력
		for (let i = 0; i < stack.length; i++) {
			ctx.font = "bold 20px sans-serif";
			ctx.textAlign = "center";
			ctx.fillStyle = "red";
			ctx.fillText(i + 1, stack[i].x * 40, stack[i].y * 40 + 7);
		}
	}
}

// 턴 상태 메시지 업데이트
function updateStatusMsg() {
	let message = "현재 턴 : ";
	turn == COLOR_BLACK ? message += "●<br>" : message += "○<br>";
	message += turnCount + " 번째 턴입니다.";
	status.innerHTML = message;
}

// 승리 체크 함수 (승리한 플레이어가 있을 시 true 반환)
function checkWin() {
	for (let y = 1; y <= 15; y++) {
		for (let x = 1; x <= 15; x++) {
			// 바둑돌이 놓여진 곳이라면 승리 조건 체크 시작
			if (goStones[y][x].color == COLOR_BLACK || goStones[y][x].color == COLOR_WHITE) {
				if (checkHori(x, y) || checkVert(x, y) || checkRtlb(x, y) || checkLtrb(x, y)) {
					if (goStones[y][x].color == COLOR_BLACK) {
						message = "흑돌이 " + turnCount + " 턴만에 승리하였습니다.<br>"
					} else if (goStones[y][x].color == COLOR_WHITE) {
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
function checkHori(x, y) {
	var target = goStones[y][x].color;
	// 인덱스 초과 방지
	if (x + 4 > 15) return false;
	for (let i = 1; i < 5; i++) {
		if (goStones[y][x + i].color != target) return false;
	}
	return true;
}

// 세로로 승리 조건 성립
function checkVert(x, y) {
	var target = goStones[y][x].color;
	// 인덱스 초과 방지
	if (y + 4 > 15) return false;
	for (let i = 1; i < 5; i++) {	
		if (goStones[y + i][x].color != target) return false;
	}
	return true;
}

// / 방향 대각선으로 승리 조건 성립
function checkRtlb(x, y) {
	var target = goStones[y][x].color;
	// 인덱스 초과 방지
	if (x + 4 > 15 || y - 4 < 1) return false;
	for (let i = 1; i < 5; i++) {	
		if (goStones[y - i][x + i].color != target) return false;
	}
	return true;
}

// \ 방향 대각선으로 승리 조건 성립
function checkLtrb(x, y) {
	var target = goStones[y][x].color;
	// 인덱스 초과 방지
	if (x + 4 > 15 || y + 4 > 15) return false;
	for (let i = 1; i < 5; i++) {
		if (goStones[y + i][x + i].color != target) return false;
	}
	return true;
}

// 3-3 금수 체크
function checkSamSam(x, y) {
    let horiSam = checkHoriSam(x, y);
    let vertSam = checkVertSam(x, y);
	let rtlbSam = checkRtlbSam(x, y);
	let ltrbSam = checkLtrbSam(x, y);

    if (horiSam + vertSam + rtlbSam + ltrbSam >= 2) return true;

    return false;
}

// 가로 방향 열린 3 체크
function checkHoriSam(x, y) {
    let cnt_black = 1;
    let cnt_white = 0;
    let cnt_none = 0;

    let tmp_horiSam = true;

    // 가로 우 방향 체크
    for (let i = 1; i < 4; i++) {
        if (x + i > 15) break;
        if (goStones[y][x + i].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y][x + i].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && x + i + 1 < 16) {
            if (goStones[y][x + i + 1].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none <= cnt_white) tmp_horiSam = false;

    // 가로 좌 방향 체크
    for (let i = 1; i < 4; i++) {
        if (x - i < 1) break;
        if (goStones[y][x - i].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y][x - i].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && x - i - 1 > 0) {
            if (goStones[y][x - i - 1].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none - cnt_white > 3 && tmp_horiSam && cnt_black == 3) return true;

    return false;
}

// 세로 방향 열린 3 체크
function checkVertSam(x, y) {
    let cnt_black = 1;
    let cnt_white = 0;
    let cnt_none = 0;

    let tmp_vertSam = true;

    // 세로 하 방향 체크
    for (let i = 1; i < 4; i++) {
        if (y + i > 15) break;
        if (goStones[y + i][x].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y + i][x].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && y + i + 1 < 16) {
            if (goStones[y + i + 1][x].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none <= cnt_white) tmp_vertSam = false;

    // 세로 상 방향 체크
    for (let i = 1; i < 4; i++) {
        if (y - i < 1) break;
        if (goStones[y - i][x].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y - i][x].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && y - i - 1 > 0) {
            if (goStones[y - i - 1][x].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none - cnt_white > 3 && tmp_vertSam && cnt_black == 3) return true;

    return false;
}

// / 방향 열린 3 체크
function checkRtlbSam(x, y) {
    let cnt_black = 1;
    let cnt_white = 0;
    let cnt_none = 0;

    let tmp_rtlbSam = true;

    // / 오른쪽 방향 체크
    for (let i = 1; i < 4; i++) {
        if (x + i > 15 || y - i < 1) break;
        if (goStones[y - i][x + i].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y - i][x + i].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && x + i + 1 < 16 && y - i - 1 > 0) {
            if (goStones[y - i - 1][x + i + 1].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none <= cnt_white) tmp_rtlbSam = false;

    // / 왼쪽 방향 체크
    for (let i = 1; i < 4; i++) {
        if (x - i < 1 || y + i > 15) break;
        if (goStones[y + i][x - i].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y + i][x - i].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && x - i - 1 > 0 && y + i + 1 < 16) {
            if (goStones[y + i + 1][x - i - 1].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none - cnt_white > 3 && tmp_rtlbSam && cnt_black == 3) return true;

    return false;
}

// \ 방향 열린 3 체크
function checkLtrbSam(x, y) {
    let cnt_black = 1;
    let cnt_white = 0;
    let cnt_none = 0;

    let tmp_ltrbSam = true;

    // \ 오른쪽 방향 체크
    for (let i = 1; i < 4; i++) {
        if (x + i > 15 || y + i > 15) break;
        if (goStones[y + i][x + i].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y + i][x + i].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && x + i + 1 < 16 && y + i + 1 < 16) {
            if (goStones[y + i + 1][x + i + 1].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none <= cnt_white) tmp_ltrbSam = false;

    // \ 왼쪽 방향 체크
    for (let i = 1; i < 4; i++) {
        if (x - i < 1 || y - i < 1) break;
        if (goStones[y - i][x - i].color == COLOR_WHITE) {
            cnt_white += 1; 
        } else {
            goStones[y - i][x - i].color == COLOR_BLACK ? cnt_black += 1 : cnt_none += 1;
        }
        // 4번째 칸이 백돌일 때 추가 카운팅
        if (i == 3 && x - i - 1 > 0 && y - i - 1 > 0) {
            if (goStones[y - i - 1][x - i - 1].color == COLOR_WHITE) cnt_white += 1;
        }
    }

    if (cnt_none - cnt_white > 3 && tmp_ltrbSam && cnt_black == 3) return true;

    return false;
}

function placeStone(event) {
	if (!running) return;

	// 캔버스 상에서의 마우스 클릭 좌표를 획득
	let rect = canvas.getBoundingClientRect();
	let x = Math.round((event.clientX - rect.left) / 40);
	let y = Math.round((event.clientY - rect.top) / 40);

	// 어떤 바둑돌도 놓여지지 않은 위치라면 바둑돌을 놓을 수 있도록 함
	if (x >= 1 && x <= 15 && y >= 1 && y <= 15) {
		// 흑돌일 경우 금수 자리가 아니고 아무 돌도 놓여있지 않은 곳에만 돌을 놓을 수 있음
		if (turn == COLOR_BLACK && goStones[y][x].color == COLOR_NONE) {
			goStones[y][x].setColor(turn);
			if (checkSamSam(x, y)) {
				goStones[y][x].setColor(COLOR_FORBIDDEN);
				status.innerHTML = "해당 자리는 3-3 금수이므로 돌을 놓을 수 없습니다.";
				setTimeout(() => updateStatusMsg(), 2000);
			} else {
				stack.push(new goStone(x, y, turn));
				// 승리 체크 (한쪽이 승리한 경우 running을 false로 바꿈)
				if (running = !checkWin()) {
					turn = COLOR_WHITE;
					turnCount += 1;
					updateStatusMsg();
				}
			}
			updateCanvas();
		} else if (turn == COLOR_WHITE && goStones[y][x].color != COLOR_BLACK) {
			goStones[y][x].setColor(turn);
			stack.push(new goStone(x, y, turn));
			// 승리 체크 (한쪽이 승리한 경우 running을 false로 바꿈)
			if (running = !checkWin()) {
				turn = COLOR_BLACK;
				turnCount += 1;
				updateStatusMsg();
			}
			updateCanvas();
		} else {
			if (turn == COLOR_BLACK && goStones[y][x].color == COLOR_FORBIDDEN) {
				status.innerHTML = "해당 자리는 3-3 금수이므로 돌을 놓을 수 없습니다.";
				setTimeout(() => updateStatusMsg(), 2000);
			} else {
				status.innerHTML = "이미 바둑돌을 놓은 위치에는 바둑돌을 놓을 수 없습니다.";
				setTimeout(() => updateStatusMsg(), 2000);
			}
		}
	} else {
		status.innerHTML = "바둑돌을 놓을 수 있는 위치가 아닙니다.";
		setTimeout(() => updateStatusMsg(), 2000);
	}
}

// 한 수 무르기
function undo() {
	if (!running) return;

	if (turnCount <= 1) {
		status.innerHTML = "아무것도 안 둔 상태에서는 한 수 무르기를 사용할 수 없습니다.";
	} else {
		let lastStone = stack.pop();
		goStones[lastStone.y][lastStone.x].setColor(COLOR_NONE);
		turn == COLOR_BLACK ? turn = COLOR_WHITE : turn = COLOR_BLACK;
		turnCount -= 1;
		updateCanvas();
		updateStatusMsg();
	}
}