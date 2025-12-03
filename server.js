const express = require('express');
const { execSync } = require('child_process');
const app = express();
const port = 3000;

const CONTAINER_NAME = 'mainnet';
const HORIZON_URL = 'http://localhost:31401';

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ambil status Docker container
function getDockerStatus() {
    try {
        const output = execSync(`docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME}`);
        return output.toString().trim() === 'true' ? 'Running ✅' : 'Stopped ❌';
    } catch(err) {
        return 'Not found ❌';
    }
}

// Ambil ledger terbaru dari Horizon (fetch bawaan Node 18+)
async function getHorizonStatus() {
    try {
        const res = await fetch(`${HORIZON_URL}/ledgers?order=desc&limit=1`);
        const data = await res.json();
        const ledger = data._embedded.records[0];
        return {
            latestLedger: ledger.sequence,
            closedAt: ledger.closed_at
        };
    } catch(err) {
        console.error('Horizon fetch error:', err);
        return { latestLedger: 0, closedAt: null };
    }
}

// Endpoint API untuk frontend
app.get('/api/status', async (req, res) => {
    const containerStatus = getDockerStatus();
    const horizonStatus = await getHorizonStatus();

    // Core ledger estimasi = Horizon ledger
    const coreLedger = horizonStatus.latestLedger;
    const corePeers = 'N/A'; // Tidak tersedia
    const syncProgress = coreLedger ? 100 : 0;

    res.json({
        containerStatus,
        coreStatus: {
            state: coreLedger ? 'Synced ✅' : 'Error ❌',
            ledger: coreLedger,
            peers: corePeers
        },
        horizonStatus,
        syncProgress: syncProgress.toFixed(2)
    });
});

// Halaman utama
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Pi Node Dashboard running at http://localhost:${port}`);
});
