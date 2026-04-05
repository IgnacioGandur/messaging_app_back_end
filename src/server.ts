import { server } from "./socket.js";

const PORT = process.env.PORT ?? "3000";

server.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});
