// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileUpload = document.getElementById('file-upload');
const resultsSection = document.getElementById('results');
const loadingSpinner = document.getElementById('loading');
const errorToast = document.getElementById('error-toast');
const errorMessage = document.getElementById('error-message');

// Tab handling
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Statistics elements
const pagesCount = document.getElementById('pages-count');
const visualsCount = document.getElementById('visuals-count');
const measuresCount = document.getElementById('measures-count');
const tablesCount = document.getElementById('tables-count');

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Update button states
        tabButtons.forEach(btn => {
            btn.classList.remove('border-blue-500', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        button.classList.add('border-blue-500', 'text-blue-600');
        button.classList.remove('border-transparent', 'text-gray-500');
        
        // Update content visibility
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    });
});

// Drag and drop handling
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('border-blue-500', 'bg-blue-50');
}

function unhighlight() {
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
}

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file input change
fileUpload.addEventListener('change', function(e) {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pbix')) {
        showError('Please upload a valid Power BI (.pbix) file');
        return;
    }

    // Show loading state
    resultsSection.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    
    // Simulate file analysis (replace with actual server communication)
    setTimeout(() => {
        analyzePowerBIFile(file);
    }, 1500);
}

function analyzePowerBIFile(file) {
    // Simulated analysis result
    const analysisResult = {
        pages: [
            {
                name: 'Overview Dashboard',
                visuals: [
                    { type: 'Bar Chart', title: 'Sales by Region' },
                    { type: 'Pie Chart', title: 'Product Categories' }
                ],
                filters: ['Region', 'Date Range']
            },
            {
                name: 'Sales Analysis',
                visuals: [
                    { type: 'Line Chart', title: 'Monthly Trends' },
                    { type: 'Table', title: 'Top Products' }
                ],
                filters: ['Product Category', 'Sales Person']
            }
        ],
        measures: [
            { name: 'Total Sales', expression: 'SUM(Sales[Amount])', dependencies: ['Sales Table'] },
            { name: 'YOY Growth', expression: 'CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))', dependencies: ['Sales Table', 'Calendar Table'] }
        ],
        tables: [
            {
                name: 'Sales',
                columns: [
                    { name: 'Amount', type: 'Decimal', isCalculated: false },
                    { name: 'Date', type: 'DateTime', isCalculated: false }
                ]
            },
            {
                name: 'Products',
                columns: [
                    { name: 'ProductID', type: 'Integer', isCalculated: false },
                    { name: 'Category', type: 'String', isCalculated: false }
                ]
            }
        ]
    };

    updateUI(analysisResult);
}

function updateUI(result) {
    // Hide loading spinner
    loadingSpinner.classList.add('hidden');

    // Update statistics
    pagesCount.textContent = result.pages.length;
    visualsCount.textContent = result.pages.reduce((acc, page) => acc + page.visuals.length, 0);
    measuresCount.textContent = result.measures.length;
    tablesCount.textContent = result.tables.length;

    // Update Visuals tab
    const visualsContent = document.getElementById('visuals-content');
    visualsContent.innerHTML = result.pages.map(page => `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">${page.name}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${page.visuals.map(visual => `
                    <div class="bg-gray-50 rounded p-4">
                        <div class="flex items-center">
                            <i class="fas fa-chart-bar text-blue-500 mr-2"></i>
                            <div>
                                <h4 class="font-medium">${visual.title}</h4>
                                <p class="text-sm text-gray-500">${visual.type}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4">
                <h4 class="font-medium text-sm text-gray-700">Filters:</h4>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${page.filters.map(filter => `
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            ${filter}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Update Data Model tab
    const dataModelContent = document.getElementById('data-model-content');
    dataModelContent.innerHTML = `
        <div class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Measures</h3>
                <div class="space-y-4">
                    ${result.measures.map(measure => `
                        <div class="bg-gray-50 rounded p-4">
                            <h4 class="font-medium text-blue-600">${measure.name}</h4>
                            <pre class="mt-2 text-sm bg-gray-100 p-2 rounded">${measure.expression}</pre>
                            <div class="mt-2">
                                <span class="text-sm text-gray-600">Dependencies:</span>
                                <div class="flex flex-wrap gap-2 mt-1">
                                    ${measure.dependencies.map(dep => `
                                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${dep}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Tables and Columns</h3>
                <div class="space-y-4">
                    ${result.tables.map(table => `
                        <div class="bg-gray-50 rounded p-4">
                            <h4 class="font-medium text-blue-600">${table.name}</h4>
                            <div class="mt-2 overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Calculated</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        ${table.columns.map(column => `
                                            <tr>
                                                <td class="px-4 py-2 text-sm text-gray-900">${column.name}</td>
                                                <td class="px-4 py-2 text-sm text-gray-500">${column.type}</td>
                                                <td class="px-4 py-2 text-sm text-gray-500">${column.isCalculated ? 'Yes' : 'No'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Update Dependencies tab with a simplified view
    const dependenciesContent = document.getElementById('dependencies-content');
    dependenciesContent.innerHTML = `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Field Dependencies</h3>
            ${result.measures.map(measure => `
                <div class="mb-6">
                    <h4 class="font-medium text-blue-600 mb-2">${measure.name}</h4>
                    <div class="bg-gray-50 p-4 rounded">
                        <div class="mb-2">
                            <span class="text-sm font-medium text-gray-700">Expression:</span>
                            <pre class="mt-1 text-sm bg-gray-100 p-2 rounded">${measure.expression}</pre>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-700">Used in Tables:</span>
                            <div class="flex flex-wrap gap-2 mt-1">
                                ${measure.dependencies.map(dep => `
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${dep}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showError(message) {
    errorMessage.textContent = message;
    errorToast.classList.remove('hidden');
    setTimeout(() => {
        errorToast.classList.add('hidden');
    }, 3000);
}
