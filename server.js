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

// Ambil status Core termasuk peers
function getCoreStatus() {
    try {
        const output = execSync('pi-node protocol-status', { encoding: 'utf-8' });
        const data = JSON.parse(output);
        const ledger = data.info.ledger.num;
        const state = data.info.state === 'Synced!' ? 'Synced ✅' : 'Error ❌';
        const peers = data.info.peers.authenticated_count;
        return { ledger, state, peers };
    } catch(err) {
        return { ledger: 0, state: 'Error ❌', peers: 'N/A' };
    }
}

// Ambil ledger terbaru dari Horizon
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
    const coreStatus = getCoreStatus();
    const horizonStatus = await getHorizonStatus();
    const syncProgress = 100; // Ledger Horizon/Core ada → sinkron

    res.json({
        containerStatus,
        coreStatus,
        horizonStatus,
        syncProgress
    });
});

// Halaman utama
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Pi Node Dashboard running at http://localhost:${port}`);
});
