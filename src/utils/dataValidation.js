export const validateDiabetesData = (csvText, requiredColumns) => {
  try {
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      return {
        isValid: false,
        message: 'CSV file is empty or has no data rows',
        details: null
      };
    }

    // Parse header
    const header = lines[0].split(/,|\t/).map(col => col.trim());

    // Check required columns
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      return {
        isValid: false,
        message: 'Missing required columns',
        details: {
          rowCount: lines.length - 1,
          columnCount: header.length,
          missingColumns
        }
      };
    }

    // Check minimum rows (excluding header)
    const dataRows = lines.length - 1;
    if (dataRows < 200) {
      return {
        isValid: false,
        message: `Insufficient data. Found ${dataRows} rows, need at least 200 rows.`,
        details: {
          rowCount: dataRows,
          columnCount: header.length
        }
      };
    }

    // Parse preview data (first 5 rows)
    const preview = [];
    for (let i = 1; i <= Math.min(5, dataRows); i++) {
      const values = lines[i].split(/,|\t/).map(v => v.trim());
      const row = {};
      header.forEach((col, idx) => {
        row[col] = values[idx];
      });
      preview.push(row);
    }

    return {
      isValid: true,
      message: `✅ Validation successful! ${dataRows} rows found.`,
      details: {
        rowCount: dataRows,
        columnCount: header.length
      },
      preview
    };

  } catch (error) {
    return {
      isValid: false,
      message: 'Error parsing CSV file. Please check the format.',
      details: null
    };
  }
};