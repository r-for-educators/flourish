document.addEventListener("DOMContentLoaded", () => {

    // Add default styling for highlighted elements
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
    .flr-default {
        background-color: yellow;
        display: inline;
        color: inherit;
    }
    `;
    document.head.appendChild(styleSheet);


    // Find all flourish cells
    const flourishCells = document.querySelectorAll('div.cell[data-flourish]');
    
    // LOGGING
    console.log(`Found ${flourishCells.length} cells with data-flourish attribute`);

    // Process each flourish cell
    flourishCells.forEach((cell, index) => {
        const flourishAttr = cell.getAttribute('data-flourish');
        const parsedData = parseDataFlourish(flourishAttr);
        if (!parsedData) return;
        console.log(parsedData);

        // find only the code chunks you care about
        const sourceEls = Array.from(cell.querySelectorAll('pre, code, .sourceCode'))
            .filter(el => !el.closest('.cell-output') && !el.closest('.cell-output-stdout'));

        sourceEls.forEach(el => {
            let content = el.innerHTML;
            // let content = el.outerHTML;
            parsedData.forEach(pattern => {
                content = injectFlourishes(content, pattern.regex.source);
            });
            el.innerHTML = content;
            // el.outerHTML = content;
        });
    });
});


// Helper function for parsing YAML
    function parseDataFlourish(flourishAttr) {
        try {
            const entries = [].concat(JSON.parse(flourishAttr));
            const result = [];

            entries.forEach(entry => {
                ['target', 'target-rx'].forEach(key => {
                    if (!entry[key]) return;

                    // normalize to array
                    const items = [].concat(entry[key]);

                    // pull style out, collect patterns
                    let style = entry.style || 'default';
                    let flags = key === 'target-rx' ? 'g' : undefined;
                    const pats = [];

                    items.forEach(it => {
                        if (typeof it === 'string') {
                            pats.push(it);
                        }
                        else if (it && it.style) {
                            style = it.style;
                        }
                        else if (it && it.source) {
                            pats.push(it.source);
                            if (it.flags) flags = it.flags;
                        }
                    });

                    if (pats.length) {
                        const re = new RegExp(
                            pats.map(p => `(${p})`).join('|'),
                            flags
                        );
                        result.push({ type: key, regex: re, style });
                    }
                });
            });

            return result;
        }
        catch {
            return null;
        }
    }

