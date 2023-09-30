import os
from convert_to_networkx import convert_to_networkx
from cadCAD_model import cadCAD_model
from draw_total_network import draw_total_network
from interactive_plot import interactive_plot
import holoviews as hv
import hvplot.networkx as hvnx
from bokeh.io import output_notebook, show
hv.extension('bokeh') 



# Main function to run the code blocks
def main():
    # Clear the previous output
    
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # Code block 1
    print("Running code block 1")
    import tkinter as tk
    from tkinter import ttk
    from tkinter import messagebox, simpledialog, colorchooser
    import json

    class FlowchartApp:
        def __init__(self, master, config=None):
            # Canvas to draw shapes
            self.canvas = tk.Canvas(master, width=800, height=500)
            self.canvas.pack()

            self.selected = None
            self.copied = None
            self.connectors = {}
            self.filepath = config['filepath']
            
            # Create Sidebar
            self.sidebar = ttk.Frame(root, width=200)
            self.sidebar.pack(fill="y", side="right")

            # Shape color picker
            self.color_button = ttk.Button(self.sidebar, text="Select Color", command=self.choose_color)

            # Name and balance entries 
            self.name_entry = ttk.Entry(self.sidebar)
            self.balance_entry = ttk.Entry(self.sidebar)

            # Dictionary to store shapes  
            self.shapes = {} 
            
            # Bind events
            self.canvas.bind("<ButtonPress-1>", self.on_click)
            self.canvas.bind("<B1-Motion>", self.on_drag)

            # Menu and toolbar
            menubar = tk.Menu(root)
            filemenu = tk.Menu(menubar, tearoff=0)
            filemenu.add_command(label="Load", command=self.load_flowchart)
            menubar.add_cascade(label="File", menu=filemenu)
            
            toolbar = ttk.Frame(root) 
            self.add_shape_buttons(toolbar)
            toolbar.pack(side="top", fill="x")
            
            root.config(menu=menubar)

        def add_input_box(self):
            if self.selected:
                text = simpledialog.askstring("Input", "Enter text:", parent=root)
                color = colorchooser.askcolor(title="Pick a color")
                if color:
                    self.canvas.itemconfig(self.selected, fill=color[1])
                    self.shapes[self.selected]["color"] = color[1]
                if text:
                    self.shapes[self.selected]["text"] = text

                    # Delete old text
                    if "text" in self.shapes[self.selected]:
                        self.canvas.delete(self.shapes[self.selected]["text"])

                    # Add new text
                    x, y = self.get_center(self.selected)
                    text_id = self.canvas.create_text(x, y, text=text)
                    self.shapes[self.selected]["text_id"] = text_id  # Update the text_id key instead of text

        def copy_shape(self):
            if self.selected:
                self.copied = self.selected

        def paste_shape(self):
            if self.copied:
                shape = self.copied
                coords = self.shapes[shape]

                if self.shapes[shape]["type"] == "rect":
                    new_id = self.canvas.create_rectangle(coords["x1"], coords["y1"], coords["x2"], coords["y2"])
                elif self.shapes[shape]["type"] == "oval":
                    new_id = self.canvas.create_oval(coords["x1"], coords["y1"], coords["x2"], coords["y2"])

                self.shapes[new_id] = self.shapes[shape].copy()
                self.shapes[new_id]["text"] = None

                x, y = self.get_center(new_id)
                self.shapes[new_id]["text"] = self.canvas.create_text(x, y, text=self.shapes[shape]["text"])

                self.canvas.itemconfig(new_id, fill=self.shapes[shape]["color"])


        def get_center(self, shape):
            coords = self.shapes[shape] 
            x = (coords["x1"] + coords["x2"]) / 2
            y = (coords["y1"] + coords["y2"]) / 2
            return x, y

        def choose_color(self):
            if self.selected:
                color = colorchooser.askcolor(title="Pick a color")  
                if color:
                    rgb = color[0] 
                    hex_color = '#%02x%02x%02x' % rgb
                    self.canvas.itemconfig(self.selected, fill=hex_color)
                    self.shapes[self.selected]["color"] = hex_color
            
        def save_flowchart(self):
            # Extract required data
            nodes = []
            for id, shape in self.shapes.items():
                text = float(shape.get("text", ""))
                node = {
                "id": id, 
                "balance": text,  
                "color": shape["color"]
                }
                
                nodes.append(node)

            edges = []
            for id, conn in self.connectors.items():
                edges.append({"source": conn["from"], "target": conn["to"]})

            data = {"nodes": nodes, "edges": edges}

            with open(self.filepath, "w") as f:
                json.dump(data, f)

            print("File saved")

        def update_shape(self):

            if self.selected:

                # Update color
                hex_color = self.shapes[self.selected]["color"]

                # Convert to RGB    
                rgb = self.hex_to_rgb(hex_color)  

                # Update shape with RGB value
                self.canvas.itemconfig(self.selected, fill=rgb)

                # Update name 
                name = self.name_entry.get()
                x, y = self.get_center(self.selected) 
                self.canvas.delete(self.shapes[self.selected]["text"])
                self.shapes[self.selected]["text"] = self.canvas.create_text(x, y, text=name)
            

                # Update balance
                if "balance_text" in self.shapes[self.selected]:
                    self.canvas.delete(self.shapes[self.selected]["balance_text"])  
                balance = self.shapes[self.selected].get("balance", "")
                balance_text = f"Balance: {balance}"
                x, y = self.get_center(self.selected)
                text_id = self.canvas.create_text(x, y, text=balance_text)
                self.shapes[self.selected]["balance_text"] = text_id

            
        def add_shape_buttons(self, toolbar):
            # Add buttons to insert shapes
            b_rect = ttk.Button(toolbar, text="Rectangle", command=self.add_rect)
            b_rect.pack(side="left")
            
            b_oval = ttk.Button(toolbar, text="Oval", command=self.add_oval)
            b_oval.pack(side="left")

            b_delete = ttk.Button(toolbar, text="Delete", command=self.delete_shape)
            b_delete.pack(side="left")

            update_btn = ttk.Button(toolbar, text="Update", command=self.add_input_box)
            update_btn.pack(side="left")

            copy_btn = ttk.Button(toolbar, text="Copy", command=self.copy_shape)
            copy_btn.pack(side="left")

            paste_btn = ttk.Button(toolbar, text="Paste", command=self.paste_shape) 
            paste_btn.pack(side="left")   

            save_btn = ttk.Button(toolbar, text="Save", command=self.save_flowchart)
            save_btn.pack(side="left")     
            
            # More buttons

        # Helper method
        def rgb_to_hex(self, rgb):
            return '#%02x%02x%02x' % rgb
        
        
        def hex_to_rgb(self, hex):
            r = int(hex[1:3], 16)
            g = int(hex[3:5], 16)
            b = int(hex[5:], 16)
            return (r, g, b)
            
        def add_rect(self):
            # Add rectangle shape to canvas
            x1, y1 = (20, 20)
            x2, y2 = (120, 80)
            rect = self.canvas.create_rectangle(x1, y1, x2, y2)
            
            # Store in shapes dict
            self.shapes[rect] = {"x1":x1, "y1":y1, "x2":x2, "y2":y2, "type":"rect", "text": None, "color": self.rgb_to_hex((0,0,0))}
            
        def add_oval(self):
            # Add oval shape to canvas
            x1, y1 = (180, 20) 
            x2, y2 = (280, 80)
            oval = self.canvas.create_oval(x1, y1, x2, y2)  
            
            # Store in shapes dict
            self.shapes[oval] = {"x1":x1, "y1":y1, "x2":x2, "y2":y2, "type":"oval", "text": None, "color": self.rgb_to_hex((0,0,0))}   

        # Delete shape method
        def delete_shape(self):
            if self.selected:
                self.canvas.delete(self.selected)
                del self.shapes[self.selected]
                self.selected = None  

        # Inside FlowchartApp class

        def on_click(self, event):

            if self.copied: 
                self.canvas.itemconfig(self.copied, width=1)
                self.copied = None
            
            if self.selected:
                self.canvas.itemconfig(self.selected, width=1)

            self.selected = None
            self.add_input_box()

            shape_clicked = self.canvas.find_closest(event.x, event.y)[0]

            if shape_clicked in self.shapes:

                self.selected = shape_clicked
                
                self.canvas.itemconfig(self.selected, width=4)

                if shape_clicked in self.connectors:
                
                    self.drag_line = self.canvas.create_line(event.x, event.y, 
                                                            event.x, event.y, 
                                                            width=2)
                    
                    self.drag_start = self.selected
                    
                    self.drag_end = None

            elif shape_clicked in self.connections:

                self.selected = shape_clicked

                self.canvas.itemconfig(self.selected, 
                                    fill="red",
                                    width=2)

            else:   

                text_item = self.canvas.create_text(event.x, event.y, text="New text")
                
                self.shapes[text_item] = {
                    "x1": event.x,
                    "y1": event.y, 
                    "type": "text"
                }

                self.selected = text_item
                
                self.canvas.itemconfig(self.selected, width=2)

            # Other custom click handling (if any) ...

        def on_drag(self, event):
            # Move the selected shape
            if self.selected:
                # Get the original coords
                coords = self.shapes[self.selected]
                dx = event.x - coords["x1"]
                dy = event.y - coords["y1"]

                # Update the coords of the shape
                coords["x1"] += dx
                coords["y1"] += dy
                coords["x2"] += dx
                coords["y2"] += dy

                # Update the coords of the associated text
                if "text_id" in coords:
                    text_coords = self.canvas.coords(coords["text_id"])
                    text_coords[0] += dx
                    text_coords[1] += dy
                    self.canvas.coords(coords["text_id"], *text_coords)

                # Redraw the shape
                self.canvas.coords(self.selected, coords["x1"], coords["y1"], coords["x2"], coords["y2"])

        def load_flowchart(self):
            filename = filedialog.askopenfilename()
            if filename:
                with open(filename) as f:
                    data = json.load(f)
                    for shape in data["nodes"]:
                        id = shape["id"]
                        hex_color = shape["color"]
                        rgb = self.hex_to_rgb(hex_color)
                        self.canvas.itemconfig(id, fill=rgb)
                        self.shapes[id]["color"] = hex_color
            
    root = tk.Tk()
    config = {
        'filepath': "C:/Users/daniy/Desktop/Code/Tokenomics SaaS/pythonModel/flowchart.json",
        'filepath1': "C:/Users/daniy/Desktop/Code/Tokenomics SaaS/pythonModel/flowchart1.json",
        'filepath2': "C:/Users/daniy/Desktop/Code/Tokenomics SaaS/pythonModel/flowchart2.json",
    }
    FlowchartApp(root, config)
    root.mainloop()

    # Prompt user to continue to code block 2
    input("Press Enter to continue to code block 2...")
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # Code block 2
    print("Running code block 2")
    # Code logic for block 2

    G = convert_to_networkx(config['filepath'])
    df = cadCAD_model(G, 0.05, 0.2)
    
    # Prompt user to continue to code block 3
    input("Press Enter to continue to code block 3...")
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # Code block 3
    print("Running code block 3")
    # Code logic for block 3
    draw_total_network(G, df)

    # Prompt user to continue to code block 4
    input("Press Enter to continue to code block 4...")
    os.system('cls' if os.name == 'nt' else 'clear')
    
    # Code block 4
    print("Running code block 4")
    viz = interactive_plot(df)
    viz.opts(width=500)
    # Render the visualization 
    renderer = hv.render(viz)

    # Display the renderer
    show(renderer)
    

# Run the main function
if __name__ == "__main__":
    main()