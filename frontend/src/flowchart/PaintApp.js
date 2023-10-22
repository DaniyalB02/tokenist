import React, { useRef, useState, useEffect } from "react";

function PaintApp({ setView }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // exit the effect if the canvas isn't mounted yet

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

  const endDrag = () => {
    setDraggingCircle(null);
  };

  const saveImageToComputer = (dataURL, filename) => {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendDataToBackend = async () => {
    try {
      // Create data object
      const circlesData = {
        data: circles.map((circle) => ({
          id: circle.id,
          x: circle.x,
          y: circle.y,
          radius: circle.radius,
          balance: circle.balance,
        })),
      };

      // Send POST request
      const response = await fetch(
        "http://ec2-3-93-45-20.compute-1.amazonaws.com:8000/api/process_data/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(circlesData),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Error:", data.error);
      } else {
        // Save image to the person's computer
        saveImageToComputer(
          `data:image/png;base64,${data.image}`,
          "model_image.png"
        );

        // Clear the canvas and show the message
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          "Model saved! Restart the website to create another model",
          canvas.width / 2,
          canvas.height / 2
        );
      }
    } catch (error) {
      console.error("Failed to send data to backend:", error);
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
    if (!canvas) return; // exit the effect if the canvas isn't mounted yet

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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", flex: 1 }}>
        {imageURL ? (
          <img src={imageURL} alt="Result" />
        ) : (
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={750}
            onMouseUp={endDrag}
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
            backgroundColor: "#043873",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            color: "#4F9CF9",
            justifyContent: "space-between",
            height: "750px",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            {selectedCircle !== null && (
              <>
                <label htmlFor="balance">Balance:</label>
                <input
                  id="balance"
                  name="balance"
                  value={inputs.balance}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                    padding: "5px",
                    borderRadius: "5px",
                    fontFamily: "Inter",
                  }}
                />
                <button
                  onClick={handleSave}
                  style={{
                    marginBottom: "10px",
                    padding: "5px 15px",
                    backgroundColor: "#4F9CF9",
                    color: "#fff",
                    borderRadius: "5px",
                    fontFamily: "Inter",
                    alignItems: "center",
                  }}
                >
                  Save Balance
                </button>
              </>
            )}
            <button
              onClick={addCircle}
              style={{
                marginBottom: "10px",
                padding: "5px 15px",
                backgroundColor: "#4F9CF9",
                color: "#fff",
                borderRadius: "5px",
                fontFamily: "Inter",
                alignItems: "center",
              }}
            >
              Add Circle
            </button>
          </div>
          <button
            onClick={sendDataToBackend}
            style={{
              marginBottom: "10px",
              padding: "5px 15px",
              backgroundColor: "#4F9CF9",
              color: "#fff",
              borderRadius: "5px",
              fontFamily: "Inter",
            }}
          >
            Run Simulation
          </button>
          <button
            onClick={() => setView("home")}
            style={{
              marginBottom: "10px",
              padding: "5px 15px",
              backgroundColor: "#4F9CF9",
              color: "#fff",
              borderRadius: "5px",
              fontFamily: "Inter",
            }}
          >
            Go Home
          </button>
          <button
            onClick={() =>
              (window.location.href =
                "https://thetokenist.substack.com/?utm_source=substack&utm_medium=web&utm_campaign=substack_profile")
            }
            style={{
              padding: "5px 15px",
              backgroundColor: "#D65A10",
              color: "#fff",
              borderRadius: "5px",
              fontFamily: "Inter",
            }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaintApp;
