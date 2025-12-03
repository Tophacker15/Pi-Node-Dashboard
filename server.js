import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.set('view engine', 'ejs');

const HORIZON_URL = 'http://4.194.35.14:31401';

// Run shell commands safely
function execCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) return resolve('Error');
            resolve(stdout.trim());
        });
    });
}

// Read Stellar Core peer + ledger info via pi-node directly
async function fetchCoreStatus() {
    try {
        const raw = await execCommand('pi-node protocol-status');
        if (raw === 'Error') return null;

        const json = JSON.parse(raw);

        return {
            state: json.info.state || 'Unknown',
            ledger: json.info.ledger.num || 0,
            peers: json.info.peers?.authenticated_count ?? 0
        };
    } catch {
        return null;
    }
}

// Read Horizon info
async function fetchHorizonInfo() {
    try {
        const res = await fetch(HORIZON_URL);
        const data = await res.json();
        return {
            horizonVersion: data.horizon_version || '-',
            coreVersion: data.core_version || '-',
            ingestLatestLedger: data.ingest_latest_ledger ?? 0,
            historyLatestLedger: data.history_latest_ledger ?? 0,
            historyLedgerClosedAt: data.history_latest_ledger_closed_at || '-',
            coreLatestLedger: data.core_latest_ledger ?? 0,
            networkPassphrase: data.network_passphrase || '-',
            currentProtocolVersion: data.current_protocol_version ?? 0,
            supportedProtocolVersion: data.supported_protocol_version ?? 0,
            coreSupportedProtocolVersion: data.core_supported_protocol_version ?? 0
        };
    } catch {
        return {
            horizonVersion: '-',
            coreVersion: '-',
            ingestLatestLedger: 0,
            historyLatestLedger: 0,
            historyLedgerClosedAt: '-',
            coreLatestLedger: 0,
            networkPassphrase: '-',
            currentProtocolVersion: 0,
            supportedProtocolVersion: 0,
            coreSupportedProtocolVersion: 0
        };
    }
}

app.get('/', (req, res) => res.render('index'));

app.get('/api/status', async (req, res) => {
    const dockerStatus = await execCommand('docker ps --filter "name=mainnet" --format "{{.Status}}"');
    const containerStatus = dockerStatus.includes('Up') ? 'Running ✅' : 'Stopped ❌';

    const core = await fetchCoreStatus();
    const horizon = await fetchHorizonInfo();

    const coreStatus = {
        state: core?.state || 'Error ❌',
        ledger: core?.ledger || 0,
        peers: core?.peers ?? 0
    };

    const horizonStatus = {
        latestLedger: horizon.coreLatestLedger,
        closedAt: horizon.historyLedgerClosedAt
    };

    const syncProgress = (
        horizon.coreLatestLedger && coreStatus.ledger ?
        ((horizon.coreLatestLedger / coreStatus.ledger) * 100).toFixed(2) :
        0
    );

    res.json({
        containerStatus,
        coreStatus,
        horizonStatus,
        horizonInfo: horizon,
        syncProgress
    });
});

app.listen(PORT, () =>
    console.log(`Pi Node Dashboard running at http://localhost:${PORT}`)
);
