import app from "./app";
import Server from "http";
import logger from "./utils/logger";
import { Session } from "better-sse";
import ngrok from "@ngrok/ngrok";

declare module "express-serve-static-core" {
	interface Response {
		sse: Session;
	}
}

const PORT = process.env.PORT;

const server = Server.createServer(app);

server.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}.`);
  logger.info(`Send requests to http://localhost:${PORT}/api/ldai-model/v1`);
  logger.info(`Press CTRL + C to stop server.`);
  
  const listener = await ngrok.forward({
    addr: process.env.NODE_ENV === "production" ? `model-ms:${PORT}` : PORT,
    authtoken: process.env.NGROK_AUTH_TOKEN,
    onStatusChange: (status: string) => logger.warn(status), 
    domain: process.env.NGROK_DOMAIN,
    proto: "http"
  });

  logger.warn(`Ngrok tunnel is active at ${listener.url()}/api/ldai-model/v1`);
});
