# Data Flow Visualization

This web application allows you to visualize data flow relationships from an Excel file as an interactive graph.

## Features

- Upload Excel files with source and destination data
- Interactive graph visualization
- Zoom and pan capabilities
- Click on nodes to focus
- Automatic layout optimization
- Save modified layout (node colors and positions) back to Excel

## How to Use

1. Open `index.html` in a modern web browser
2. Click "Choose File" and select your Excel file
3. Click "Load Excel File" to generate the visualization
4. Interact with the graph:
   - Click and drag to pan
   - Use mouse wheel to zoom
   - Click on nodes to focus
   - Drag nodes to rearrange
   - Click on nodes to change their color using the color picker
5. Save your modifications:
   - Click "Save Layout" button to export the Excel file with updated node positions and colors
   - The saved file will preserve all your layout customizations

## Excel File Format

Your Excel file should have at least two columns:
- Source: The origin of the data flow
- Destination: The target of the data flow

## Requirements

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Excel file with source and destination data

## Technical Details

This application uses:
- Cytoscape.js for graph visualization
- SheetJS (xlsx) for Excel file parsing
- Vanilla JavaScript for the application logic 