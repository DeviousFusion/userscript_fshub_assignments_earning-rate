// ==UserScript==
// @name         FSHub QoL Script
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Add custom data to FSHub
// @author       DeviousFusion
// @match        https://fshub.io/vaap/*/assignments
// @match        https://fshub.io/vaap/*/duty
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // #### Assignments Table ####
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
            if (row.querySelector('td#fliggi-bucks-per-nm')) return; // Avoid re-processing

            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const fliggiBucksText = cells[1].innerText.replace('F$', '').trim().replace(/,/g, '');
                const distanceText = cells[3].innerText.replace('NM', '').trim().replace(/,/g, '');

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

    // #### Duty Schedule ####
    // Helper function to parse values and bonuses from the text contents
    function parseValueAndBonus(text) {
        const valueMatch = text.match(/F\$ (\d+)/);
        const bonusMatch = text.match(/\+(\d+)/);
        const value = valueMatch ? parseInt(valueMatch[1], 10) : 0;
        const bonus = bonusMatch ? parseInt(bonusMatch[1], 10) : 0;
        return {
            value,
            bonus,
            total: value + bonus
        };
    }

    // Helper function to parse miles from separated element
    function parseMiles(text) {
        const milesMatch = text.match(/(\d+)\s*nm/);
        return milesMatch ? parseInt(milesMatch[1], 10) : 0;
    }

    // Function to retrieve and sum up values and bonuses
    function calculateAndDisplayTotals() {
        let totalSum = 0;
        let totalMiles = 0;

        const rows = document.querySelectorAll('.row.progress-stats');
        rows.forEach(row => {
            const valueElement = row.querySelector('span[id="fp-ete"]');
            const milesElement = row.querySelector('span[id="fp-dnm"]');

            const { value, bonus, total } = parseValueAndBonus(valueElement.textContent);
            const miles = parseMiles(milesElement.textContent);

            valueElement.textContent += `= F$ ${total}`;

            // Sum up for the grand total and total miles
            totalSum += total;
            totalMiles += miles;
        });

        // Display the grand total and total miles after "My duty schedule"
        const dutyScheduleTitle = document.querySelector('.panel-title');
        if (dutyScheduleTitle) {
            const grandTotalDisplay = document.createElement('span');
            grandTotalDisplay.textContent = `Total schedule value: F$ ${totalSum}, Total miles: ${totalMiles} nm`;
            grandTotalDisplay.style.cssText = 'float: right;';
            dutyScheduleTitle.appendChild(grandTotalDisplay);
        }
    }

    // #### Observer setup ####
    // Create a MutationObserver to observe changes in the DOM that indicate table rows being added or changed
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.target.nodeName === 'TBODY') {
                addColumn();
            }
        }
    });

    // Initialize observer to start observing the assignments table for changes
    window.addEventListener('load', function() {
        const targetNodeAssignments = document.getElementById('assignments-table');
        const targetNodeDutySchedule = document.getElementById('schedule-generator');
        if (targetNodeAssignments) {
            observer.observe(targetNodeAssignments.querySelector('tbody'), { childList: true, subtree: true });
            // Initial call to add the column
            addColumn();
        }
        else if (targetNodeDutySchedule) {
            calculateAndDisplayTotals();
        }
    });
})();