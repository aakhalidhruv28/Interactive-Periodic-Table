document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const periodicTable = document.getElementById('periodic-table');
    const modal = document.getElementById('element-modal');
    const closeButton = document.querySelector('.close-button');
    const searchBox = document.getElementById('search-box');
    const categoryFilter = document.getElementById('filter-category');
    const tempSlider = document.getElementById('temp-slider');
    const tempDisplay = document.getElementById('temp-display');

    let allElementsData = [];
    const API_URL = 'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json';

    // --- DATA FETCHING & INITIALIZATION ---

    async function fetchData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            allElementsData = data.elements;
            init();
        } catch (error) {
            console.error("Failed to load element data:", error);
            periodicTable.innerHTML = `<p style="color:red;">Failed to load element data. Please try again later.</p>`;
        }
    }

    function init() {
        createTable();
        populateCategoryFilter();
        setupEventListeners();
        updatePhases(parseInt(tempSlider.value)); // Initial phase check
    }

    function createTable() {
        periodicTable.innerHTML = ''; // Clear spinner
        const placeholders = [
            { name: "Lanthanides", symbol: "*", number: "57-71", category: "lanthanide", xpos: 3, ypos: 6 },
            { name: "Actinides", symbol: "**", number: "89-103", category: "actinide", xpos: 3, ypos: 7 },
        ];
        const displayElements = [...allElementsData, ...placeholders];
        
        displayElements.forEach(element => {
            const elDiv = document.createElement('div');
            elDiv.className = `element ${element.category.replace(/ /g, '-')}`;
            elDiv.style.gridColumn = element.xpos;
            elDiv.style.gridRow = element.ypos;
            elDiv.innerHTML = `
                <div class="atomic-number">${element.number}</div>
                <div class="symbol">${element.symbol}</div>
                <div class="name">${element.name}</div>
            `;
            // Store data directly on the element for easy access
            elDiv.dataset.elementData = JSON.stringify(element);

            if (typeof element.number === 'number') {
                elDiv.addEventListener('click', () => showElementInfo(element));
            } else {
                elDiv.style.cursor = 'default';
            }
            periodicTable.appendChild(elDiv);
        });
    }

    // --- MODAL LOGIC ---

    function showElementInfo(element) {
        document.getElementById('element-name').textContent = `${element.name} (${element.symbol})`;
        document.getElementById('element-symbol').textContent = element.symbol;
        document.getElementById('element-number').textContent = element.number;
        document.getElementById('element-mass').textContent = `${element.atomic_mass.toFixed(3)} u`;
        document.getElementById('element-category').textContent = element.category.replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('element-phase').textContent = element.phase || 'N/A';
        document.getElementById('element-density').textContent = element.density ? `${element.density} g/L` : 'N/A';
        document.getElementById('element-melt').textContent = element.melt ? `${element.melt} K` : 'N/A';
        document.getElementById('element-boil').textContent = element.boil ? `${element.boil} K` : 'N/A';
        document.getElementById('element-summary').textContent = element.summary;
        document.getElementById('element-discovered-by').textContent = element.discovered_by || 'N/A';
        document.getElementById('element-wiki-link').href = element.source;
        
        modal.style.display = 'block';
    }

    // --- EVENT LISTENERS & HANDLERS ---

    function setupEventListeners() {
        closeButton.onclick = () => modal.style.display = 'none';
        window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };
        
        searchBox.addEventListener('input', handleSearch);
        categoryFilter.addEventListener('change', handleFilter);
        tempSlider.addEventListener('input', handleTemperatureChange);
    }
    
    function populateCategoryFilter() {
        const categories = [...new Set(allElementsData.map(el => el.category))];
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category.replace(/ /g, '-');
            option.textContent = category.replace(/\b\w/g, l => l.toUpperCase());
            categoryFilter.appendChild(option);
        });
    }

    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterAndDimElements(element => {
            if (searchTerm === '') return true; // Show all if search is empty
            const name = element.name.toLowerCase();
            const symbol = element.symbol.toLowerCase();
            const number = String(element.number);
            return name.includes(searchTerm) || symbol.startsWith(searchTerm) || number === searchTerm;
        });
    }

    function handleFilter(e) {
        const selectedCategory = e.target.value;
        filterAndDimElements(element => {
            if (selectedCategory === 'all') return true;
            return element.category.replace(/ /g, '-') === selectedCategory;
        });
    }
    
    function filterAndDimElements(testFunction) {
        document.querySelectorAll('.element').forEach(el => {
            const data = JSON.parse(el.dataset.elementData);
            if (testFunction(data)) {
                el.classList.remove('dimmed');
            } else {
                el.classList.add('dimmed');
            }
        });
    }

    function handleTemperatureChange(e) {
        const temp = parseInt(e.target.value);
        tempDisplay.textContent = `${temp} K`;
        updatePhases(temp);
    }

    function updatePhases(temp) {
        document.querySelectorAll('.element').forEach(el => {
            const data = JSON.parse(el.dataset.elementData);
            
            // Remove previous phase classes
            el.classList.remove('phase-solid', 'phase-liquid', 'phase-gas', 'phase-unknown');

            let phaseClass = 'phase-unknown';
            if (data.melt != null) {
                if (temp < data.melt) {
                    phaseClass = 'phase-solid';
                } else if (data.boil != null && temp < data.boil) {
                    phaseClass = 'phase-liquid';
                } else {
                    phaseClass = 'phase-gas';
                }
            }
            el.classList.add(phaseClass);
        });
    }

    // --- START THE APP ---
    fetchData();
});
