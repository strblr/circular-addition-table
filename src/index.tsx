import React from "react";
import ReactDOM from "react-dom";
import { Button } from "antd";
import "antd/dist/antd.css";

const App = () => <Button type="primary">Test</Button>;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
