import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_SECTIONS = ["cyprus", "lebanon", "gifts"];

const fileForSection = (section) => {
  const names = {
    cyprus:  "expenses-cyprus.json",
    lebanon: "expenses-lebanon.json",
    gifts:   "gifts.json",
  };
  return path.join(__dirname, "../data", names[section]);
};

const readSection = (section) => {
  try {
    return JSON.parse(fs.readFileSync(fileForSection(section), "utf-8"));
  } catch {
    return [];
  }
};

const writeSection = (section, data) => {
  fs.writeFileSync(fileForSection(section), JSON.stringify(data, null, 2), "utf-8");
};

const validateSection = (req, res) => {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    res.status(400).json({ message: `Invalid section. Use: ${VALID_SECTIONS.join(", ")}` });
    return false;
  }
  return true;
};

export const getItems = (req, res) => {
  try {
    if (!validateSection(req, res)) return;
    res.status(200).json(readSection(req.params.section));
  } catch (err) {
    res.status(500).json({ message: "Failed to read data", error: err.message });
  }
};

export const createItem = (req, res) => {
  try {
    if (!validateSection(req, res)) return;
    const { section } = req.params;
    const body = req.body;

    const isGifts = section === "gifts";
    if (isGifts && !body.from) return res.status(400).json({ message: "from is required" });
    if (!isGifts && (!body.name || body.amount == null)) return res.status(400).json({ message: "name and amount are required" });

    const item = isGifts
      ? {
          id: uuidv4(),
          from: body.from?.trim(),
          description: body.description?.trim() || "",
          amount: body.amount != null ? parseFloat(body.amount) : null,
          received: body.received !== false,
          thankYouSent: body.thankYouSent === true,
          notes: body.notes?.trim() || "",
          createdAt: new Date().toISOString(),
        }
      : {
          id: uuidv4(),
          name: body.name?.trim(),
          amount: parseFloat(body.amount),
          status: body.status === "paid" ? "paid" : "unpaid",
          notes: body.notes?.trim() || "",
          category: body.category?.trim() || "",
          dueDate: body.dueDate || null,
          paidDate: body.paidDate || null,
          createdAt: new Date().toISOString(),
        };

    const items = readSection(section);
    items.push(item);
    writeSection(section, items);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to create item", error: err.message });
  }
};

export const updateItem = (req, res) => {
  try {
    if (!validateSection(req, res)) return;
    const { section, id } = req.params;
    const items = readSection(section);
    const idx = items.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ message: "Item not found" });

    items[idx] = { ...items[idx], ...req.body, updatedAt: new Date().toISOString() };
    if (req.body.amount != null) items[idx].amount = parseFloat(req.body.amount);
    writeSection(section, items);
    res.status(200).json(items[idx]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item", error: err.message });
  }
};

export const deleteItem = (req, res) => {
  try {
    if (!validateSection(req, res)) return;
    const { section, id } = req.params;
    const items = readSection(section);
    const filtered = items.filter((e) => e.id !== id);
    if (filtered.length === items.length) return res.status(404).json({ message: "Item not found" });
    writeSection(section, filtered);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
};
