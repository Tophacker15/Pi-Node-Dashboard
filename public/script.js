const dockerStatusEl = document.getElementById('dockerStatus');
const coreStateEl = document.getElementById('coreState');
const coreLedgerEl = document.getElementById('coreLedger');
const corePeersEl = document.getElementById('corePeers');
const horizonLedgerEl = document.getElementById('horizonLedger');
const horizonClosedAtEl = document.getElementById('horizonClosedAt');
const syncProgressEl = document.getElementById('syncProgress');
const syncPercentEl = document.getElementById('syncPercent');

const ctx = document.getElementById('ledgerChart').getContext('2d');
const ledgerChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Horizon Ledger',
            data: [],
            backgroundColor: 'rgba(255, 204, 0, 0.2)',
            borderColor: 'rgba(255, 204, 0, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        }]
    },
    options: {
        scales: {
            x: { 
                title: { display: true, text: 'Time' },
                ticks: { color: '#e0e0e0' },
                grid: { color: '#333' }
            },
            y: { 
                title: { display: true, text: 'Ledger Sequence' },
                ticks: { color: '#e0e0e0' },
                grid: { color: '#333' }
            }
        },
        plugins: {
            legend: { labels: { color: '#e0e0e0' } }
        }
    }
});

async function fetchStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();

        dockerStatusEl.innerText = data.containerStatus;
        coreStateEl.innerText = data.coreStatus.state;
        coreLedgerEl.innerText = data.coreStatus.ledger;
        corePeersEl.innerText = data.coreStatus.peers;
        horizonLedgerEl.innerText = data.horizonStatus.latestLedger;
        horizonClosedAtEl.innerText = data.horizonStatus.closedAt;

        // Progress bar
        syncProgressEl.style.width = data.syncProgress + '%';
        syncPercentEl.innerText = data.syncProgress + '%';

        // Update chart
        const now = new Date().toLocaleTimeString();
        ledgerChart.data.labels.push(now);
        ledgerChart.data.datasets[0].data.push(data.horizonStatus.latestLedger);

        if (ledgerChart.data.labels.length > 20) {
            ledgerChart.data.labels.shift();
            ledgerChart.data.datasets[0].data.shift();
        }

        ledgerChart.update();

    } catch(err) {
        console.error('Fetch error:', err);
    }
}

fetchStatus();
setInterval(fetchStatus, 10000);
