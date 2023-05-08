import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  Engine,
  Render,
  Runner,
  Body,
  Bodies,
  Composite,
  Common,
} from "matter-js";
import decomp from "poly-decomp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

Common.setDecomp(decomp);

const engine = Engine.create();

const spinnerRadius = 120;
const radius = 60;
const viewWidth = 480;
const viewHeight = 480;
const ballRadius = 12;
const ballRadiusVar = 10;
const numBalls = 15;
const generation = 7;

const render = Render.create({
  element: document.getElementById("world"),
  engine: engine,
  options: {
    width: spinnerRadius * 2,
    height: spinnerRadius * 2,
    wireframes: false,
  },
});

function posFromAngle(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

const spinner = Bodies.fromVertices(
  0,
  0,
  [
    posFromAngle((Math.PI / 6) * 1, spinnerRadius + 40),
    posFromAngle((Math.PI / 6) * 5, spinnerRadius + 40),
    posFromAngle((Math.PI / 6) * 9, spinnerRadius + 40),
    posFromAngle((Math.PI / 6) * 0.999, spinnerRadius + 40),
    posFromAngle((Math.PI / 6) * 0.999, spinnerRadius),
    posFromAngle((Math.PI / 6) * 9, spinnerRadius),
    posFromAngle((Math.PI / 6) * 5, spinnerRadius),
    posFromAngle((Math.PI / 6) * 1, spinnerRadius),
  ],
  {
    isStatic: true,
    render: { fillStyle: "#eea" },
  }
);

const balls: Body[] = [];
for (let i = 0; i < numBalls; i++) {
  balls.push(
    // Bodies.circle(
    //   0,
    //   0,
    //   ballRadius + (2 * Math.random() - 1) * ballRadiusVar
    // )
    Bodies.rectangle(
      0,
      0,
      (ballRadius + (2 * Math.random() - 1) * ballRadiusVar) * 1.5,
      (ballRadius + (2 * Math.random() - 1) * ballRadiusVar) * 3
    )
  );
}
Composite.add(engine.world, balls);
Composite.add(engine.world, [spinner]);

Render.run(render);
Render.lookAt(render, {
  min: { x: -spinnerRadius, y: -spinnerRadius },
  max: { x: spinnerRadius, y: spinnerRadius },
});
const runner = Runner.create();
Runner.run(runner, engine);

setInterval(() => {
  Body.rotate(spinner, 0.01);
  const c = (document.getElementById("world") as HTMLElement)
    .children[0] as HTMLCanvasElement;
  const ctx = c.getContext("2d")!;
  const imgData = ctx.getImageData(
    spinnerRadius - radius,
    spinnerRadius - radius,
    radius * 2,
    radius * 2
  );
  const url = getImageURL(imgData, radius * 2, radius * 2);
  const nodeElements = document.querySelectorAll(".node");
  for (let i = 0; i < triangleNodes.length; i++) {
    const el = nodeElements[i] as HTMLElement;
    const node = triangleNodes[i];
    const x = viewWidth / 2 - radius + node.x * radius;
    const y = viewHeight / 2 - radius + node.y * radius;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.backgroundImage = `url(${url})`;
    el.style.transform = `matrix(${calcMatrix(node)
      .map((n) => n.toFixed(2))
      .join(",")},0,0)`;
  }
}, 1000 / 60);

function calcMatrix(node) {
  let a = 1;
  let b = 0;
  let c = 0;
  let d = 1;
  for (const angle of node.path) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const a2 = -Math.pow(cos, 2) + Math.pow(sin, 2);
    const b2 = -2 * cos * sin;
    const c2 = -2 * cos * sin;
    const d2 = Math.pow(cos, 2) - Math.pow(sin, 2);
    const a3 = a2 * a + c2 * b;
    const b3 = b2 * a + d2 * b;
    const c3 = a2 * c + c2 * d;
    const d3 = b2 * c + d2 * d;
    a = a3;
    b = b3;
    c = c3;
    d = d3;
  }
  return [a, b, c, d];
}

function getImageURL(imgData, width, height) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL(); //image URL
}

type Node = {
  path: number[];
  x: number;
  y: number;
};

function createTriangleNodes(generation) {
  const nodes = new Map();
  const firstNode = { path: [], x: 0, y: 0 }; // r = 1 で正規化
  function nodeId(node) {
    return (
      Math.round(node.x * 100) / 100 + "," + Math.round(node.y * 100) / 100
    );
  }
  nodes.set(nodeId(firstNode), firstNode);
  let prev: Node[] = [firstNode];
  for (let i = 0; i < generation; i++) {
    const next: Node[] = [];
    const directions =
      i % 2 === 0
        ? [(Math.PI / 6) * 3, (Math.PI / 6) * 7, (Math.PI / 6) * 11]
        : [(Math.PI / 6) * 1, (Math.PI / 6) * 5, (Math.PI / 6) * 9];
    for (const node of prev) {
      for (const direction of directions) {
        const newNode = {
          path: [...node.path, direction],
          x: node.x + Math.cos(direction),
          y: node.y + Math.sin(direction),
        };
        const id = nodeId(newNode);
        if (!nodes.has(id)) {
          nodes.set(id, newNode);
          next.push(newNode);
        }
      }
    }
    prev = next;
  }
  return [...nodes.values()];
}
const triangleNodes = createTriangleNodes(generation);
const viewElement = document.getElementById("view") as HTMLElement;
viewElement.style.position = "relative";
viewElement.style.width = `${viewWidth}px`;
viewElement.style.height = `${viewHeight}px`;
viewElement.style.border = "1px solid #000";
viewElement.style.overflow = "hidden";
for (const nodes of triangleNodes) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.className = "node";
  el.style.width = `${radius * 2}px`;
  el.style.height = `${radius * 2}px`;
  el.style.backgroundPosition = "center";
  el.style.backgroundRepeat = "no-repeat";
  el.style.clipPath = `polygon(${radius}px ${0}px, ${
    radius + radius * Math.cos(Math.PI / 6)
  }px ${radius + radius * Math.sin(Math.PI / 6)}px, ${
    radius + radius * Math.cos((Math.PI / 6) * 5)
  }px ${radius + radius * Math.sin((Math.PI / 6) * 5)}px)`;
  viewElement.appendChild(el);
}
