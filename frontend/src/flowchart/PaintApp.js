import React, { useRef, useState, useEffect, useCallback } from "react";
import Popup from './Popup';

function isClickNearEdge(clickX, clickY, edge) {

  // Extracting coordinates from the edge object
  const { x: startX, y: startY } = edge.startPoint;
  const { x: endX, y: endY } = edge.endPoint;

  // Check if the click is near the line connecting the start and end points
  const distance = distanceToLineSegment(clickX, clickY, startX, startY, endX, endY);
  
  // Adjust this value based on your testing
  const isNear = distance < 30;
  return isNear;
}


function distanceToLineSegment(px, py, x1, y1, x2, y2) {

  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = dot / len_sq;

  let xx, yy;

  if (param < 0 || (x1 === x2 && y1 === y2)) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  // Calculate the distance using the locus around a line concept
  const distanceToLine = Math.sqrt(dx * dx + dy * dy);

  // Calculate the distance to the segment endpoints
  const distanceToStart = Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  const distanceToEnd = Math.sqrt((px - x2) * (px - x2) + (py - y2) * (py - y2));

  // Choose the minimum distance
  const minDistance = Math.min(distanceToLine, distanceToStart, distanceToEnd);

  return minDistance;
}



function PaintApp({ setView }) {
  const canvasRef = useRef(null);

  const [circles, setCircles] = useState([]);
  const [draggingCircle, setDraggingCircle] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [inputs, setInputs] = useState({
    balance: "0",
    probability: "0"
  });
  const [highlightedCircles, setHighlightedCircles] = useState([]);
  const [showAddEdgeButton, setShowAddEdgeButton] = useState(false);
  const [edges, setEdges] = useState([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [highlightedEdge, setHighlightedEdge] = useState(null);
  const [probabilityInput, setProbabilityInput] = useState("");
  const [circleIdCounter, setCircleIdCounter] = useState(1);
  const [showPopup, setShowPopup] = useState(true);

  const canvasWidth = 0.8 * window.innerWidth;

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleProbabilityInputChange = (e) => {
    setProbabilityInput(e.target.value);
  };
  
  const handleSaveProbability = () => {
    const parsedProbability = parseFloat(probabilityInput);

    if (isNaN(parsedProbability) || parsedProbability < 0 || parsedProbability > 1) {
      alert("Please enter a valid probability between 0 and 1");
      return;
    }
    if (highlightedEdge !== null) {
      setEdges((prevEdges) =>
        prevEdges.map((edge) => {
          if (edge.id === highlightedEdge.id) {
            return {
              ...edge,
              probability: parseFloat(probabilityInput), // Convert to float if needed
            };
          } else {
            return edge;
          }
        })
      );
  
      // Clear the input
      setProbabilityInput("");
    }
  };  

  useEffect(() => {
    const handleCanvasClick = (event) => {
      // Convert canvas coordinates to canvas space if necessary
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if the click is outside all circles
      const clickedOutsideCircles = circles.every((circle) => {
        return Math.sqrt((x - circle.x) ** 2 + (y - circle.y) ** 2) > circle.radius;
      });

      if (clickedOutsideCircles) {
        setSelectedCircle(null);
        setHighlightedCircles([]);
        setHighlightedEdge(null); // Clear highlighted edge on canvas click
      }

      const clickedEdge = edges.find((edge) => {
        return isClickNearEdge(x, y, edge);
      });

      if (clickedEdge) {
        setHighlightedEdge(clickedEdge);
        setHighlightedCircles([]); // Clear highlighted circles when an edge is clicked
      } else {
        setHighlightedEdge(null);
      }
    };
    
    // Add event listener to the canvas
    const canvasElement = canvasRef.current;
    canvasElement.addEventListener('click', handleCanvasClick);
  
    // Cleanup the event listener on component unmount
    return () => {
      canvasElement.removeEventListener('click', handleCanvasClick);
    };
  }, [circles, canvasRef, edges]); // Dependencies: circles state and canvasRef
  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // exit the effect if the canvas isn't mounted yet

    const ctx = canvas.getContext("2d");

    // Draw a grid background
    drawGrid(ctx, canvas.width, canvas.height);
  }, []);

  const drawGrid = (ctx, width, height) => {
    ctx.fillStyle = "lightgray";
    for (let x = 0; x < width; x += 10) {
      for (let y = 0; y < height; y += 10) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        console.log("Shift Pressed Down");
        setIsShiftPressed(true);
      }
    };
  
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        console.log("Shift Released");
        setIsShiftPressed(false);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  

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
      const circlesData = circles.map((circle) => ({
        id: circle.id,
        x: circle.x,
        y: circle.y,
        radius: circle.radius,
        balance: circle.balance,
      }));
  
      const edgesData = edges.map((edge) => ({
        id: edge.id,
        start: edge.start,
        end: edge.end,
        probability: edge.probability,
      }));
  
      const dataToSend = {
        circles: circlesData,
        edges: edgesData,
      };

      console.log("Data to send:", dataToSend);
  
      // Send POST request
      //"https://tokenist-backend-second-cd0c0ecb9e30.herokuapp.com/api/process_data/"
      const response = await fetch(
        "http://127.0.0.1:8000/api/process_data/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
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
        clearCanvas();
        showMessageOnCanvas("Model saved! Restart the website to create another model");
      }
    } catch (error) {
      console.error("Failed to send data to backend:", error);
    }
  };
  

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const showMessageOnCanvas = (message) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
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
      id: circleIdCounter,
      x: 100,
      y: 100,
      radius: 30,
      balance: "0",
    };
    setCircles((prev) => [...prev, newCircle]);
    setCircleIdCounter((prevCounter) => prevCounter + 1);
  };

  const clickCircle = (id) => {

    console.log("Before updating:", { highlightedCircles, selectedCircle });

    if (isShiftPressed) {
      setHighlightedCircles(prev => {
        if (prev.includes(id)) return prev;   
        return [...prev, id]; 
      });
    } else {
      setSelectedCircle(id);
      setDraggingCircle(id); 
      setHighlightedCircles([id]);
    }
  
    console.log("After updating:", { highlightedCircles, selectedCircle });
  };
  
  const addEdge = () => {
    if (highlightedCircles.length === 2) {
      const startCircle = circles.find((circle) => circle.id === highlightedCircles[0]);
      const endCircle = circles.find((circle) => circle.id === highlightedCircles[1]);
  
      // Specify start and end points for the new edge
      const newEdge = {
        id: Math.random(),
        start: highlightedCircles[0],
        end: highlightedCircles[1],
        startPoint: { x: startCircle.x, y: startCircle.y },
        endPoint: { x: endCircle.x, y: endCircle.y },
        probability: 0.5,
      };
  
      setEdges((prev) => {
        if (prev.length === 0) {
          return [newEdge];
        } else {
          return [...prev, newEdge];
        }
      });
  
      setProbabilityInput(newEdge.probability.toString());

      setHighlightedCircles([]);
      setShowAddEdgeButton(false);
    }
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
    clearCanvas();
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw circles
    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);

      if (
        (isShiftPressed && highlightedCircles.includes(circle.id)) ||
        (!isShiftPressed && selectedCircle === circle.id)
      ) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
      } else {
        // Default black border for unselected circles
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
      }

      ctx.stroke();

      // Display balance text centered inside the circle
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(circle.balance, circle.x, circle.y);
    });

    // Draw edges
    edges.forEach((edge) => {
      const startCircle = circles.find((circle) => circle.id === edge.start);
      const endCircle = circles.find((circle) => circle.id === edge.end);
    
      // Calculate angle between circle centers
      const angle = Math.atan2(endCircle.y - startCircle.y, endCircle.x - startCircle.x);
    
      // Calculate the nearest points on the perimeters
      const startPoint = {
        x: startCircle.x + startCircle.radius * Math.cos(angle),
        y: startCircle.y + startCircle.radius * Math.sin(angle)
      };
      const endPoint = {
        x: endCircle.x - endCircle.radius * Math.cos(angle),
        y: endCircle.y - endCircle.radius * Math.sin(angle)
      };

      const midPoint = {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2,
      };
    
      // Start drawing the arrowhead at the end point
      const arrowLength = 10; // Customize the size of the arrowhead
      const arrowWidth = 2.5; // Customize the width of the arrowhead

      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = edge === highlightedEdge ? 'red' : 'black';
      ctx.lineWidth = arrowWidth;
      ctx.stroke();

      // Calculate the points for the arrowhead
      ctx.beginPath();
      ctx.moveTo(endPoint.x, endPoint.y);
      ctx.lineTo(
        endPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
        endPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      console.log(`Drawing Edge ID: ${edge.id}, Highlighted: ${edge === highlightedEdge}`);
      ctx.lineTo(
        endPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
        endPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.lineTo(
        endPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
        endPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      
      // Set the style for the arrowhead
      ctx.strokeStyle = edge === highlightedEdge ? 'red' : 'black';
      ctx.fillStyle = edge === highlightedEdge ? 'red' : 'black';
      ctx.stroke();
      ctx.fill(); // Fill the arrowhead if needed

      // Draw the probability number above the line
      if (edge.probability !== undefined) {
        const probabilityText = edge.probability.toFixed(2);

        // Calculate the angle of the line
        const angleDeg = (angle * 180) / Math.PI;

        // Adjust the angle for better readability
        const adjustedAngle = angleDeg > 90 || angleDeg < -90 ? angle + Math.PI : angle;

        ctx.save();
        ctx.translate(midPoint.x, midPoint.y);
        ctx.rotate(adjustedAngle);

        ctx.font = "14px Arial";
        ctx.fillStyle = edge === highlightedEdge ? 'red' : 'black';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(probabilityText, 0, -5); // Adjust the position as needed

        ctx.restore();
      }



    });

    setShowAddEdgeButton(highlightedCircles.length === 2);
  }, [circles, selectedCircle, edges, highlightedCircles, isShiftPressed]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {showPopup && <Popup onClose={closePopup} />} {/* Render Popup component if showPopup is true */}

      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ display: "flex", flex: 1 }}>
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
              console.log("Canvas clicked");

              const mouseX = e.nativeEvent.offsetX;
              const mouseY = e.nativeEvent.offsetY;
            
              let circleClicked = false;
            
              for (const circle of circles) {
                const distance = Math.sqrt(
                  (mouseX - circle.x) ** 2 + (mouseY - circle.y) ** 2
                );
                if (distance <= circle.radius) {
                  clickCircle(circle.id);
                  circleClicked = true;
                  break;
                }
              }
            
              if (!circleClicked) {
                setHighlightedCircles([]);
              }
            
              setShowAddEdgeButton(highlightedCircles.length === 2); 
            
            }}

            style={{ cursor: draggingCircle ? "grabbing" : "default" }}
          />
          <Sidebar
            selectedCircle={selectedCircle}
            inputs={inputs}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            addCircle={addCircle}
            addEdge={addEdge}
            showAddEdgeButton={showAddEdgeButton}
            sendDataToBackend={sendDataToBackend}
            setView={setView}
            highlightedEdge={highlightedEdge}
            handleProbabilityInputChange={handleProbabilityInputChange}
            handleSaveProbability={handleSaveProbability}
            probabilityInput={probabilityInput}
            closePopup={closePopup}
            showPopup={showPopup}
          />
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  selectedCircle,
  inputs,
  handleInputChange,
  handleSave,
  addCircle,
  addEdge,
  showAddEdgeButton,
  sendDataToBackend,
  setView,
  highlightedEdge,
  handleProbabilityInputChange,
  handleSaveProbability,
  probabilityInput,
  closePopup,
  showPopup
}) {
  return (
      <div
        style={{
          width: "30%",
          backgroundColor: "#043873",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          color: "#4F9CF9",
          justifyContent: "space-between",
          height: "95%",
        }}
      >
        <div style={{ flexGrow: 1 }}>
          {highlightedEdge !== null && (
            <>
             <div style={{ flexDirection: "column", marginBottom: "10px" }}>
              <label htmlFor="probability">Probability:</label>
              <input
                id="probability"
                name="probability"
                value={probabilityInput}  // Change to probabilityInput
                onChange={handleProbabilityInputChange}  // Change to handleProbabilityInputChange
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  padding: "5px",
                  borderRadius: "5px",
                  fontFamily: "Inter",
                }}
              />
              <button
                onClick={handleSaveProbability}
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
                Save Probability
              </button>
            </div>
          </>
          )}
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
          {showAddEdgeButton && (
            <button
              onClick={addEdge}
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
              Add Edge
            </button>
          )}
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
  );
}

export default PaintApp;
 
