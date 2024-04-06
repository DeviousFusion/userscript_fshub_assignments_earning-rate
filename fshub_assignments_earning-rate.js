// ==UserScript==
// @name         Add FliggiBucks per NM Column
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Add column that divides FliggiBucks by Distance on FSHub
// @author       DeviousFusion
// @match        https://fshub.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fetch the assignments table
    const table = document.getElementById('assignments-table');
    
    if (!table) {
        console.log("Assignments table not found!");
        return; // Exit if table not found
    }

    // Function to create the header for the new column
    function addColumnHeader() {
        const headerRow = table.querySelector('thead tr');
        const newHeader = document.createElement('th');
        newHeader.textContent = 'F$/NM';
        headerRow.appendChild(newHeader);
    }

    // Function to create the value cell for the new column
    function addColumnValues() {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const fliggiBucksText = cells[1].innerText.replace('F$', '').trim();
                const distanceText = cells[3].innerText.match(/(\d+)/)[0];

                console.log(`Parsing row: FliggiBucks = ${fliggiBucksText}, Distance = ${distanceText}`);

                const fliggiBucks = parseFloat(fliggiBucksText);
                const distance = parseFloat(distanceText);

                // Add new cell with calculated value
                const newCell = document.createElement('td');
                if (!isNaN(fliggiBucks) && !isNaN(distance) && distance !== 0) {
                    newCell.textContent = (fliggiBucks / distance).toFixed(2);
                } else {
                    newCell.textContent = 'N/A';
                }
                row.appendChild(newCell);
            } else {
                console.log("No cells found in row!");
            }
        });
    }

    // Add the header and values
    addColumnHeader();
    addColumnValues();
})();