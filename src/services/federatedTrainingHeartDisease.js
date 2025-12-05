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
  console.log("📥 Parsing Heart Disease CSV...");
  
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
   ENCODE HEART DISEASE DATA
--------------------------------------------------- */
export const encodeHeartData = (data) => {
  console.log("🔄 Encoding heart disease data...");

  const encoded = data
    .map((d) => {
      // Parse all numeric fields
      const age = parseFloat(d.age);
      const sex = parseInt(d.sex);
      const cp = parseInt(d.cp);
      const trestbps = parseFloat(d.trestbps);
      const chol = parseFloat(d.chol);
      const fbs = parseInt(d.fbs);
      const restecg = parseInt(d.restecg);
      const thalach = parseFloat(d.thalach);
      const exang = parseInt(d.exang);
      const oldpeak = parseFloat(d.oldpeak);
      const slope = parseInt(d.slope);
      const ca = parseInt(d.ca);
      const thal = parseInt(d.thal);
      const target = parseInt(d.target);
      
      // Skip rows with invalid/missing data
      if (
        isNaN(age) || isNaN(sex) || isNaN(cp) || 
        isNaN(trestbps) || isNaN(chol) || isNaN(fbs) || 
        isNaN(restecg) || isNaN(thalach) || isNaN(exang) || 
        isNaN(oldpeak) || isNaN(slope) || isNaN(ca) || 
        isNaN(thal) || isNaN(target)
      ) {
        return null;
      }

      return {
        age, sex, cp, trestbps, chol, fbs, 
        restecg, thalach, exang, oldpeak, 
        slope, ca, thal, target
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
  console.log("📐 Creating tensors for heart disease...");

  // Compute MIN/MAX for continuous variables
  const mins = {
    age: Math.min(...encodedData.map(r => r.age)),
    trestbps: Math.min(...encodedData.map(r => r.trestbps)),
    chol: Math.min(...encodedData.map(r => r.chol)),
    thalach: Math.min(...encodedData.map(r => r.thalach)),
    oldpeak: Math.min(...encodedData.map(r => r.oldpeak)),
  };

  const maxs = {
    age: Math.max(...encodedData.map(r => r.age)),
    trestbps: Math.max(...encodedData.map(r => r.trestbps)),
    chol: Math.max(...encodedData.map(r => r.chol)),
    thalach: Math.max(...encodedData.map(r => r.thalach)),
    oldpeak: Math.max(...encodedData.map(r => r.oldpeak)),
  };

  console.log("📊 Data ranges:", { mins, maxs });

  // Normalize features
  const xs = encodedData.map(r => [
    normalize(r.age, mins.age, maxs.age),
    r.sex, // Binary 0/1
    r.cp / 3, // Normalize categorical (0-3)
    normalize(r.trestbps, mins.trestbps, maxs.trestbps),
    normalize(r.chol, mins.chol, maxs.chol),
    r.fbs, // Binary 0/1
    r.restecg / 2, // Normalize categorical (0-2)
    normalize(r.thalach, mins.thalach, maxs.thalach),
    r.exang, // Binary 0/1
    normalize(r.oldpeak, mins.oldpeak, maxs.oldpeak),
    r.slope / 2, // Normalize categorical (0-2)
    r.ca / 4, // Normalize categorical (0-4)
    r.thal / 3, // Normalize categorical (0-3)
  ]);

  const ys = encodedData.map(r => r.target);

  console.log("🔢 Sample X row (normalized):", xs[0]);
  console.log("🔢 Sample Y:", ys[0]);
  console.log("📊 Class distribution - Disease:", ys.filter(y => y === 1).length, "No Disease:", ys.filter(y => y === 0).length);

  return {
    xsTensor: tf.tensor2d(xs),
    ysTensor: tf.tensor2d(ys, [ys.length, 1]),
    mins,
    maxs
  };
};

/* ---------------------------------------------------
   CREATE HEART DISEASE MODEL
--------------------------------------------------- */
export const createHeartModel = () => {
  console.log("🧠 Creating Heart Disease model...");

  const model = tf.sequential();

  // Input layer (13 features)
  model.add(tf.layers.dense({
    units: 64,
    activation: "relu",
    inputShape: [13],
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

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  console.log("✅ Heart disease model ready.");
  model.summary();
  return model;
};

/* ---------------------------------------------------
   TRAIN HEART DISEASE MODEL
--------------------------------------------------- */
export const trainHeartDiseaseModel = async (csvData, epochs, onProgress) => {
  console.log("🚀 HEART DISEASE TRAINING STARTED — Epochs:", epochs);

  try {
    const parsed = parseCSV(csvData);
    
    if (parsed.length === 0) {
      throw new Error("No data parsed from CSV");
    }

    const encoded = encodeHeartData(parsed);
    
    if (encoded.length === 0) {
      throw new Error("No valid data after encoding");
    }

    const { xsTensor, ysTensor, mins, maxs } = createTensors(encoded);

    const model = createHeartModel();

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
    await model.save("indexeddb://heart_disease_model");
    localStorage.setItem('heart_disease_normalization', JSON.stringify({ mins, maxs }));

    console.log("💾 Saved model → indexeddb://heart_disease_model");

    // Upload to Supabase
    console.log("☁️ Uploading heart disease model to Supabase Storage...");

    const saveResults = await model.save(tf.io.withSaveHandler(async (artifacts) => {
      try {
        // Create model.json
        const modelJSON = {
          modelTopology: artifacts.modelTopology,
          weightsManifest: [{
            paths: ['heart_disease_model.weights.bin'],
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
        await uploadToSupabase("global/heart_disease_model.json", jsonBlob);
        console.log("✅ Uploaded heart_disease_model.json");

        // Upload weights.bin
        const weightsBlob = new Blob(
          [artifacts.weightData], 
          { type: 'application/octet-stream' }
        );
        await uploadToSupabase("global/heart_disease_model.weights.bin", weightsBlob);
        console.log("✅ Uploaded heart_disease_model.weights.bin");

        // Upload normalization parameters
        const normBlob = new Blob(
          [JSON.stringify({ mins, maxs })], 
          { type: 'application/json' }
        );
        await uploadToSupabase("global/heart_disease_normalization.json", normBlob);
        console.log("✅ Uploaded heart_disease_normalization.json");

        console.log("☁️ All heart disease model files successfully uploaded!");

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

    console.log("✅ Heart disease training completed successfully!");

    return {
      success: true,
      finalLoss: history.history.loss[history.history.loss.length - 1],
      finalAccuracy: history.history.acc[history.history.acc.length - 1],
      uploadStatus: 'completed'
    };

  } catch (error) {
    console.error("❌ Heart disease training failed:", error);
    throw error;
  }
};