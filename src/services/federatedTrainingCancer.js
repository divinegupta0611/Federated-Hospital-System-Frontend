import * as tf from '@tensorflow/tfjs';
import { supabase } from "../supabaseClient";

/* ---------------------------------------------------
   UPLOAD TO SUPABASE STORAGE
--------------------------------------------------- */
export const uploadToSupabase = async (path, fileBlob) => {
  const { data, error } = await supabase
    .storage
    .from("federated-models")
    .upload(path, fileBlob, {
      upsert: true,
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
   CSV PARSER
--------------------------------------------------- */
export const parseCSV = (csvText) => {
  console.log("📥 Parsing Cancer Detection CSV...");
  
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
   ENCODE CANCER DATA
--------------------------------------------------- */
export const encodeCancerData = (data) => {
  console.log("🔄 Encoding cancer data...");

  const encoded = data
    .map((d) => {
      // Parse all 5 numeric features
      const mean_radius = parseFloat(d.mean_radius);
      const mean_texture = parseFloat(d.mean_texture);
      const mean_perimeter = parseFloat(d.mean_perimeter);
      const mean_area = parseFloat(d.mean_area);
      const mean_smoothness = parseFloat(d.mean_smoothness);
      const diagnosis = parseInt(d.diagnosis);
      
      // Skip rows with invalid/missing data
      if (
        isNaN(mean_radius) || isNaN(mean_texture) || isNaN(mean_perimeter) ||
        isNaN(mean_area) || isNaN(mean_smoothness) || isNaN(diagnosis)
      ) {
        return null;
      }

      return {
        mean_radius,
        mean_texture,
        mean_perimeter,
        mean_area,
        mean_smoothness,
        diagnosis
      };
    })
    .filter(row => row !== null);

  console.log("✅ Encoding complete! Valid rows:", encoded.length);
  return encoded;
};

/* ---------------------------------------------------
   NORMALIZATION
--------------------------------------------------- */
const normalize = (value, min, max) => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

/* ---------------------------------------------------
   CREATE TENSORS WITH NORMALIZATION
--------------------------------------------------- */
export const createTensors = (encodedData) => {
  console.log("📐 Creating tensors for cancer detection...");

  // Compute MIN/MAX for all 5 features
  const mins = {
    mean_radius: Math.min(...encodedData.map(r => r.mean_radius)),
    mean_texture: Math.min(...encodedData.map(r => r.mean_texture)),
    mean_perimeter: Math.min(...encodedData.map(r => r.mean_perimeter)),
    mean_area: Math.min(...encodedData.map(r => r.mean_area)),
    mean_smoothness: Math.min(...encodedData.map(r => r.mean_smoothness)),
  };

  const maxs = {
    mean_radius: Math.max(...encodedData.map(r => r.mean_radius)),
    mean_texture: Math.max(...encodedData.map(r => r.mean_texture)),
    mean_perimeter: Math.max(...encodedData.map(r => r.mean_perimeter)),
    mean_area: Math.max(...encodedData.map(r => r.mean_area)),
    mean_smoothness: Math.max(...encodedData.map(r => r.mean_smoothness)),
  };

  console.log("📊 Data ranges:", { mins, maxs });

  // Normalize all 5 features
  const xs = encodedData.map(r => [
    normalize(r.mean_radius, mins.mean_radius, maxs.mean_radius),
    normalize(r.mean_texture, mins.mean_texture, maxs.mean_texture),
    normalize(r.mean_perimeter, mins.mean_perimeter, maxs.mean_perimeter),
    normalize(r.mean_area, mins.mean_area, maxs.mean_area),
    normalize(r.mean_smoothness, mins.mean_smoothness, maxs.mean_smoothness),
  ]);

  const ys = encodedData.map(r => r.diagnosis);

  console.log("🔢 Sample X row (normalized):", xs[0]);
  console.log("🔢 Sample Y:", ys[0]);
  console.log("📊 Class distribution - Malignant:", ys.filter(y => y === 1).length, "Benign:", ys.filter(y => y === 0).length);

  return {
    xsTensor: tf.tensor2d(xs),
    ysTensor: tf.tensor2d(ys, [ys.length, 1]),
    mins,
    maxs
  };
};

/* ---------------------------------------------------
   CREATE CANCER DETECTION MODEL
--------------------------------------------------- */
export const createCancerModel = () => {
  console.log("🧠 Creating Cancer Detection model...");

  const model = tf.sequential();

  // Input layer (5 features)
  model.add(tf.layers.dense({
    units: 32,
    activation: "relu",
    inputShape: [5],
    kernelInitializer: "heNormal",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.3 }));

  // Hidden layer
  model.add(tf.layers.dense({
    units: 16,
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

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  console.log("✅ Cancer detection model ready.");
  model.summary();
  return model;
};

/* ---------------------------------------------------
   TRAIN CANCER DETECTION MODEL
--------------------------------------------------- */
export const trainCancerModel = async (csvData, epochs, onProgress) => {
  console.log("🚀 CANCER DETECTION TRAINING STARTED — Epochs:", epochs);

  try {
    const parsed = parseCSV(csvData);
    
    if (parsed.length === 0) {
      throw new Error("No data parsed from CSV");
    }

    const encoded = encodeCancerData(parsed);
    
    if (encoded.length === 0) {
      throw new Error("No valid data after encoding");
    }

    const { xsTensor, ysTensor, mins, maxs } = createTensors(encoded);

    const model = createCancerModel();

    // Train with validation split
    const history = await model.fit(xsTensor, ysTensor, {
      epochs,
      batchSize: 32,
      shuffle: true,
      validationSplit: 0.2,
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

    // Save model locally
    await model.save("indexeddb://cancer_model");
    localStorage.setItem('cancer_normalization', JSON.stringify({ mins, maxs }));

    console.log("💾 Saved model → indexeddb://cancer_model");

    // Upload to Supabase
    console.log("☁️ Uploading cancer detection model to Supabase Storage...");

    const saveResults = await model.save(tf.io.withSaveHandler(async (artifacts) => {
      try {
        // Create model.json
        const modelJSON = {
          modelTopology: artifacts.modelTopology,
          weightsManifest: [{
            paths: ['cancer_model.weights.bin'],
            weights: artifacts.weightSpecs
          }],
          format: artifacts.format,
          generatedBy: artifacts.generatedBy,
          convertedBy: artifacts.convertedBy
        };

        // Upload model.json
        const jsonBlob = new Blob(
          [JSON.stringify(modelJSON)], 
          { type: 'application/json' }
        );
        await uploadToSupabase("global/cancer_model.json", jsonBlob);
        console.log("✅ Uploaded cancer_model.json");

        // Upload weights.bin
        const weightsBlob = new Blob(
          [artifacts.weightData], 
          { type: 'application/octet-stream' }
        );
        await uploadToSupabase("global/cancer_model.weights.bin", weightsBlob);
        console.log("✅ Uploaded cancer_model.weights.bin");

        // Upload normalization parameters
        const normBlob = new Blob(
          [JSON.stringify({ mins, maxs })], 
          { type: 'application/json' }
        );
        await uploadToSupabase("global/cancer_normalization.json", normBlob);
        console.log("✅ Uploaded cancer_normalization.json");

        console.log("☁️ All cancer detection model files successfully uploaded!");

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

    console.log("✅ Cancer detection training completed successfully!");

    return {
      success: true,
      finalLoss: history.history.loss[history.history.loss.length - 1],
      finalAccuracy: history.history.acc[history.history.acc.length - 1],
      uploadStatus: 'completed'
    };

  } catch (error) {
    console.error("❌ Cancer detection training failed:", error);
    throw error;
  }
};