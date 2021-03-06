// 렌주룰 기반으로 구현
// 남은 과제 : 3-3 거짓 금수 판정

// 오목판에 놓여질 돌
class GoStone {
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
const board = new Array(16);
for (var i = 0; i < board.length; i++) {
    board[i] = new Array(16);
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
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            board[y][x] = new GoStone(x, y, COLOR_NONE);
        }
    }
    checkForbidden();
    updateCanvas();
    turn = COLOR_BLACK;
    turnCount = 1;
}

// 정해진 좌표에 흑돌을 그림
function drawBlack(x, y) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x * 30, y * 30, 14, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
}

// 정해진 좌표에 백돌을 그림
function drawWhite(x, y) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x * 30, y * 30, 14, 0, Math.PI * 2, true);
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
    ctx.moveTo(x * 30, y * 30 - 14);
    ctx.lineTo(x * 30 + 14, y * 30 + 14);
    ctx.lineTo(x * 30 - 14, y * 30 + 14)
    ctx.lineTo(x * 30, y * 30 - 14);
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
    ctx.lineWidth = 1;
    for (let y = 1; y < 15; y++) {
        for (let x = 1; x < 15; x++) {
            ctx.strokeRect(30 * y, 30 * x, 30, 30);
            // 바둑판 중간중간에 구분점을 그려줌
            if ((y == 4 && x == 4) || (y == 4 && x == 12) || (y == 8 && x == 8) || (y == 12 && x == 4) || (y == 12 && x == 12)) {
                ctx.beginPath();
                ctx.arc(x * 30, y * 30, 3, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    // 오목판에 돌을 그려줌
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            if (board[y][x].color == COLOR_BLACK) drawBlack(x, y);
            else if (board[y][x].color == COLOR_WHITE) drawWhite(x, y);
            // 흑돌 차례일 때만 금수 표시를 그려줌
            else if (turn == COLOR_BLACK && board[y][x].color == COLOR_FORBIDDEN) drawForbidden(x, y);
        }
    }

    if (!running) {
        // 한쪽이 승리한 경우 몇번째 수에 어떤 돌을 놓았는지 출력
        for (let i = 0; i < stack.length; i++) {
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "red";
            ctx.fillText(i + 1, stack[i].x * 30, stack[i].y * 30 + 7);
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

// 승리 체크 함수 (승리할 시 true 반환)
function checkWin(x, y, color) {
    if (checkHori(x, y, color) || checkVert(x, y, color) || checkRtlb(x, y, color) || checkLtrb(x, y, color)) {
        if (color == COLOR_BLACK) {
            message = "흑돌이 " + turnCount + " 턴만에 승리하였습니다.<br>"
        } else if (color == COLOR_WHITE) {
            message = "백돌이 " + turnCount + " 턴만에 승리하였습니다.<br>";
        }
        message += "다시 시작할려면 새로고침 하시오.";
        status.innerHTML = message;

        return true;
    }

    return false;
}

// 가로로 승리 조건 체크
function checkHori(x, y, color) {
    let cnt_color = 1;

    // 가로 좌 방향 체크
    let _x = x - 1;
    while (true) {
        if (_x == 0) break;
        if (board[y][_x].color == color) cnt_color += 1;
        else break;
        _x -= 1;
    }

    // 가로 우 방향 체크
    _x = x + 1;
    while (true) {
        if (_x == 16) break;
        if (board[y][_x].color == color) cnt_color += 1;
        else break;
        _x += 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// 세로로 승리 조건 성립
function checkVert(x, y, color) {
    let cnt_color = 1;

    // 세로 상 방향 체크
    let _y = y - 1;
    while (true) {
        if (_y == 0) break;
        if (board[_y][x].color == color) cnt_color += 1;
        else break;
        _y -= 1;
    }

    // 세로 하 방향 체크
    _y = y + 1;
    while (true) {
        if (_y == 16) break;
        if (board[_y][x].color == color) cnt_color += 1;
        else break;
        _y += 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// / 방향 대각선으로 승리 조건 성립
function checkRtlb(x, y, color) {
    let cnt_color = 1;

    // / 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        if (_x == 16 || _y == 0) break;
        if (board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    _x = x - 1;
    _y = y + 1;
    while (true) {
        if (_x == 0 || _y == 16) break;
        if (board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x -= 1;
        _y += 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// \ 방향 대각선으로 승리 조건 성립
function checkLtrb(x, y, color) {
    let cnt_color = 1;

    // \ 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        if (_x == 16 || _y == 16) break;
        if (board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    _x = x - 1;
    _y = y - 1;
    while (true) {
        if (_x == 0 || _y == 0) break;
        if (board[_y][_x].color == color) cnt_color += 1;
        else break;
        _x -= 1;
        _y -= 1;
    }

    if (color == COLOR_BLACK && cnt_color == 5) return true;
    if (color == COLOR_WHITE && cnt_color > 4) return true;
    return false;
}

// 금수 체크
function checkForbidden() {
    let forbidden = [];

    // 오목판에 금수 체크가 없도록 초기화
    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            if (board[y][x].color == COLOR_FORBIDDEN) board[y][x].setColor(COLOR_NONE);
        }
    }

    for (let y = 1; y < 16; y++) {
        for (let x = 1; x < 16; x++) {
            if (board[y][x].color == COLOR_NONE) {
                board[y][x].setColor(COLOR_BLACK);
                // 완전한 오목이 만들어지지 않으면 금수 체크
                if (!checkHori(x, y, COLOR_BLACK) && !checkVert(x, y, COLOR_BLACK) && !checkRtlb(x, y, COLOR_BLACK) && !checkLtrb(x, y, COLOR_BLACK)) {
                    // 열린 3이 2개 이상 있을 시 금수에 추가 (3-3 금수)
                    if (checkOpenHoriSam(x, y) + checkOpenVertSam(x, y) + checkOpenRtlbSam(x, y) + checkOpenLtrbSam(x, y) >= 2) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                        if (checkOpenHoriSam(x, y)) console.log(y, x, "open hori 3");
                        if (checkOpenVertSam(x, y)) console.log(y, x, "open vert 3");
                        if (checkOpenRtlbSam(x, y)) console.log(y, x, "open rtlb 3");
                        if (checkOpenLtrbSam(x, y)) console.log(y, x, "open ltrb 3");
                    }
                    // 4가 2개 이상 있을 시 금수에 추가 (4-4 금수)
                    if (checkHoriSa(x, y) + checkVertSa(x, y) + checkRtlbSa(x, y) + checkLtrbSa(x, y) >= 2) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                        if (checkHoriSa(x, y)) console.log(y, x, "hori 4");
                        if (checkVertSa(x, y)) console.log(y, x, "vert 4");
                        if (checkRtlbSa(x, y)) console.log(y, x, "rtlb 4");
                        if (checkLtrbSa(x, y)) console.log(y, x, "ltrb 4");
                    }
                    // 한 방향으로 중첩된 4가 2개 이상 있을 시 금수에 추가 (4-4 금수)
                    if (checkHoriNestedSa(x, y) || checkVertNestedSa(x, y) || checkRtlbNestedSa(x, y) || checkLtrbNestedSa(x, y)) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                        if (checkHoriNestedSa(x, y)) console.log(y, x, "hori nested 4");
                        if (checkVertNestedSa(x, y)) console.log(y, x, "vert nested 4");
                        if (checkRtlbNestedSa(x, y)) console.log(y, x, "rtlb nested 4");
                        if (checkLtrbNestedSa(x, y)) console.log(y, x, "ltrb nested 4");
                    }
                    // 6목 이상 만들어질 시 금수에 추가 (장목 금수)
                    if (checkHoriJangmok(x, y) || checkVertJangmok(x, y) || checkRtlbJangmok(x, y) || checkLtrbJangmok(x, y)) {
                        forbidden.push(new GoStone(x, y, COLOR_FORBIDDEN));
                    }
                }
                board[y][x].setColor(COLOR_NONE);
            }
        }
    }

    for (let i = 0; i < forbidden.length; i++) {
        board[forbidden[i].y][forbidden[i].x].setColor(COLOR_FORBIDDEN);
    }
}

// 가로 방향 장목 체크
function checkHoriJangmok(x, y) {
    let cnt_black = 1;

    // 가로 좌 방향 체크
    let _x = x - 1;
    while (true) {
        if (_x == 0) break;
        if (board[y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x -= 1;
    }

    // 가로 우 방향 체크
    _x = x + 1;
    while (true) {
        if (_x == 16) break;
        if (board[y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x += 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// 세로 방향 장목 체크
function checkVertJangmok(x, y) {
    let cnt_black = 1;

    // 세로 상 방향 체크
    let _y = y - 1;
    while (true) {
        if (_y == 0) break;
        if (board[_y][x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _y -= 1;
    }

    // 세로 하 방향 체크
    _y = y + 1;
    while (true) {
        if (_y == 16) break;
        if (board[_y][x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _y += 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// / 방향 장목 체크
function checkRtlbJangmok(x, y) {
    let cnt_black = 1;

    // / 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        if (_x == 16 || _y == 0) break;
        if (board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    _x = x - 1;
    _y = y + 1;
    while (true) {
        if (_x == 0 || _y == 16) break;
        if (board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x -= 1;
        _y += 1;
    }

    if (cnt_black > 5) return true;
    return false;
}


// \ 방향 장목 체크
function checkLtrbJangmok(x, y) {
    let cnt_black = 1;

    // \ 오른쪽 방향 체크
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        if (_x == 16 || _y == 16) break;
        if (board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    _x = x - 1;
    _y = y - 1;
    while (true) {
        if (_x == 0 || _y == 0) break;
        if (board[_y][_x].color == COLOR_BLACK) cnt_black += 1;
        else break;
        _x -= 1;
        _y -= 1;
    }

    if (cnt_black > 5) return true;
    return false;
}

// 가로 방향 열린 3 체크
function checkOpenHoriSam(x, y) {
    let cnt_black = 1;
    let cnt_left = 0;
    let cnt_right = 0;
    let cnt_none = 0;

    // 가로 좌 방향 체크
    let prev = board[y][x];
    let _x = x - 1;
    while (true) {
        cnt_left += 1;
        if (_x == 0) {
            if (board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        }
        if (board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        } else if (board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_left -= 2;
                break;
            }
        }
        prev = board[y][_x];
        _x -= 1;
    }

    // 가로 우 방향 체크
    prev = board[y][x];
    _x = x + 1;
    while (true) {
        cnt_right += 1;
        if (_x == 16) {
            if (board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        }
        if (board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        } else if (board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_right -= 2;
                break;
            }
        }
        prev = board[y][_x];
        _x += 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (x - cnt_left == 1 || x + cnt_right == 15) return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (x - cnt_left - 1 > 0 && board[y][x - cnt_left - 1].color == COLOR_WHITE) return false;
    if (x + cnt_right + 1 < 16 && board[y][x + cnt_right + 1].color == COLOR_WHITE) return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (x - cnt_left - 2 > 0 && board[y][x - cnt_left - 2].color == COLOR_WHITE) {
        if (x + cnt_right + 2 < 16 && board[y][x + cnt_right + 2].color == COLOR_WHITE) return false;
    }
    return true;
}

// 세로 방향 열린 3 체크
function checkOpenVertSam(x, y) {
    let cnt_black = 1;
    let cnt_up = 0;
    let cnt_down = 0;
    let cnt_none = 0;

    // 세로 상 방향 체크
    let prev = board[y][x];
    let _y = y - 1;
    while (true) {
        cnt_up += 1;
        if (_y == 0) {
            if (board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        }
        if (board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        } else if (board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_up -= 2;
                break;
            }
        }
        prev = board[_y][x];
        _y -= 1;
    }

    // 세로 하 방향 체크
    prev = board[y][x];
    _y = y + 1;
    while (true) {
        cnt_down += 1;
        if (_y == 16) {
            if (board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        }
        if (board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        } else if (board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_down -= 2;
                break;
            }
        }
        prev = board[_y][x];
        _y += 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (y - cnt_up == 1 || y + cnt_down == 15) return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (y - cnt_up - 1 > 0 && board[y - cnt_up - 1][x].color == COLOR_WHITE) return false;
    if (y + cnt_down + 1 < 16 && board[y + cnt_down + 1][x].color == COLOR_WHITE) return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (y - cnt_up - 2 > 0 && board[y - cnt_up - 2][x].color == COLOR_WHITE) {
        if (y + cnt_down + 2 < 16 && board[y + cnt_down + 2][x].color == COLOR_WHITE) return false;
    }
    return true;
}

// / 방향 열린 3 체크
function checkOpenRtlbSam(x, y) {
    let cnt_black = 1;
    let cnt_upright = 0;
    let cnt_downleft = 0;
    let cnt_none = 0;

    // / 오른쪽 방향 체크
    let prev = board[y][x];
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        cnt_upright += 1;
        if (_x == 16 || _y == 0) {
            if (_y > 0 && board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upright -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    prev = board[y][x];
    _x = x - 1;
    _y = y + 1;
    while (true) {
        cnt_downleft += 1;
        if (_x == 0 || _y == 16) {
            if (board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downleft -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x -= 1;
        _y += 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (y - cnt_upright == 1 || x + cnt_upright == 15 || y + cnt_downleft == 15 || x - cnt_downleft == 1) return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (x + cnt_upright + 1 < 16 && y - cnt_upright - 1 > 0 && board[y - cnt_upright - 1][x + cnt_upright + 1].color == COLOR_WHITE) return false;
    if (x - cnt_downleft - 1 > 0 && y + cnt_downleft + 1 < 16 && board[y + cnt_downleft + 1][x - cnt_downleft - 1].color == COLOR_WHITE) return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (x + cnt_upright + 2 < 16 && y - cnt_upright - 2 > 0 && board[y - cnt_upright - 2][x + cnt_upright + 2].color == COLOR_WHITE) {
        if (x - cnt_downleft - 2 > 0 && y + cnt_downleft + 2 < 16 && board[y + cnt_downleft + 2][x - cnt_downleft - 2].color == COLOR_WHITE) return false;
    }

    return true;
}

// \ 방향 열린 3 체크
function checkOpenLtrbSam(x, y) {
    let cnt_black = 1;
    let cnt_downright = 0;
    let cnt_upleft = 0;
    let cnt_none = 0;

    // \ 오른쪽 방향 체크
    let prev = board[y][x];
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        cnt_downright += 1;
        if (_x == 16 || _y == 16) {
            if (board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downright -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    prev = board[y][x];
    _x = x - 1;
    _y = y - 1;
    while (true) {
        cnt_upleft += 1;
        if (_x == 0 || _y == 0) {
            if (board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upleft -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x -= 1;
        _y -= 1;
    }

    // 흑돌 갯수가 3이 아니면 열린 3이 아님
    if (cnt_black != 3) return false;
    // 빈 공간을 두 개 이상 가진 경우 열린 3이 아님
    if (cnt_none > 1) return false;
    // 한쪽이라도 벽으로 막힌 경우 열린 3이 아님
    if (y + cnt_downright == 15 || x + cnt_downright == 15 || y - cnt_upleft == 1 || x - cnt_upleft == 1) return false;
    // 상대 돌로 막힌 경우 열린 3이 아님
    if (x + cnt_downright + 1 < 16 && y + cnt_downright + 1 < 16 && board[y + cnt_downright + 1][x + cnt_downright + 1].color == COLOR_WHITE) return false;
    if (x - cnt_upleft - 1 > 0 && y - cnt_upleft - 1 > 0 && board[y - cnt_upleft - 1][x - cnt_upleft - 1].color == COLOR_WHITE) return false;
    // 양쪽에 한 칸을 띄고 상대 돌로 막힌 경우 열린 3이 아님
    if (x + cnt_downright + 2 < 16 && y + cnt_downright + 2 < 16 && board[y + cnt_downright + 2][x + cnt_downright + 2].color == COLOR_WHITE) {
        if (x - cnt_upleft - 2 > 0 && y - cnt_upleft - 2 > 0 && board[y - cnt_upleft - 2][x - cnt_upleft - 2].color == COLOR_WHITE) return false;
    }

    return true;
}

// 가로 방향 4 체크
function checkHoriSa(x, y) {
    let cnt_black = 1;
    let cnt_left = 0;
    let cnt_right = 0;
    let cnt_none = 0;

    // 가로 좌 방향 체크
    let prev = board[y][x];
    let _x = x - 1;
    while (true) {
        cnt_left += 1;
        if (_x == 0) {
            if (board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        }
        if (board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[y][_x].color == COLOR_WHITE || board[y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        } else if (board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_left -= 1;
                }
                cnt_none -= 1;
                cnt_left -= 1;
                break;
            }
        }
        prev = board[y][_x];
        _x -= 1;
    }

    // 가로 우 방향 체크
    prev = board[y][x];
    _x = x + 1;
    while (true) {
        cnt_right += 1;
        if (_x == 16) {
            if (board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        }
        if (board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[y][_x].color == COLOR_WHITE || board[y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        } else if (board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_right -= 1;
                }
                cnt_none -= 1;
                cnt_right -= 1;
                break;
            }
        }
        prev = board[y][_x];
        _x += 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// 세로 방향 4 체크
function checkVertSa(x, y) {
    let cnt_black = 1;
    let cnt_up = 0;
    let cnt_down = 0;
    let cnt_none = 0;

    // 세로 상 방향 체크
    let prev = board[y][x];
    let _y = y - 1;
    while (true) {
        cnt_up += 1;
        if (_y == 0) {
            if (board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        }
        if (board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][x].color == COLOR_WHITE || board[_y][x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        } else if (board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_up -= 1;
                }
                cnt_none -= 1;
                cnt_up -= 1;
                break;
            }
        }
        prev = board[_y][x];
        _y -= 1;
    }

    // 세로 하 방향 체크
    prev = board[y][x];
    _y = y + 1;
    while (true) {
        cnt_down += 1;
        if (_y == 16) {
            if (board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        }
        if (board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][x].color == COLOR_WHITE || board[_y][x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        } else if (board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_down -= 1;
                }
                cnt_none -= 1;
                cnt_down -= 1;
                break;
            }
        }
        prev = board[_y][x];
        _y += 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// / 방향 4 체크
function checkRtlbSa(x, y) {
    let cnt_black = 1;
    let cnt_upright = 0;
    let cnt_downleft = 0;
    let cnt_none = 0;

    // / 오른쪽 방향 체크
    let prev = board[y][x];
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        cnt_upright += 1;
        if (_x == 16 || _y == 0) {
            if (board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_upright -= 1;
                }
                cnt_none -= 1;
                cnt_upright -= 1;
                break;
            }
        }
        prev = board[_y][_x];
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    prev = board[y][x];
    _x = x - 1;
    _y = y + 1;
    while (true) {
        cnt_downleft += 1;
        if (_x == 0 || _y == 16) {
            if (board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_downleft -= 1;
                }
                cnt_none -= 1;
                cnt_downleft -= 1;
                break;
            }
        }
        prev = board[_y][_x];
        _x -= 1;
        _y += 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// \ 방향 4 체크
function checkLtrbSa(x, y) {
    let cnt_black = 1;
    let cnt_downright = 0;
    let cnt_upleft = 0;
    let cnt_none = 0;

    // \ 오른쪽 방향 체크
    let prev = board[y][x];
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        cnt_downright += 1;
        if (_x == 16 || _y == 16) {
            if (board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_downright -= 1;
                }
                cnt_none -= 1;
                cnt_downright -= 1;
                break;
            }
        }
        prev = board[_y][_x];
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    prev = board[y][x];
    _x = x - 1;
    _y = y - 1;
    while (true) {
        cnt_upleft += 1;
        if (_x == 0 || _y == 0) {
            if (board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1
            // 빈 공간이 두 개 이상이면 안됨
            if (cnt_none == 2) {
                if (prev.color == COLOR_NONE) {
                    cnt_none -= 1;
                    cnt_upleft -= 1;
                }
                cnt_none -= 1;
                cnt_upleft -= 1;
                break;
            }
        }
        prev = board[_y][_x];
        _x -= 1;
        _y -= 1;
    }

    // 흑돌 갯수가 4가 아니면 4가 아님
    if (cnt_black != 4) return false;
    return true;
}

// 가로 방향 중첩된 4 체크
function checkHoriNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_left = 0;
    let cnt_right = 0;
    let cnt_none = 0;

    // 가로 좌 방향 체크
    let prev = board[y][x];
    let _x = x - 1;
    while (true) {
        cnt_left += 1;
        if (_x == 0) {
            if (board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        }
        if (board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[y][_x].color == COLOR_WHITE || board[y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[y][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_left -= 1;
            }
            cnt_left -= 1;
            break;
        } else if (board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_left -= 2;
                break;
            }
        }
        prev = board[y][_x];
        _x -= 1;
    }

    // 가로 우 방향 체크
    prev = board[y][x];
    _x = x + 1;
    while (true) {
        cnt_right += 1;
        if (_x == 16) {
            if (board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        }
        if (board[y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[y][_x].color == COLOR_WHITE || board[y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[y][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_right -= 1;
            }
            cnt_right -= 1;
            break;
        } else if (board[y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_right -= 2;
                break;
            }
        }
        prev = board[y][_x];
        _x += 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (board[y][x - cnt_left + 1].color == COLOR_NONE && board[y][x + cnt_right - 1].color == COLOR_NONE) return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (board[y][x - cnt_left + 2].color == COLOR_NONE && board[y][x + cnt_right - 2].color == COLOR_NONE) return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (board[y][x - cnt_left + 3].color == COLOR_NONE && board[y][x + cnt_right - 3].color == COLOR_NONE) return true;
    }

    return false;
}

// 세로 방향 중첩된 4 체크
function checkVertNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_up = 0;
    let cnt_down = 0;
    let cnt_none = 0;

    // 세로 상 방향 체크
    let prev = board[y][x];
    let _y = y - 1;
    while (true) {
        cnt_up += 1;
        if (_y == 0) {
            if (board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        }
        if (board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][x].color == COLOR_WHITE || board[_y][x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_up -= 1;
            }
            cnt_up -= 1;
            break;
        } else if (board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_up -= 2;
                break;
            }
        }
        prev = board[_y][x];
        _y -= 1;
    }

    // 세로 하 방향 체크
    prev = board[y][x];
    _y = y + 1;
    while (true) {
        cnt_down += 1;
        if (_y == 16) {
            if (board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        }
        if (board[_y][x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][x].color == COLOR_WHITE || board[_y][x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][x].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_down -= 1;
            }
            cnt_down -= 1;
            break;
        } else if (board[_y][x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_down -= 2;
                break;
            }
        }
        prev = board[_y][x];
        _y += 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (board[y - cnt_up + 1][x].color == COLOR_NONE && board[y + cnt_down - 1][x].color == COLOR_NONE) return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (board[y - cnt_up + 2][x].color == COLOR_NONE && board[y + cnt_down - 2][x].color == COLOR_NONE) return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (board[y - cnt_up + 3][x].color == COLOR_NONE && board[y + cnt_down + 3][x].color == COLOR_NONE) return true;
    }

    return false;
}

// / 방향 중첩된 4 체크
function checkRtlbNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_upright = 0;
    let cnt_downleft = 0;
    let cnt_none = 0;

    // / 오른쪽 방향 체크
    let prev = board[y][x];
    let _x = x + 1;
    let _y = y - 1;
    while (true) {
        cnt_upright += 1;
        if (_x == 16 || _y == 0) {
            if (board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upright -= 1;
            }
            cnt_upright -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // / 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upright -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x += 1;
        _y -= 1;
    }

    // / 왼쪽 방향 체크
    prev = board[y][x];
    _x = x - 1;
    _y = y + 1;
    while (true) {
        cnt_downleft += 1;
        if (_x == 0 || _y == 16) {
            if (board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downleft -= 1;
            }
            cnt_downleft -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간을 연달아 두 칸 만나면 탐색 중지
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downleft -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x -= 1;
        _y += 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (board[y - cnt_upright + 1][x + cnt_upright - 1].color == COLOR_NONE && board[y + cnt_downleft - 1][x - cnt_downleft + 1].color == COLOR_NONE) return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (board[y - cnt_upright + 2][x + cnt_upright - 2].color == COLOR_NONE && board[y + cnt_downleft - 2][x - cnt_downleft + 2].color == COLOR_NONE) return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (board[y - cnt_upright + 3][x + cnt_upright - 3].color == COLOR_NONE && board[y + cnt_downleft - 3][x - cnt_downleft + 3].color == COLOR_NONE) return true;
    }

    return false;
}

// \ 방향 중첩된 4 체크
function checkLtrbNestedSa(x, y) {
    let cnt_black = 1;
    let cnt_downright = 0;
    let cnt_upleft = 0;
    let cnt_none = 0;

    // \ 오른쪽 방향 체크
    let prev = board[y][x];
    let _x = x + 1;
    let _y = y + 1;
    while (true) {
        cnt_downright += 1;
        if (_x == 16 || _y == 16) {
            if (board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y - 1][_x - 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_downright -= 1;
            }
            cnt_downright -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1;
            // 빈 공간이 두 개 이상이면 안됨
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_downright -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x += 1;
        _y += 1;
    }

    // \ 왼쪽 방향 체크
    prev = board[y][x];
    _x = x - 1;
    _y = y - 1;
    while (true) {
        cnt_upleft += 1;
        if (_x == 0 || _y == 0) {
            if (board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1
            break;
        }
        if (board[_y][_x].color == COLOR_BLACK) {
            cnt_black += 1;
        } else if (board[_y][_x].color == COLOR_WHITE || board[_y][_x].color == COLOR_FORBIDDEN) {
            // 중간에 빈 공간이 끼어 있을 경우
            if (board[_y + 1][_x + 1].color == COLOR_NONE) {
                cnt_none -= 1;
                cnt_upleft -= 1;
            }
            cnt_upleft -= 1;
            break;
        } else if (board[_y][_x].color == COLOR_NONE) {
            cnt_none += 1
            // 빈 공간이 두 개 이상이면 안됨
            if (prev.color == COLOR_NONE) {
                cnt_none -= 2;
                cnt_upleft -= 2;
                break;
            }
        }
        prev = board[_y][_x];
        _x -= 1;
        _y -= 1;
    }

    if (cnt_none != 2) return false;

    // ● ●●● ●
    if (cnt_black == 5) {
        if (board[y + cnt_downright - 1][x + cnt_downright - 1].color == COLOR_NONE && board[y - cnt_upleft + 1][x - cnt_upleft + 1].color == COLOR_NONE) return true;
        // ●● ●● ●●
    } else if (cnt_black == 6) {
        if (board[y + cnt_downright - 2][x + cnt_downright - 2].color == COLOR_NONE && board[y - cnt_upleft + 2][x - cnt_upleft + 2].color == COLOR_NONE) return true;
        // ●●● ● ●●●
    } else if (cnt_black == 7) {
        if (board[y + cnt_downright - 3][x + cnt_downright - 3].color == COLOR_NONE && board[y - cnt_upleft + 3][x - cnt_upleft + 3].color == COLOR_NONE) return true;
    }

    return false;
}

function placeStone(event) {
    if (!running) return;

    // 캔버스 상에서의 마우스 클릭 좌표를 획득
    let rect = canvas.getBoundingClientRect();
    let x = Math.round((event.clientX - rect.left) / 30);
    let y = Math.round((event.clientY - rect.top) / 30);

    // 어떤 바둑돌도 놓여지지 않은 위치라면 바둑돌을 놓을 수 있도록 함
    if (x >= 1 && x < 16 && y >= 1 && y < 16) {
        if (board[y][x].color != COLOR_BLACK && board[y][x].color != COLOR_WHITE) {
            // 흑돌 차례일 경우 금수 자리에 돌을 놓았을 때 경고 메시지를 출력
            if (turn == COLOR_BLACK && board[y][x].color == COLOR_FORBIDDEN) {
                status.innerHTML = "해당 자리는 금수입니다.";
                setTimeout(() => updateStatusMsg(), 2000);
            } else {
                board[y][x].setColor(turn);
                stack.push(new GoStone(x, y, turn));
                // 승리 체크 (한쪽이 승리한 경우 running을 false로 바꿈)
                if (running = !checkWin(x, y, turn)) {
                    turn == COLOR_BLACK ? turn = COLOR_WHITE : turn = COLOR_BLACK;
                    // 흑돌 차례가 올 때 금수 체크를 함
                    if (turn == COLOR_BLACK) checkForbidden();
                    turnCount += 1;
                    updateStatusMsg();
                }
                updateCanvas();
            }
        } else {
            status.innerHTML = "이미 바둑돌을 놓은 위치입니다.";
            setTimeout(() => updateStatusMsg(), 2000);
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
        board[lastStone.y][lastStone.x].setColor(COLOR_NONE);
        turn == COLOR_BLACK ? turn = COLOR_WHITE : turn = COLOR_BLACK;
        if (turn == COLOR_BLACK) checkForbidden();
        turnCount -= 1;
        updateCanvas();
        updateStatusMsg();
    }
}