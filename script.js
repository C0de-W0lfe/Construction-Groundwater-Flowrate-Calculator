document.getElementById('calculate-button').addEventListener('click', () => {
    const soilType = document.getElementById('soil_type').value;
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const depth = parseFloat(document.getElementById('depth').value);
    const groundwaterDepth = parseFloat(document.getElementById('groundwater_depth').value);

    const errorDiv = document.getElementById('error');
    const resultsContainer = document.getElementById('results-container');
    const resultsTable = document.getElementById('results-table');

    errorDiv.style.display = 'none';
    resultsContainer.style.display = 'none';
    resultsTable.innerHTML = '';

    if (!soilType || isNaN(length) || isNaN(width) || isNaN(depth) || isNaN(groundwaterDepth)) {
        errorDiv.textContent = 'Please fill out all fields with valid values.';
        errorDiv.style.display = 'block';
        return;
    }

    const KRanges = {
        silty_sand: [20, 100],
        fine_sand: [100, 150],
        medium_sand: [150, 525],
        coarse_sand: [525, 2250]
    };

    const [KMin, KMax] = KRanges[soilType];
    const rw = (length + width) / Math.PI;
    const aquiferDepth = Math.max((depth + 15) * 1.5, 40);
    const H = aquiferDepth - groundwaterDepth;
    const hw = aquiferDepth - (depth + 3);
    const dryDepth = aquiferDepth - hw;

    if (H <= 0 || hw <= 0 || H <= hw || dryDepth < 0) {
        errorDiv.textContent = 'Invalid input values. Please check your inputs.';
        errorDiv.style.display = 'block';
        return;
    }

    const calculateRo = (K) => 3000 * (H - hw) * Math.sqrt(K * 0.0000004724) + rw;
    const RoMin = calculateRo(KMin);
    const RoMax = calculateRo(KMax);

    if (RoMin <= rw || RoMax <= rw) {
        errorDiv.textContent = 'Radius of influence (Ro) must be greater than well radius (rw).';
        errorDiv.style.display = 'block';
        return;
    }

    const calculateQ = (K, Ro) => {
        const numerator = K * (H ** 2 - hw ** 2);
        const denominator = 458 * Math.log(Ro / rw);
        return denominator > 0 ? numerator / denominator : 0;
    };

    const QMin = calculateQ(KMin, RoMin);
    const QMax = calculateQ(KMax, RoMax);

    const results = [
        ['Flow Rate (gpm)', `${Math.round(QMin)} - ${Math.round(QMax)}`],
        ['Hydraulic Conductivity (gpd/ft²)', `${KMin} - ${KMax}`], // Updated to show min and max
        ['Radius of Influence (ft)', `${Math.round(RoMin)} - ${Math.round(RoMax)}`], // Updated to show min and max
        ['Dry Depth (ft)', Math.round(dryDepth)],
        ['Aquifer Depth (ft)', Math.round(aquiferDepth)]
    ];

    results.forEach(([label, value]) => {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        const valueCell = document.createElement('td');
        labelCell.textContent = label;
        valueCell.textContent = value;
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        resultsTable.appendChild(row);
    });

    resultsContainer.style.display = 'block';
});
