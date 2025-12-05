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
  console.log("📥 Parsing Kidney Disease CSV...");
  
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
   ENCODE KIDNEY DISEASE DATA
--------------------------------------------------- */
export const encodeKidneyData = (data) => {
  console.log("🔄 Encoding kidney disease data...");

  // Mapping for categorical variables
  const rbcMap = { normal: 0, abnormal: 1 };
  const pcMap = { normal: 0, abnormal: 1 };
  const pccMap = { notpresent: 0, present: 1 };
  const baMap = { notpresent: 0, present: 1 };
  const htnMap = { no: 0, yes: 1 };
  const dmMap = { no: 0, yes: 1 };
  const cadMap = { no: 0, yes: 1 };
  const appetMap = { good: 0, poor: 1 };
  const peMap = { no: 0, yes: 1 };
  const aneMap = { no: 0, yes: 1 };
  const classMap = { notckd: 0, ckd: 1 };

  const encoded = data
    .map((d) => {
      // Parse numeric fields (handle empty strings)
      const age = parseFloat(d.age) || 0;
      const bp = parseFloat(d.bp) || 0;
      const sg = parseFloat(d.sg) || 0;
      const al = parseFloat(d.al) || 0;
      const su = parseFloat(d.su) || 0;
      const bgr = parseFloat(d.bgr) || 0;
      const bu = parseFloat(d.bu) || 0;
      const sc = parseFloat(d.sc) || 0;
      const sod = parseFloat(d.sod) || 0;
      const pot = parseFloat(d.pot) || 0;
      const hemo = parseFloat(d.hemo) || 0;
      const pcv = parseFloat(d.pcv) || 0;
      const wc = parseFloat(d.wc) || 0;
      const rc = parseFloat(d.rc) || 0;
      
      // Encode categorical fields (handle empty strings and case sensitivity)
      const rbc = rbcMap[d.rbc?.toLowerCase()] ?? 0;
      const pc = pcMap[d.pc?.toLowerCase()] ?? 0;
      const pcc = pccMap[d.pcc?.toLowerCase()] ?? 0;
      const ba = baMap[d.ba?.toLowerCase()] ?? 0;
      const htn = htnMap[d.htn?.toLowerCase()] ?? 0;
      const dm = dmMap[d.dm?.toLowerCase()] ?? 0;
      const cad = cadMap[d.cad?.toLowerCase()] ?? 0;
      const appet = appetMap[d.appet?.toLowerCase()] ?? 0;
      const pe = peMap[d.pe?.toLowerCase()] ?? 0;
      const ane = aneMap[d.ane?.toLowerCase()] ?? 0;
      const classification = classMap[d.classification?.toLowerCase()] ?? 0;

      // Skip rows with critical missing data (age must be present)
      if (isNaN(age) || age === 0) {
        return null;
      }

      return {
        age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, 
        sod, pot, hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane, 
        classification
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
  console.log("📐 Creating tensors for kidney disease...");

  // Compute MIN/MAX for continuous variables
  const mins = {
    age: Math.min(...encodedData.map(r => r.age)),
    bp: Math.min(...encodedData.map(r => r.bp)),
    sg: Math.min(...encodedData.map(r => r.sg)),
    al: Math.min(...encodedData.map(r => r.al)),
    su: Math.min(...encodedData.map(r => r.su)),
    bgr: Math.min(...encodedData.map(r => r.bgr)),
    bu: Math.min(...encodedData.map(r => r.bu)),
    sc: Math.min(...encodedData.map(r => r.sc)),
    sod: Math.min(...encodedData.map(r => r.sod)),
    pot: Math.min(...encodedData.map(r => r.pot)),
    hemo: Math.min(...encodedData.map(r => r.hemo)),
    pcv: Math.min(...encodedData.map(r => r.pcv)),
    wc: Math.min(...encodedData.map(r => r.wc)),
    rc: Math.min(...encodedData.map(r => r.rc)),
  };

  const maxs = {
    age: Math.max(...encodedData.map(r => r.age)),
    bp: Math.max(...encodedData.map(r => r.bp)),
    sg: Math.max(...encodedData.map(r => r.sg)),
    al: Math.max(...encodedData.map(r => r.al)),
    su: Math.max(...encodedData.map(r => r.su)),
    bgr: Math.max(...encodedData.map(r => r.bgr)),
    bu: Math.max(...encodedData.map(r => r.bu)),
    sc: Math.max(...encodedData.map(r => r.sc)),
    sod: Math.max(...encodedData.map(r => r.sod)),
    pot: Math.max(...encodedData.map(r => r.pot)),
    hemo: Math.max(...encodedData.map(r => r.hemo)),
    pcv: Math.max(...encodedData.map(r => r.pcv)),
    wc: Math.max(...encodedData.map(r => r.wc)),
    rc: Math.max(...encodedData.map(r => r.rc)),
  };

  console.log("📊 Data ranges:", { mins, maxs });

  // Normalize features (24 features total)
  const xs = encodedData.map(r => [
    normalize(r.age, mins.age, maxs.age),
    normalize(r.bp, mins.bp, maxs.bp),
    normalize(r.sg, mins.sg, maxs.sg),
    normalize(r.al, mins.al, maxs.al),
    normalize(r.su, mins.su, maxs.su),
    r.rbc, // Binary 0/1
    r.pc, // Binary 0/1
    r.pcc, // Binary 0/1
    r.ba, // Binary 0/1
    normalize(r.bgr, mins.bgr, maxs.bgr),
    normalize(r.bu, mins.bu, maxs.bu),
    normalize(r.sc, mins.sc, maxs.sc),
    normalize(r.sod, mins.sod, maxs.sod),
    normalize(r.pot, mins.pot, maxs.pot),
    normalize(r.hemo, mins.hemo, maxs.hemo),
    normalize(r.pcv, mins.pcv, maxs.pcv),
    normalize(r.wc, mins.wc, maxs.wc),
    normalize(r.rc, mins.rc, maxs.rc),
    r.htn, // Binary 0/1
    r.dm, // Binary 0/1
    r.cad, // Binary 0/1
    r.appet, // Binary 0/1
    r.pe, // Binary 0/1
    r.ane, // Binary 0/1
  ]);

  const ys = encodedData.map(r => r.classification);

  console.log("🔢 Sample X row (normalized):", xs[0]);
  console.log("🔢 Sample Y:", ys[0]);
  console.log("📊 Class distribution - CKD:", ys.filter(y => y === 1).length, "Not CKD:", ys.filter(y => y === 0).length);

  return {
    xsTensor: tf.tensor2d(xs),
    ysTensor: tf.tensor2d(ys, [ys.length, 1]),
    mins,
    maxs
  };
};

/* ---------------------------------------------------
   CREATE KIDNEY DISEASE MODEL
--------------------------------------------------- */
export const createKidneyModel = () => {
  console.log("🧠 Creating Kidney Disease model...");

  const model = tf.sequential();

  // Input layer (24 features)
  model.add(tf.layers.dense({
    units: 128,
    activation: "relu",
    inputShape: [24],
    kernelInitializer: "heNormal",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.4 }));

  // Hidden layer 1
  model.add(tf.layers.dense({
    units: 64,
    activation: "relu",
    kernelInitializer: "heNormal",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.3 }));

  // Hidden layer 2
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

  console.log("✅ Kidney disease model ready.");
  model.summary();
  return model;
};

/* ---------------------------------------------------
   TRAIN KIDNEY DISEASE MODEL
--------------------------------------------------- */
export const trainKidneyDiseaseModel = async (csvData, epochs, onProgress) => {
  console.log("🚀 KIDNEY DISEASE TRAINING STARTED — Epochs:", epochs);

  try {
    const parsed = parseCSV(csvData);
    
    if (parsed.length === 0) {
      throw new Error("No data parsed from CSV");
    }

    const encoded = encodeKidneyData(parsed);
    
    if (encoded.length === 0) {
      throw new Error("No valid data after encoding");
    }

    const { xsTensor, ysTensor, mins, maxs } = createTensors(encoded);

    const model = createKidneyModel();

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
    await model.save("indexeddb://kidney_disease_model");
    localStorage.setItem('kidney_disease_normalization', JSON.stringify({ mins, maxs }));

    console.log("💾 Saved model → indexeddb://kidney_disease_model");

    // Upload to Supabase
    console.log("☁️ Uploading kidney disease model to Supabase Storage...");

    const saveResults = await model.save(tf.io.withSaveHandler(async (artifacts) => {
      try {
        // Create model.json
        const modelJSON = {
          modelTopology: artifacts.modelTopology,
          weightsManifest: [{
            paths: ['kidney_disease_model.weights.bin'],
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
        await uploadToSupabase("global/kidney_disease_model.json", jsonBlob);
        console.log("✅ Uploaded kidney_disease_model.json");

        // Upload weights.bin
        const weightsBlob = new Blob(
          [artifacts.weightData], 
          { type: 'application/octet-stream' }
        );
        await uploadToSupabase("global/kidney_disease_model.weights.bin", weightsBlob);
        console.log("✅ Uploaded kidney_disease_model.weights.bin");

        // Upload normalization parameters
        const normBlob = new Blob(
          [JSON.stringify({ mins, maxs })], 
          { type: 'application/json' }
        );
        await uploadToSupabase("global/kidney_disease_normalization.json", normBlob);
        console.log("✅ Uploaded kidney_disease_normalization.json");

        console.log("☁️ All kidney disease model files successfully uploaded!");

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

    console.log("✅ Kidney disease training completed successfully!");

    return {
      success: true,
      finalLoss: history.history.loss[history.history.loss.length - 1],
      finalAccuracy: history.history.acc[history.history.acc.length - 1],
      uploadStatus: 'completed'
    };

  } catch (error) {
    console.error("❌ Kidney disease training failed:", error);
    throw error;
  }
};