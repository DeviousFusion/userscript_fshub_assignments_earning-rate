// ==UserScript==
// @name         Add FliggiBucks per NM Column
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Add column that divides FliggiBucks by Distance on FSHub
// @author       DeviousFusion
// @match        https://fshub.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the column header
    function addColumnHeader() {
        const table = document.getElementById('assignments-table');
        if (!table) return;

        const headerRow = table.querySelector('thead tr');
        if (!headerRow) return;

        if (!headerRow.querySelector('th#fliggi-bucks-per-nm')) {
            const newHeader = document.createElement('th');
            newHeader.id = 'fliggi-bucks-per-nm';
            newHeader.textContent = 'F$/NM';
            headerRow.appendChild(newHeader);
        }
    }

    // Function to add column values
    function addColumnValues() {
        const table = document.getElementById('assignments-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (row.querySelector('td#fliggi-bucks-per-nm')) return;

            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const fliggiBucksText = cells[1].innerText.replace('F$', '').trim();
                const distanceText = cells[3].innerText.match(/(\d+)/)[0];

                console.log(`Parsing row: FliggiBucks = ${fliggiBucksText}, Distance = ${distanceText}`);

                const fliggiBucks = parseFloat(fliggiBucksText);
                const distance = parseFloat(distanceText);

                const newCell = document.createElement('td');
                newCell.id = 'fliggi-bucks-per-nm';
                if (!isNaN(fliggiBucks) && !isNaN(distance) && distance !== 0) {
                    const value = (fliggiBucks / distance).toFixed(2);

                    // Apply color coding
                    if (value < 1) {
                        newCell.style.color = 'red';
                    } else if (value < 2) {
                        newCell.style.color = 'yellow';
                    } else {
                        newCell.style.color = 'green';
                    }
                    newCell.textContent = value;
                } else {
                    newCell.textContent = 'N/A';
                }
                row.appendChild(newCell);
            }
        });
    }

    // Function to add both header and values
    function addColumn() {
        addColumnHeader();
        addColumnValues();
    }

    // Create a MutationObserver to observe changes in the DOM
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                addColumn();
            }
        }
    });

    // Start observing the entire document
    observer.observe(document.body, { childList: true, subtree: true });

    // Try to add the column initially in case the table is already there
    addColumn();
})();