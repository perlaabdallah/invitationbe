import Family from "../model/familyModel.js";

// Validate admin passcode (now done on frontend only, but keep for import validation)
const validateAdminPasscode = (passcode) => {
  const correctPasscode = "190599"; // Hardcoded since no .env dependency
  return passcode === correctPasscode;
};

// Parse boolean values from Excel
const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return ["true", "yes", "1"].includes(lower);
  }
  return false;
};

// Validate row data
const validateRow = (row) => {
  const errors = [];
  
  if (!row.guestName || typeof row.guestName !== "string" || row.guestName.trim() === "") {
    errors.push("Missing or invalid guest name");
  }
  
  if (!row.familyId || typeof row.familyId !== "string" || row.familyId.trim() === "") {
    errors.push("Missing or invalid familyId");
  }
  
  return errors;
};

// Generate next guest ID for a family
const generateGuestId = (familyAttendees) => {
  if (familyAttendees.length === 0) return 1;
  const maxId = Math.max(...familyAttendees.map(a => a.guestId || 0));
  return maxId + 1;
};

export const importFamilies = async (req, res) => {
  try {
    const { passcode, rows } = req.body;

    // Validate passcode
    if (!validateAdminPasscode(passcode)) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin passcode"
      });
    }

    // Validate input
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rows data. Expected an array."
      });
    }

    let insertedFamilies = 0;
    let insertedGuests = 0;
    let skippedRows = 0;
    const errors = [];

    // Group rows by familyId
    const familyGroups = {};
    
    rows.forEach((row, index) => {
      // Skip empty rows
      if (!row.guestName && !row.familyId) {
        skippedRows++;
        return;
      }

      // Validate row
      const rowErrors = validateRow(row);
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(", ")}`);
        skippedRows++;
        return;
      }

      // Clean and prepare data
      const familyId = row.familyId.toString().trim();
      const guestName = row.guestName.toString().trim();
      const attending = parseBoolean(row.attended);

      if (!familyGroups[familyId]) {
        familyGroups[familyId] = [];
      }

      familyGroups[familyId].push({
        name: guestName,
        attending: attending
      });
    });

    // Process each family group
    const familiestoInsert = [];
    
    for (const [familyId, guests] of Object.entries(familyGroups)) {
      try {
        // For now, always create new families during import
        // In the future, you could add duplicate checking logic here
        // using standard MongoDB queries instead of $where
        
        // Assign guestIds sequentially within each family
        const attendees = guests.map((guest, index) => ({
          guestId: index + 1,
          name: guest.name,
          attending: guest.attending
        }));

        const familyDoc = {
          attendees: attendees,
          giftRegistry: true
        };

        familiestoInsert.push(familyDoc);
        insertedGuests += guests.length;
        
      } catch (error) {
        errors.push(`Error processing family ${familyId}: ${error.message}`);
      }
    }

    // Insert all families at once
    if (familiestoInsert.length > 0) {
      try {
        await Family.insertMany(familiestoInsert);
        insertedFamilies = familiestoInsert.length;
      } catch (error) {
        errors.push(`Database insert error: ${error.message}`);
      }
    }

    // Return summary
    res.status(200).json({
      success: true,
      summary: {
        insertedFamilies,
        insertedGuests,
        skippedRows,
        errors,
        processedFamilyGroups: Object.keys(familyGroups).length
      }
    });

  } catch (error) {
    console.error("Admin import error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during import",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};