let handpose;
let video;
let predictions = [];

let blocks = [];
let caught = [];

function setup() {
  createCanvas(640, 480).parent(document.body);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  // 初始化四個積木
  let words = ["教", "育", "科", "技"];
  for (let i = 0; i < 4; i++) {
    blocks.push({
      x: random(50, width - 50),
      y: -random(100, 300) - i * 150,
      text: words[i],
      caught: false
    });
  }

  textAlign(CENTER, CENTER);
  rectMode(CENTER);
}

function modelReady() {
  console.log("模型載入完成！");
}

function draw() {
  background(255);

  // 鏡像鏡頭畫面（方便用手玩）
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  drawBlocks();
  drawHand();
}

function drawBlocks() {
  for (let block of blocks) {
    if (!block.caught) {
      block.y += 2;

      fill(200, 100, 100);
      rect(block.x, block.y, 60, 40, 5);
      fill(255);
      textSize(24);
      text(block.text, block.x, block.y);

      // 偵測碰撞（手指線）
      if (predictions.length > 0) {
        let hand = predictions[0];
        let thumb = hand.annotations.thumb[3];
        let index = hand.annotations.indexFinger[3];

        let mx = (thumb[0] + index[0]) / 2;
        let my = (thumb[1] + index[1]) / 2;

        // 轉換鏡像位置
        mx = width - mx;

        // 碰撞檢查
        if (
          dist(mx, my, block.x, block.y) < 40
        ) {
          block.caught = true;
          caught.push(block.text);
        }
      }
    }
  }

  // 判斷是否成功接到所有積木
  if (caught.length === 4) {
    fill(0, 200, 0);
    textSize(32);
    text("挑戰成功！", width / 2, height / 2);
    noLoop();
  }
}

function drawHand() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let thumb = hand.annotations.thumb[3];
    let index = hand.annotations.indexFinger[3];

    // 鏡像轉換
    let x1 = width - thumb[0];
    let y1 = thumb[1];
    let x2 = width - index[0];
    let y2 = index[1];

    stroke(0, 255, 0);
    strokeWeight(4);
    line(x1, y1, x2, y2);
  }
}