import { useRef, useEffect, useState } from "react";
import { Fireworks } from "@fireworks-js/react";
import "./App.css";

function App() {
  const fireworksRef = useRef(null);
  const [showFireworks, setShowFireworks] = useState(true);

  useEffect(() => {
    const fireworksTimeout = setTimeout(() => {
      setShowFireworks(false);
    }, 1000000);

    return () => {
      clearTimeout(fireworksTimeout);
    };
  }, []);

  return (
    <div className="container">
      {showFireworks && (
        <div className="fireworks-area">
          <Fireworks
            ref={fireworksRef}
            options={{
              opacity: 0.7,
              particles: 200,
              explosion: 7,
              intensity: 70,
            }}
          />
        </div>
      )}
      <div className="content">
        <div class="number-display">
          <div class="number" id="number1">
            0
          </div>
          <div class="number" id="number2">
            0
          </div>
          <div class="number" id="number3">
            0
          </div>
        </div>
        <button id="spin-button">Quay số</button>
        <div class="results">
          <ul id="result-list"></ul>
        </div>
      </div>
    </div>
  );
}

export default App;
