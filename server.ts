import express from "express";
import { join, resolve } from "path";
import { promises as fs } from "fs";

const DIST_PATH = resolve("./dist");
const STATE_FILE = resolve("./state.json");
const PORT = process.env.PORT || 8080;

interface InstanceState { money: number; winPayout: number; winBias: number; betPrice: number; jackpotIncrement: number; jackpot: number; shiftingDelay: number; speed: number; }
type AppState = Record<string, InstanceState>;

const DEFAULT_STATE: AppState = {
    "1": { money: 100, winPayout: 10, winBias: 0, betPrice: 5, jackpotIncrement: 0, jackpot: 0, shiftingDelay: 800, speed: 50 },
    "2": { money: 100, winPayout: 10, winBias: 0, betPrice: 5, jackpotIncrement: 0, jackpot: 0, shiftingDelay: 800, speed: 50 },
    "3": { money: 100, winPayout: 10, winBias: 0, betPrice: 5, jackpotIncrement: 0, jackpot: 0, shiftingDelay: 800, speed: 50 },
};

async function readState(): Promise<AppState> {
    try {
        const raw = await fs.readFile(STATE_FILE, "utf8");
        const stored: AppState = JSON.parse(raw);
        const result: AppState = {};
        for (const key of Object.keys(DEFAULT_STATE)) {
            result[key] = { ...DEFAULT_STATE[key], ...stored[key] };
        }
        return result;
    } catch {
        return { ...DEFAULT_STATE };
    }
}

async function writeState(state: AppState): Promise<void> {
    const tmp = STATE_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(state, null, 2));
    await fs.rename(tmp, STATE_FILE);
}

// Serialize all mutations so no read-modify-write cycles interleave.
let stateQueue: Promise<void> = Promise.resolve();

function updateState(fn: (state: AppState) => void): Promise<AppState> {
    const next = stateQueue.then(async () => {
        const state = await readState();
        fn(state);
        await writeState(state);
        broadcast(state);
        return state;
    });
    stateQueue = next.then(() => {}, () => {});
    return next;
}

// SSE clients
const sseClients = new Set<express.Response>();

function broadcast(state: AppState): void {
    const payload = `data: ${JSON.stringify(state)}\n\n`;
    sseClients.forEach(client => client.write(payload));
}

const app = express();
app.use(express.text());

// Money API
app.get("/:instance/money", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].money);
});

app.post("/:instance/money", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 0) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].money = amount; });
    res.end("ok");
});

// Win payout API
app.get("/:instance/win-amount", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].winPayout ?? 10);
});

app.post("/:instance/win-amount", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 0) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].winPayout = amount; });
    res.end("ok");
});

// Win bias API
app.get("/:instance/win-bias", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].winBias ?? 0);
});

app.post("/:instance/win-bias", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < -10 || amount > 10) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].winBias = amount; });
    res.end("ok");
});

// Bet price API
app.get("/:instance/bet-price", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].betPrice ?? 5);
});

app.post("/:instance/bet-price", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 1) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].betPrice = amount; });
    res.end("ok");
});

// Jackpot increment API
app.get("/:instance/jackpot-increment", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].jackpotIncrement ?? 0);
});

app.post("/:instance/jackpot-increment", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 0) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].jackpotIncrement = amount; });
    res.end("ok");
});

// Jackpot API
app.get("/:instance/jackpot", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].jackpot ?? 0);
});

app.post("/:instance/jackpot", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 0) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].jackpot = amount; });
    res.end("ok");
});

// Shifting delay API
app.get("/:instance/shifting-delay", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].shiftingDelay ?? 800);
});

app.post("/:instance/shifting-delay", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 0) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].shiftingDelay = amount; });
    res.end("ok");
});

// Speed API
app.get("/:instance/speed", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const state = await readState();
    res.json(state[instance].speed ?? 50);
});

app.post("/:instance/speed", async (req, res) => {
    const instance = req.params.instance;
    if (instance !== '1' && instance !== '2' && instance !== '3') { res.status(404).end(); return; }
    const amount = parseInt(req.body, 10);
    if (isNaN(amount) || amount < 1) { res.status(400).end("Invalid amount"); return; }
    await updateState(s => { s[instance].speed = amount; });
    res.end("ok");
});

// SSE stream for admin
app.get("/admin/events", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));

    const state = await readState();
    res.write(`data: ${JSON.stringify(state)}\n\n`);
});

// Static files
app.use("/1", express.static(join(DIST_PATH, "1")));
app.use("/2", express.static(join(DIST_PATH, "2")));
app.use("/3", express.static(join(DIST_PATH, "3")));
app.use("/admin", express.static(join(DIST_PATH, "admin")));
app.use(express.static(DIST_PATH));

// Convenience redirects
app.get("/", (_req, res) => res.redirect("/1/"));
app.get("/1", (_req, res) => res.redirect("/1/"));
app.get("/2", (_req, res) => res.redirect("/2/"));
app.get("/3", (_req, res) => res.redirect("/3/"));
app.get("/admin", (_req, res) => res.redirect("/admin/"));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));

