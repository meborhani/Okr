"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const client_1 = require("react-dom/client");
require("./index.css");
const App_1 = require("./app/App");
(0, client_1.createRoot)(document.getElementById('root')).render(<react_1.StrictMode>
    <App_1.App />
  </react_1.StrictMode>);
//# sourceMappingURL=main.js.map