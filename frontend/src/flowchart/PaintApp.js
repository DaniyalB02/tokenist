import React, { useRef, useState, useEffect } from "react";
import { saveCirclesToFile } from "./saveUtility";

function PaintApp() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Draw a grid background
    ctx.fillStyle = "lightgray";
    for (let x = 0; x < canvas.width; x += 10) {
      for (let y = 0; y < canvas.height; y += 10) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  const canvasWidth = window.innerWidth * 0.8;
  const sidebarWidth = window.innerWidth * 0.2;

  const [circles, setCircles] = useState([]);
  const [draggingCircle, setDraggingCircle] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [inputs, setInputs] = useState({
    balance: "0",
  });

  const [imageURL, setImageURL] = useState(null);

  const saveCircles = () => {
    saveCirclesToFile(circles);
  };

  const endDrag = () => {
    setDraggingCircle(null);
  };

  const sendDataToBackend = async () => {

  // Create data object
  const circlesData = {
    data: circles.map((circle) => ({  
      id: circle.id,
      x: circle.x,
      y: circle.y,
      radius: circle.radius,
      balance: circle.balance
    }))
  };

  // Send POST request 
  const response = await fetch("http://localhost:8000/api/process_data/", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(circlesData) 
  });

  // Handle response
  const data = await response.json();

  if (data.error) {
    console.error("Error:", data.error);
  } else {
    // Set image src to base64 data
    setImageURL(`data:image/png;base64,${data.image}`);
  }

};

  const dragCircle = (id, dx, dy) => {
    setCircles((prev) =>
      prev.map((circle) => {
        if (circle.id === id) {
          return {
            ...circle,
            x: circle.x + dx,
            y: circle.y + dy,
          };
        } else {
          return circle;
        }
      })
    );
  };

  const addCircle = () => {
    const newCircle = {
      id: Math.random(),
      x: 100,
      y: 100,
      radius: 30,
      balance: "0",
    };
    setCircles((prev) => [...prev, newCircle]);
  };

  const clickCircle = (id) => {
    setSelectedCircle(id);
    setDraggingCircle(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (selectedCircle !== null) {
      setCircles((prev) =>
        prev.map((circle) => {
          if (circle.id === selectedCircle) {
            return {
              ...circle,
              balance: inputs.balance,
            };
          } else {
            return circle;
          }
        })
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the grid background
    ctx.fillStyle = "lightgray";
    for (let x = 0; x < canvas.width; x += 10) {
      for (let y = 0; y < canvas.height; y += 10) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw circles
    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);

      // Set the black border
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;

      // Highlight in red if selected
      if (selectedCircle === circle.id) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
      }

      ctx.stroke();

      // Display balance text centered inside the circle
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(circle.balance, circle.x, circle.y);
    });
  }, [circles, selectedCircle]);

  return (
    <div style={{ display: "flex" }}>
      {imageURL ? (
        <img src={imageURL} alt="Result" />
      ) : (
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={500}
          onMouseUp={() => endDrag()}
          onMouseMove={(e) => {
            if (draggingCircle) {
              dragCircle(draggingCircle, e.movementX, e.movementY);
            }
          }}
          onMouseDown={(e) => {
            const mouseX = e.nativeEvent.offsetX;
            const mouseY = e.nativeEvent.offsetY;

            for (const circle of circles) {
              const distance = Math.sqrt(
                (mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2
              );
              if (distance <= circle.radius) {
                clickCircle(circle.id);
                return;
              }
            }
          }}
          style={{ cursor: draggingCircle ? "grabbing" : "default" }}
        />
      )}
      <div
        style={{
          width: sidebarWidth,
          backgroundColor: "#ddd",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {selectedCircle !== null && (
          <>
            <label htmlFor="balance">Balance:</label>
            <input
              id="balance"
              name="balance"
              value={inputs.balance}
              onChange={handleInputChange}
              style={{ width: "50px" }}
            />

            <button onClick={handleSave}>Save</button>
          </>
        )}
      </div>
      <div>
        <button onClick={addCircle}>Add Circle</button>
        <button onClick={saveCircles}>Save</button>
        <button onClick={sendDataToBackend}>Run</button>
      </div>
    </div>
  );
}

export default PaintApp;
