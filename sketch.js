let handpose;
let video;
let detections = [];

let timer = 30;
let gameState = "start"; // 新增 start 狀態
let blocks = [];
let blockTypes = ["target", "timePlus", "bomb"];
let targetWords = ["教", "育", "科", "技"];
let collectedTargets = [];
let restartTime = 0;

let modelReadyFlag = false;

function setup() {
  createCanvas(640, 480).parent("game-container");
  frameRate(30);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("Model ready!");
    modelReadyFlag = true;
  });
  handpose.on("predict", results => {
    detections = results;
  });
}

function draw() {
  background(220);

  // 鏡像影片
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (!modelReadyFlag) {
    // 模型尚未準備好時顯示載入中
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("模型載入中...", width / 2, height / 2);
    return;
  }

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "playing") {
    let hand = drawHand();
    if (frameCount % 60 === 0) {
      timer--;
      if (timer <= 0) {
        timer = 0;
        gameState = "ended";
        restartTime = millis() + 5000;
      } else {
        spawnBlock();
      }
    }

    if (hand) {
      checkCollisions(hand.x, hand.y);
    }

    updateBlocks();
    drawBlocks();
    drawTimer();
    drawTargets();
  } else if (gameState === "ended") {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("挑戰結束", width / 2, height / 2 - 20);

    if (collectedTargets.length === 4) {
      text("成功接住 教育科技！", width / 2, height / 2 + 20);
    } else {
      text("挑戰失敗，未集齊四字", width / 2, height / 2 + 20);
    }

    if (millis() > restartTime) {
      timer = 30;
      gameState = "start"; // 返回開始畫面
      blocks = [];
      collectedTargets = [];
    }
  }
}

function mousePressed() {
  if (gameState === "start") {
    gameState = "playing";
  }
}

function drawStartScreen() {
  fill(255);
  rect(0, 0, width, height);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("教育科技挑戰遊戲", width / 2, height / 2 - 40);
  textSize(24);
  text("點擊畫面開始遊戲", width / 2, height / 2 + 20);
}

function drawHand() {
  if (detections.length > 0 && detections[0].landmarks) {
    let landmarks = detections[0].landmarks;
    let thumbTip = landmarks[4];
    let indexTip = landmarks[8];

    let x1 = width - thumbTip[0] * width;
    let y1 = thumbTip[1] * height;
    let x2 = width - indexTip[0] * width;
    let y2 = indexTip[1] * height;

    // 黃色微笑曲線
    noFill();
    stroke("#FFD700");
    strokeWeight(4);
    beginShape();
    curveVertex(x1 - 30, (y1 + y2) / 2 + 10);
    curveVertex(x1, y1);
    curveVertex((x1 + x2) / 2, (y1 + y2) / 2 + 20);
    curveVertex(x2, y2);
    curveVertex(x2 + 30, (y1 + y2) / 2 + 10);
    endShape();

    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  }
  return null;
}

function spawnBlock() {
  let type = random(blockTypes);

  let block = {
    x: random(50, width - 50),
    y: -50,
    size: 50,
    type: type,
    speed: 3
  };

  if (type === "target") {
    let unused = targetWords.filter(w => !collectedTargets.includes(w));
    block.text = random(unused.length ? unused : targetWords);
  } else if (type === "timePlus") {
    block.text = "+" + int(random([5, 10, 15])) + "秒";
  } else {
    block.text = "-3秒";
  }

  blocks.push(block);
}

function updateBlocks() {
  for (let block of blocks) {
    block.y += block.speed;
  }
  blocks = blocks.filter(block => block.y < height + 50);
}

function drawBlocks() {
  textAlign(CENTER, CENTER);
  textSize(18);
  for (let block of blocks) {
    if (block.type === "bomb") {
      fill(255, 50, 50);
    } else if (block.type === "timePlus") {
      fill(100, 200, 255);
    } else if (block.type === "target") {
      switch (block.text) {
        case "教":
          fill("#b5838d");
          break;
        case "育":
          fill("#e5989b");
          break;
        case "科":
          fill("#ffb4a2");
          break;
        case "技":
          fill("#ffcdb2");
          break;
        default:
          fill(200, 100, 100);
      }
    }

    stroke(255);
    strokeWeight(2);
    rect(block.x, block.y, block.size, block.size, 10);
