import anthonyPerla from "./anthony-perla.js";
import justinYara   from "./justin-yara.js";

const clients = {
  "anthony-perla": anthonyPerla,
  "justin-yara":   justinYara,
};

export const getClient = (clientId) => clients[clientId] || null;
export const allClientIds = () => Object.keys(clients);

export default clients;
