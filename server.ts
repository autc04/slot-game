import { join, resolve } from "path";
import { promises as fs } from "fs";
import { createServer } from "http";

const STATIC_PATH = resolve("./dist");
const PORT = process.env.PORT || 8080;

createServer(async (req, res) => {
    if (req.url == "/money") {
        if (req.method === "POST") {
            req.on("data", async (data) => {
                await fs.writeFile("money", data);
                res.end("200");
            });
        } else {
            const data = await fs.readFile("money");
            res.end(data);    
        }
        return;
    }
    const url = req.url === "/" ? "/index.html" : req.url;
    const filePath = join(STATIC_PATH, `${url}`);
    try {
        const data = await fs.readFile(filePath);
        res.end(data);
    } catch (err) {
        res.statusCode = 404;
        res.end(`File "${url}" is not found`);
    }
}).listen(PORT, () => console.log(`Static on port ${PORT}`));
