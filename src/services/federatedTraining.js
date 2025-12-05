import * as tf from '@tensorflow/tfjs';
import { supabase } from "../supabaseClient";
/* ---------------------------------------------------
   UPLOAD TO SUPABASE STORAGE
--------------------------------------------------- */
export const uploadToSupabase = async (path, fileBlob) => {
  const { data, error } = await supabase
    .storage
    .from("federated-models")   // bucket name
    .upload(path, fileBlob, {
      upsert: true,            // overwrite old model
      contentType: "application/octet-stream"
    });

  if (error) {
    console.error("❌ Supabase upload failed:", error);
    throw error;
  }

  console.log("☁️ Uploaded to Supabase:", path);
  return data;
};

/* ---------------------------------------------------
   1) SAFE CSV PARSER
--------------------------------------------------- */
export const parseCSV = (csvText) => {
  console.log("📥 Parsing CSV...");
  
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(/,|\t/).map(h => h.trim());
  console.log("📌 Headers Detected:", headers);

  const data = lines.slice(1).map((line) => {
    const values = line.split(/,|\t/).map(v => v.trim());
    const row = {};

    headers.forEach((h, i) => {
      row[h] = values[i];
    });

    return row;
  });

  console.log("📊 Parsed Rows:", data.length);
  return data;
};

/* ---------------------------------------------------
   2) LABEL + ONE-HOT + NUMERIC ENCODING (FIXED)
--------------------------------------------------- */
export const encodeData = (data) => {
  console.log("🔄 Encoding data...");

  const smokingMap = { never: 0, former: 1, current: 2, "No Info": 3 };

  const encoded = data
    .map((d, i) => {
      // Skip rows with invalid/missing data
      const age = parseFloat(d.age);
      const bmi = parseFloat(d.bmi);
      const hba1c = parseFloat(d.HbA1c_level);
      const glucose = parseFloat(d.blood_glucose_level);
      
      if (isNaN(age) || isNaN(bmi) || isNaN(hba1c) || isNaN(glucose)) {
        return null;
      }

      return {
        gender: d.gender === "Male" ? 1 : 0,
        age: age,
        hypertension: parseInt(d.hypertension) || 0,
        heart_disease: parseInt(d.heart_disease) || 0,
        smoking_history: smokingMap[d.smoking_history] !== undefined ? smokingMap[d.smoking_history] : 3,
        bmi: bmi,
        HbA1c_level: hba1c,
        blood_glucose_level: glucose,
        diabetes: parseInt(d.diabetes) || 0
      };
    })
    .filter(row => row !== null); // Remove invalid rows

  console.log("✅ Encoding complete! Valid rows:", encoded.length);
  return encoded;
};

/* ---------------------------------------------------
   3) NORMALIZATION FUNCTION (FIXED - handles edge cases)
--------------------------------------------------- */
const normalize = (value, min, max) => {
  if (max === min) return 0.5; // Prevent division by zero
  return (value - min) / (max - min);
};

/* ---------------------------------------------------
   4) TENSOR CREATION + NORMALIZATION (FIXED)
--------------------------------------------------- */
export const createTensors = (encodedData) => {
  console.log("📐 Creating tensors...");

  // Compute MIN/MAX for every numeric column
  const mins = {
    age: Math.min(...encodedData.map(r => r.age)),
    bmi: Math.min(...encodedData.map(r => r.bmi)),
    HbA1c: Math.min(...encodedData.map(r => r.HbA1c_level)),
    glucose: Math.min(...encodedData.map(r => r.blood_glucose_level)),
  };

  const maxs = {
    age: Math.max(...encodedData.map(r => r.age)),
    bmi: Math.max(...encodedData.map(r => r.bmi)),
    HbA1c: Math.max(...encodedData.map(r => r.HbA1c_level)),
    glucose: Math.max(...encodedData.map(r => r.blood_glucose_level)),
  };

  console.log("📊 Data ranges:", { mins, maxs });

  const xs = encodedData.map(r => [
    r.gender,
    normalize(r.age, mins.age, maxs.age),
    r.hypertension,
    r.heart_disease,
    r.smoking_history / 3, // Normalize categorical to [0, 1]
    normalize(r.bmi, mins.bmi, maxs.bmi),
    normalize(r.HbA1c_level, mins.HbA1c, maxs.HbA1c),
    normalize(r.blood_glucose_level, mins.glucose, maxs.glucose),
  ]);

  const ys = encodedData.map(r => r.diabetes);

  console.log("🔢 Sample X row (normalized):", xs[0]);
  console.log("🔢 Sample Y:", ys[0]);
  console.log("📊 Class distribution - Diabetes:", ys.filter(y => y === 1).length, "Non-Diabetes:", ys.filter(y => y === 0).length);

  return {
    xsTensor: tf.tensor2d(xs),
    ysTensor: tf.tensor2d(ys, [ys.length, 1]),
    mins,
    maxs
  };
};

/* ---------------------------------------------------
   5) IMPROVED MODEL ARCHITECTURE
--------------------------------------------------- */
export const createModel = () => {
  console.log("🧠 Creating IMPROVED model...");

  const model = tf.sequential();

  // Input layer with L2 regularization
  model.add(tf.layers.dense({
    units: 64,
    activation: "relu",
    inputShape: [8],
    kernelInitializer: "heNormal",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.3 }));

  // Hidden layer
  model.add(tf.layers.dense({
    units: 32,
    activation: "relu",
    kernelInitializer: "heNormal",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Output layer
  model.add(tf.layers.dense({
    units: 1,
    activation: "sigmoid",
  }));

  // Use lower learning rate for stability
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  console.log("✅ Optimized model ready.");
  model.summary();
  return model;
};

/* ---------------------------------------------------
   6) IMPROVED TRAINING FUNCTION
--------------------------------------------------- */
export const trainDiabetesModel = async (csvData, epochs, onProgress) => {
  console.log("🚀 TRAINING STARTED — Epochs:", epochs);

  try {
    const parsed = parseCSV(csvData);
    
    if (parsed.length === 0) {
      throw new Error("No data parsed from CSV");
    }

    const encoded = encodeData(parsed);
    
    if (encoded.length === 0) {
      throw new Error("No valid data after encoding");
    }

    const { xsTensor, ysTensor, mins, maxs } = createTensors(encoded);

    const model = createModel();

    // Add validation split
    const history = await model.fit(xsTensor, ysTensor, {
      epochs,
      batchSize: 32, // Smaller batch size for better convergence
      shuffle: true,
      validationSplit: 0.2, // 20% validation data
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          const pct = Math.round(((epoch + 1) / epochs) * 100);
          console.log(
            `📘 Epoch ${epoch + 1}/${epochs} | Loss=${logs.loss.toFixed(4)} | Acc=${logs.acc.toFixed(4)} | Val_Loss=${logs.val_loss.toFixed(4)} | Val_Acc=${logs.val_acc.toFixed(4)}`
          );
          onProgress(pct, logs);
        },
      },
    });

    // Save model and normalization parameters
await model.save("indexeddb://diabetes_model");
localStorage.setItem('diabetes_normalization', JSON.stringify({ mins, maxs }));

console.log("💾 Saved model → indexeddb://diabetes_model");

/* ---------------------------------------------------
7) SAVE MODEL TO SUPABASE STORAGE (FIXED)
--------------------------------------------------- */

console.log("☁️ Uploading model to Supabase Storage...");

// Use TensorFlow.js saveHandler to extract model artifacts
const saveResults = await model.save(tf.io.withSaveHandler(async (artifacts) => {
  try {
    // 1. Create model.json with topology and weight manifest
    const modelJSON = {
      modelTopology: artifacts.modelTopology,
      weightsManifest: [{
        paths: ['diabetes_model.weights.bin'],
        weights: artifacts.weightSpecs
      }],
      format: artifacts.format,
      generatedBy: artifacts.generatedBy,
      convertedBy: artifacts.convertedBy
    };

    // 2. Upload model.json
    const jsonBlob = new Blob(
      [JSON.stringify(modelJSON)], 
      { type: 'application/json' }
    );
    await uploadToSupabase("global/diabetes_model.json", jsonBlob);
    console.log("✅ Uploaded model.json");

    // 3. Upload weights.bin
    const weightsBlob = new Blob(
      [artifacts.weightData], 
      { type: 'application/octet-stream' }
    );
    await uploadToSupabase("global/diabetes_model.weights.bin", weightsBlob);
    console.log("✅ Uploaded weights.bin");

    // 4. Upload normalization parameters
    const normBlob = new Blob(
      [JSON.stringify({ mins, maxs })], 
      { type: 'application/json' }
    );
    await uploadToSupabase("global/normalization.json", normBlob);
    console.log("✅ Uploaded normalization.json");

    console.log("☁️ All model files successfully uploaded to Supabase Storage!");

    return { 
      modelArtifactsInfo: { 
        dateSaved: new Date(),
        modelTopologyType: 'JSON'
      } 
    };

  } catch (uploadError) {
    console.error("❌ Supabase upload failed:", uploadError);
    throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
  }
}));

// Clean up tensors
xsTensor.dispose();
ysTensor.dispose();

console.log("✅ Training completed successfully!");

return {
  success: true,
  finalLoss: history.history.loss[history.history.loss.length - 1],
  finalAccuracy: history.history.acc[history.history.acc.length - 1],
  uploadStatus: 'completed'
};

} catch (error) {
  console.error("❌ Training failed:", error);
  throw error;
}
};