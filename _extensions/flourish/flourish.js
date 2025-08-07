document.addEventListener("DOMContentLoaded", () => {
    // Add default styleSheet; set custom counter to 1
    addStyle(document);
    let styleCounter = 1;

    // Find all flourish cells
    const flourishCells = document.querySelectorAll('div.cell[data-flourish]');

    // LOGGING
    console.log(`Found ${flourishCells.length} cells with data-flourish attribute`);

    // Process each flourish cell
    flourishCells.forEach((cell, index) => {

        const flourishAttr = cell.getAttribute('data-flourish');
        const parsedData = parseDataFlourish(flourishAttr);
        if (!parsedData) return;

        // Find only the code chunks you care about
        const sourceEls = Array.from(cell.querySelectorAll('code'))
            .filter(el => !el.closest('.cell-output') && !el.closest('.cell-output-stdout'));

        // For each code chunk, add flourishes
        sourceEls.forEach(el => {

            let content = el.innerHTML;

            // For each regex, look for it and flourish
            parsedData.forEach(pattern => {
                // Default className
                let className = "flr-default";
                let styles = pattern.style;

                // If pattern includes a custom style, insert the style block
                if (styles !== 'default') {

                    // Join multiple elements into string
                    let classText = (Array.isArray(styles) ? styles : [styles]).join('\n');

                    // Generate a unique class name
                    className = `flr-custom-${styleCounter}`;

                    addStyle(document, className, classText);
                    styleCounter++;
                }

                // Apply flourishes with the appropriate class name
                content = injectFlourishes(content, new RegExp(pattern.regex.source, 'g'), className, mask = pattern.mask);
            });

            // Replace chunk interior
            el.innerHTML = content;
        });
    });
});

// Helper function for parsing YAML
function parseDataFlourish(flourishAttr) {
    try {
        const entries = [].concat(JSON.parse(flourishAttr));
        const result = [];

        // Each separate "target" in YAML is its own entry
        entries.forEach(entry => {
            ['target', 'target-rx'].forEach(key => {
                if (!entry[key]) return;

                // normalize to array
                const items = [].concat(entry[key]);

                // pull style out and collect patterns
                let style = entry.style || 'default';
                let mask = entry.mask || false;
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
                    else if (it && it.mask) {
                        mask = it.mask;
                    }
                });

                if (pats.length) {
                    const re = new RegExp(
                        pats.map(p => `(${p})`).join('|'),
                        flags
                    );
                    result.push({ type: key, regex: re, style: style, mask: mask });
                }
            });
        });
        return result;
    }
    catch {
        return null;
    }
}

// Function for making style sheets
function addStyle(document, className = "flr-default",
    styleText = `background-color: yellow;
        display: inline;
        color: inherit;`) {

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
   .${className} {
    ${styleText}
  }
`;
    document.head.appendChild(styleSheet);
}
