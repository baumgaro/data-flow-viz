// Global functions for HTML event handlers
function hideDetails() {
    const details = document.getElementById('nodeDetails');
    details.classList.add('hidden');
    window.selectedElement = null;
}

function hideEdgeDetails() {
    const details = document.getElementById('edgeDetails');
    details.classList.add('hidden');
    window.selectedEdge = null;
}

function updateNodeColor(color) {
    if (window.selectedElement) {
        window.selectedElement.data('color', color);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('excelFile');
    const saveLayoutButton = document.getElementById('saveLayoutButton');
    const detailsPanel = document.getElementById('nodeDetails');
    const detailsContent = document.getElementById('details-content');
    const edgeDetailsPanel = document.getElementById('edgeDetails');
    const edgeDetailsContent = document.getElementById('edge-details-content');
    const cyContainer = document.getElementById('cy');
    let cy;
    let sourcesData = [];
    let flowsData = [];
    window.selectedElement = null; // Make selectedElement globally accessible
    window.selectedEdge = null; // Make selectedEdge globally accessible
    let loadedFileName = null; // Store the loaded file name

    // Debug container state
    console.log('Initial container state:', {
        container: cyContainer,
        display: window.getComputedStyle(cyContainer).display,
        visibility: window.getComputedStyle(cyContainer).visibility,
        height: window.getComputedStyle(cyContainer).height,
        width: window.getComputedStyle(cyContainer).width
    });

    // Auto-load file when selected
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            loadedFileName = file.name;
            console.log('File selected, container state:', {
                display: window.getComputedStyle(cyContainer).display,
                visibility: window.getComputedStyle(cyContainer).visibility,
                height: window.getComputedStyle(cyContainer).height,
                width: window.getComputedStyle(cyContainer).width
            });
            processExcelFile(file);
        }
    });

    // Provided headers for nodes
    const NODE_HEADERS = [
        'key', 'name', 'description', 'data_format', 'data_quality', 'latency', 'consolidation_level', 'pain_points', 'improvement_potential', 'x_position', 'y_position'
    ];

    // Provided headers for edges/flows
    const EDGE_HEADERS = [
        'flow_key', 'source_key', 'destination_key', 'description', 'processing_type', 'transformation_logic', 'trigger_system', 'volume (estimated)', 'frequency', 'process_owner', 'pain_points', 'improvement_potential'
    ];

    // Function to save layout to Excel
    function saveLayoutToExcel() {
        if (!cy) return;

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Get all nodes and their positions
        const nodes = cy.nodes();
        const nodeData = nodes.map(node => {
            const d = node.data();
            const pos = node.position();
            return {
                key: d.id,
                name: d.name,
                description: d.description,
                data_format: d.properties?.data_format || '',
                data_quality: d.properties?.data_quality || '',
                latency: d.properties?.latency || '',
                consolidation_level: d.properties?.consolidation_level || '',
                pain_points: d.properties?.pain_points || '',
                improvement_potential: d.properties?.improvement_potential || '',
                x_position: pos.x,
                y_position: pos.y,
                color: d.color || '#ffffff' // Save node color from data
            };
        });
        // Ensure header order for nodes
        const nodeDataWithHeaders = [NODE_HEADERS.concat('color')].concat(nodeData.map(row => NODE_HEADERS.concat('color').map(h => row[h] || '')));
        const wsNodes = XLSX.utils.aoa_to_sheet(nodeDataWithHeaders);
        XLSX.utils.book_append_sheet(wb, wsNodes, "Sources and Targets");

        // Get all edges
        const edges = cy.edges();
        const edgeData = edges.map(edge => {
            const d = edge.data();
            return {
                flow_key: d.id,
                source_key: d.source,
                destination_key: d.target,
                description: d.description || '',
                processing_type: d.processing_type || '',
                transformation_logic: d.transformation_logic || '',
                trigger_system: d.trigger_system || '',
                'volume (estimated)': d['volume (estimated)'] || '',
                frequency: d.frequency || '',
                process_owner: d.process_owner || '',
                pain_points: d.pain_points || '',
                improvement_potential: d.improvement_potential || ''
            };
        });
        // Ensure header order for edges
        const edgeDataWithHeaders = [EDGE_HEADERS].concat(edgeData.map(row => EDGE_HEADERS.map(h => row[h] || '')));
        const wsEdges = XLSX.utils.aoa_to_sheet(edgeDataWithHeaders);
        XLSX.utils.book_append_sheet(wb, wsEdges, "Data Flows and Processes");

        // Use the same file name as the loaded file
        const fileName = loadedFileName || "layout.xlsx";
        XLSX.writeFile(wb, fileName);
    }

    // Add event listener for save layout button
    saveLayoutButton.addEventListener('click', saveLayoutToExcel);
    saveLayoutButton.textContent = 'Save Layout';

    // Initialize Cytoscape
    function initCytoscape(elements) {
        console.log('Initializing Cytoscape with elements:', {
            nodes: elements.nodes.map(n => ({ id: n.data.id, name: n.data.name })),
            edges: elements.edges.map(e => ({ id: e.data.id, source: e.data.source, target: e.data.target }))
        });
        
        if (cy) {
            cy.destroy();
        }

        const container = document.getElementById('cy');
        console.log('Cytoscape container dimensions:', {
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        cy = cytoscape({
            container: container,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'border-width': 2,
                        'border-color': '#e2e8f0',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'text-wrap': 'wrap',
                        'text-max-width': '150px',
                        'font-size': '14px',
                        'font-weight': '500',
                        'color': '#1f2937',
                        'padding': '10px',
                        'shape': 'roundrectangle',
                        'width': 144,
                        'height': 72,
                        'text-justification': 'center',
                        'text-margin-y': 8,
                        'text-margin-x': 8,
                        'text-overflow-wrap': 'anywhere',
                        'text-events': 'yes',
                        'label': 'data(id)'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#94a3b8',
                        'target-arrow-color': '#94a3b8',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(description)',
                        'text-rotation': 'autorotate',
                        'text-margin-y': -10,
                        'font-size': '12px',
                        'text-wrap': 'wrap',
                        'text-max-width': '200px'
                    }
                },
                {
                    selector: 'edge[?error]',
                    style: {
                        'line-color': '#ef4444',
                        'target-arrow-color': '#ef4444',
                        'line-style': 'dashed',
                        'label': 'data(error)'
                    }
                }
            ],
            layout: {
                name: 'preset',
                fit: true,
                padding: 50
            }
        });

        // Add debug logging for layout events
        cy.on('layoutstart', function() {
            console.log('Layout started');
        });

        cy.on('layoutstop', function() {
            console.log('Layout complete');
            console.log('Current node positions:', cy.nodes().map(n => ({
                id: n.id(),
                position: n.position()
            })));
            saveLayoutButton.classList.remove('hidden');
        });

        // Node click handler
        cy.on('tap', 'node', function(evt) {
            const node = evt.target;
            console.log('Node clicked:', {
                id: node.id(),
                data: node.data(),
                position: node.position()
            });
            hideEdgeDetails();
            showNodeDetails(node);
            evt.preventDefault();
            evt.stopPropagation();
        });

        // Edge click handler
        cy.on('tap', 'edge', function(evt) {
            const edge = evt.target;
            console.log('Edge clicked:', {
                id: edge.id(),
                data: edge.data()
            });
            hideDetails();
            showEdgeDetails(edge);
            evt.preventDefault();
            evt.stopPropagation();
        });

        // Background click handler
        cy.on('tap', function(evt) {
            if (evt.target === cy) {
                hideDetails();
                hideEdgeDetails();
            }
        });

        // Add error handler
        cy.on('error', function(evt) {
            console.error('Cytoscape error:', evt);
        });

        // Show save button after initialization
        saveLayoutButton.classList.remove('hidden');
    }

    function showNodeDetails(node) {
        const detailsPanel = document.getElementById('nodeDetails');
        const detailsContent = document.getElementById('details-content');
        const colorPicker = document.getElementById('nodeColorPicker');
        
        // Set the current node color in the color picker
        colorPicker.value = node.data('color') || '#ffffff';
        
        // Create a more structured and styled details view
        const details = node.data();
        let html = `
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Name</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">${details.name}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Type</h3>
                    <p class="mt-1 text-base text-gray-900">${details.type}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Description</h3>
                    <p class="mt-1 text-base text-gray-900">${details.description || 'No description available'}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Properties</h3>
                    <div class="mt-2 space-y-2">
                        ${Object.entries(details.properties || {}).map(([key, value]) => `
                            <div class="flex justify-between py-1 border-b border-gray-100">
                                <span class="text-sm text-gray-600">${key}</span>
                                <span class="text-sm text-gray-900">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        detailsContent.innerHTML = html;
        detailsPanel.classList.remove('hidden');
        window.selectedElement = node;
    }

    function showEdgeDetails(edge) {
        const detailsPanel = document.getElementById('edgeDetails');
        const detailsContent = document.getElementById('edge-details-content');
        
        // Create a more structured and styled details view
        const details = edge.data();
        let html = `
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Flow Key</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">${details.id}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Description</h3>
                    <p class="mt-1 text-base text-gray-900">${details.description || 'No description available'}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Properties</h3>
                    <div class="mt-2 space-y-2">
                        ${Object.entries(details).map(([key, value]) => {
                            if (key !== 'id' && key !== 'source' && key !== 'target' && key !== 'description') {
                                return `
                                    <div class="flex justify-between py-1 border-b border-gray-100">
                                        <span class="text-sm text-gray-600">${key}</span>
                                        <span class="text-sm text-gray-900">${value || ''}</span>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        detailsContent.innerHTML = html;
        detailsPanel.classList.remove('hidden');
        window.selectedEdge = edge;
    }

    // Process Excel file
    function processExcelFile(file) {
        console.log('Processing file:', file.name);
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                console.log('File loaded, processing data...');
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                console.log('Workbook sheets:', workbook.SheetNames);
                
                // Get both sheets (English only, no ampersand)
                const sourcesSheet = workbook.Sheets['Sources and Targets'];
                const flowsSheet = workbook.Sheets['Data Flows and Processes'];
                
                if (!sourcesSheet || !flowsSheet) {
                    showError('Required sheets not found in the Excel file. Please check the file format.');
                    return;
                }
                
                // Convert sheets to JSON with headers
                sourcesData = XLSX.utils.sheet_to_json(sourcesSheet, {
                    raw: false,
                    defval: null,
                    header: 1
                });
                flowsData = XLSX.utils.sheet_to_json(flowsSheet, {
                    raw: false,
                    defval: null,
                    header: 1
                });

                // Get headers
                const sourcesHeaders = sourcesData[0].map(h => h && h.toString().trim().toLowerCase());
                const flowsHeaders = flowsData[0].map(h => h && h.toString().trim().toLowerCase());
                
                // Remove header rows
                sourcesData = sourcesData.slice(1);
                flowsData = flowsData.slice(1);
                
                // Create nodes and edges
                const elements = {
                    nodes: [],
                    edges: []
                };
                
                const nodeSet = new Set();
                const edgeSet = new Set();
                const invalidEdges = [];
                
                // Helper to get value by header name
                function getByHeader(row, headers, name) {
                    const idx = headers.indexOf(name);
                    return idx !== -1 ? row[idx] : '';
                }

                // Process sources and destinations
                sourcesData.forEach((row, index) => {
                    // Skip empty lines (all cells empty or key missing)
                    if (!row || row.length === 0 || row.every(cell => !cell || cell.toString().trim() === '')) return;
                    const key = getByHeader(row, sourcesHeaders, 'key')?.toString().trim();
                    if (!key) return;
                    if (!nodeSet.has(key)) {
                        const nodeData = {
                            data: { 
                                id: key, 
                                name: getByHeader(row, sourcesHeaders, 'name') || key,
                                description: getByHeader(row, sourcesHeaders, 'description') || '',
                                type: getByHeader(row, sourcesHeaders, 'type') || '',
                                color: getByHeader(row, sourcesHeaders, 'color') || '#ffffff',
                                properties: {
                                    data_format: getByHeader(row, sourcesHeaders, 'data_format') || '',
                                    data_quality: getByHeader(row, sourcesHeaders, 'data_quality') || '',
                                    latency: getByHeader(row, sourcesHeaders, 'latency') || '',
                                    consolidation_level: getByHeader(row, sourcesHeaders, 'consolidation_level') || '',
                                    pain_points: getByHeader(row, sourcesHeaders, 'pain_points') || '',
                                    improvement_potential: getByHeader(row, sourcesHeaders, 'improvement_potential') || ''
                                }
                            },
                            position: {
                                x: parseFloat(getByHeader(row, sourcesHeaders, 'x_position')) || 0,
                                y: parseFloat(getByHeader(row, sourcesHeaders, 'y_position')) || 0
                            }
                        };
                        elements.nodes.push(nodeData);
                        nodeSet.add(key);
                    }
                });
                
                // Process flows/edges using header mapping
                flowsData.forEach(row => {
                    // Skip empty lines (all cells empty or flow_key/source_key/destination_key missing)
                    if (!row || row.length === 0 || row.every(cell => !cell || cell.toString().trim() === '')) return;
                    const flow_key = getByHeader(row, flowsHeaders, 'flow_key')?.toString().trim();
                    const source_key = getByHeader(row, flowsHeaders, 'source_key')?.toString().trim();
                    const destination_key = getByHeader(row, flowsHeaders, 'destination_key')?.toString().trim();
                    
                    if (!flow_key && !source_key && !destination_key) return;
                    
                    if (source_key && destination_key && nodeSet.has(source_key) && nodeSet.has(destination_key) && !edgeSet.has(flow_key)) {
                        const edgeData = {
                            data: {
                                id: flow_key,
                                source: source_key,
                                target: destination_key,
                                description: getByHeader(row, flowsHeaders, 'description') || '',
                                processing_type: getByHeader(row, flowsHeaders, 'processing_type') || '',
                                transformation_logic: getByHeader(row, flowsHeaders, 'transformation_logic') || '',
                                trigger_system: getByHeader(row, flowsHeaders, 'trigger_system') || '',
                                'volume (estimated)': getByHeader(row, flowsHeaders, 'volume (estimated)') || '',
                                frequency: getByHeader(row, flowsHeaders, 'frequency') || '',
                                process_owner: getByHeader(row, flowsHeaders, 'process_owner') || '',
                                pain_points: getByHeader(row, flowsHeaders, 'pain_points') || '',
                                improvement_potential: getByHeader(row, flowsHeaders, 'improvement_potential') || ''
                            }
                        };
                        elements.edges.push(edgeData);
                        edgeSet.add(flow_key);
                    } else {
                        let error = '';
                        if (!flow_key) {
                            error = 'Missing flow key';
                        } else if (!source_key) {
                            error = 'Missing source key';
                        } else if (!destination_key) {
                            error = 'Missing destination key';
                        } else if (!nodeSet.has(source_key)) {
                            error = `Source node "${source_key}" not found`;
                        } else if (!nodeSet.has(destination_key)) {
                            error = `Destination node "${destination_key}" not found`;
                        } else if (edgeSet.has(flow_key)) {
                            error = 'Duplicate flow key';
                        } else {
                            error = 'Unknown error';
                        }
                        
                        invalidEdges.push({
                            id: flow_key || 'No flow key',
                            source: source_key || 'No source',
                            target: destination_key || 'No destination',
                            error: error
                        });
                    }
                });

                // Show error panel if there are invalid edges
                if (invalidEdges.length > 0) {
                    showErrorPanel(invalidEdges);
                }

                // Initialize Cytoscape with the elements
                initCytoscape(elements);
            } catch (error) {
                console.error('Error processing Excel file:', error);
                showError(error.message);
            }
        };
        
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            showError('Error reading file. Please try again.');
        };
        
        reader.readAsArrayBuffer(file);
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium">Error</p>
                    <p class="mt-1 text-sm">${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Remove error message after 10 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 10000);
    }

    function showErrorPanel(invalidEdges) {
        const errorPanel = document.createElement('div');
        errorPanel.className = 'fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-lg z-50 cursor-pointer hover:bg-yellow-200 transition-colors duration-200';
        errorPanel.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium">${invalidEdges.length} invalid edge${invalidEdges.length > 1 ? 's' : ''} found:</p>
                    <ul class="mt-2 text-sm list-disc list-inside">
                        ${invalidEdges.map(edge => `
                            <li><strong>${edge.id}</strong>: ${edge.error}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Add click event listener to remove the panel
        errorPanel.addEventListener('click', () => {
            errorPanel.remove();
        });

        document.body.appendChild(errorPanel);
    }
}); 