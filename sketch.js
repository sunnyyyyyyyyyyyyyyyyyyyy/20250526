let canvas;
let video;
let detections = [];

let blocks = [];
let caught = [];

function setup() {
  canvas = createCanvas(640, 480);
  canvas.parent(document.body);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  setupHandTracking();

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

function draw() {
  background(255);

  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  drawBlocks();
  drawHand();
}

function setupHandTracking() {
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(results => {
    detections = results.multiHandLandmarks;
  });

  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await hands.send({ image: video.elt });
    },
    width: 640,
    height: 480,
  });
  camera.start();
}

function drawHand() {
  if (detections.length > 0) {
    let landmarks = detections[0];

    let thumbTip = landmarks[4];
    let indexTip = landmarks[8];

    let x1 = width - thumbTip.x * width;
    let y1 = thumbTip.y * height;
    let x2 = width - indexTip.x * width;
    let y2 = indexTip.y * height;

    stroke(0, 255, 0);
    strokeWeight(4);
    line(x1, y1, x2, y2);

    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  }
  return null;
}

function drawBlocks() {
  let handPos = drawHand();

  for (let block of blocks) {
    if (!block.caught) {
      block.y += 2;

      fill(200, 100, 100);
      rect(block.x, block.y, 60, 40, 5);
      fill(255);
      textSize(24);
      text(block.text, block.x, block.y);

      if (handPos && dist(handPos.x, handPos.y, block.x, block.y) < 40) {
        block.caught = true;
        caught.push(block.text);
      }
    }
  }

  if (caught.length === 4) {
    fill(0, 200, 0);
    textSize(32);
    text("挑戰成功！", width / 2, height / 2);
    noLoop();
  }
}
