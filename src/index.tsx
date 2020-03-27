import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Row, Col, Slider } from "antd";
import "antd/dist/antd.dark.css";
import styled, { createGlobalStyle } from "styled-components";
import { useSpring } from "use-spring";
import { defer } from "lodash";

// Scheduler

class Scheduler {
  private readonly stack: Function[] = [];

  private enqueue(task: Function) {
    if (this.stack.length < 2) this.stack.push(task);
    else this.stack[1] = task;
  }

  private dequeue() {
    if (this.stack.length) {
      const task = this.stack.shift()!;
      defer(() => {
        task();
        this.dequeue();
      });
    }
  }

  run(task: Function) {
    this.enqueue(task);
    this.dequeue();
  }
}

// Canvas

type CanvasProps = {
  modulo: number;
  factor: number;
};

const Canvas: FunctionComponent<CanvasProps> = ({ modulo, factor }) => {
  const schedulerRef = useRef(new Scheduler());
  const centerRef = useRef<[number, number]>([0, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [moduloSpring] = useSpring(modulo);
  const [factorSpring] = useSpring(factor);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
      centerRef.current = [
        canvasRef.current.offsetWidth / 2,
        canvasRef.current.offsetHeight / 2
      ];
    }
  }, []);

  useEffect(() => {
    schedulerRef.current.run(() => {
      if (canvasRef.current && canvasRef.current.getContext) {
        const ctx = canvasRef.current.getContext("2d");
        const [centerX, centerY] = centerRef.current;
        const radius = centerY / 1.2;
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.strokeStyle = "#4697E3";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          for (let i = 0; i < moduloSpring; ++i) {
            const startRad = i * ((Math.PI * 2) / moduloSpring);
            const endRad =
              ((i * factorSpring) % moduloSpring) *
              ((Math.PI * 2) / moduloSpring);
            const startX = radius * Math.cos(startRad) + centerX;
            const startY = radius * Math.sin(startRad) + centerY;
            const endX = radius * Math.cos(endRad) + centerX;
            const endY = radius * Math.sin(endRad) + centerY;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    });
  }, [moduloSpring, factorSpring]);

  return <CanvasBase ref={canvasRef} />;
};

// Panel

type PanelProps = {
  modulo: number;
  setModulo(modulo: number): void;
  factor: number;
  setFactor(factor: number): void;
};

const Panel: FunctionComponent<PanelProps> = ({
  modulo,
  setModulo,
  factor,
  setFactor
}) => {
  return (
    <PanelBase>
      <Row gutter={12}>
        <Col span={9}>
          <h4>Modulo</h4>
          <Slider
            min={2}
            max={300}
            step={2}
            value={modulo}
            onChange={modulo => setModulo(modulo as number)}
          />
        </Col>
        <Col span={15}>
          <h4>Factor</h4>
          <Slider
            min={1}
            max={30}
            step={0.5}
            value={factor}
            onChange={factor => setFactor(factor as number)}
          />
        </Col>
      </Row>
    </PanelBase>
  );
};

// App

const App: FunctionComponent = () => {
  const [modulo, setModulo] = useState(220);
  const [factor, setFactor] = useState(2);
  return (
    <>
      <GlobalStyle />
      <Canvas modulo={modulo} factor={factor} />
      <Panel
        modulo={modulo}
        setModulo={setModulo}
        factor={factor}
        setFactor={setFactor}
      />
    </>
  );
};

// Styling

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }
  
  #root {
    display: flex;
    flex-direction: column;
  }
`;

const CanvasBase = styled.canvas`
  flex-grow: 1;
`;

const PanelBase = styled.div`
  flex-shrink: 0;
  height: 64px;
  padding: 0 14px;
`;

// Startup

ReactDOM.render(<App />, document.getElementById("root"));
