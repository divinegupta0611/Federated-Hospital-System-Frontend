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
  console.log("📥 Parsing Parkinson's Disease CSV...");
  
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
   ENCODE PARKINSON'S DISEASE DATA
--------------------------------------------------- */
export const encodeParkinsonData = (data) => {
  console.log("🔄 Encoding Parkinson's disease data...");

  const encoded = data
    .map((d) => {
      // Parse all 22 numeric features
      const mdvpFo = parseFloat(d['MDVP:Fo(Hz)']);
      const mdvpFhi = parseFloat(d['MDVP:Fhi(Hz)']);
      const mdvpFlo = parseFloat(d['MDVP:Flo(Hz)']);
      const mdvpJitter = parseFloat(d['MDVP:Jitter(%)']);
      const mdvpJitterAbs = parseFloat(d['MDVP:Jitter(Abs)']);
      const mdvpRAP = parseFloat(d['MDVP:RAP']);
      const mdvpPPQ = parseFloat(d['MDVP:PPQ']);
      const jitterDDP = parseFloat(d['Jitter:DDP']);
      const mdvpShimmer = parseFloat(d['MDVP:Shimmer']);
      const mdvpShimmerDB = parseFloat(d['MDVP:Shimmer(dB)']);
      const shimmerAPQ3 = parseFloat(d['Shimmer:APQ3']);
      const shimmerAPQ5 = parseFloat(d['Shimmer:APQ5']);
      const mdvpAPQ = parseFloat(d['MDVP:APQ']);
      const shimmerDDA = parseFloat(d['Shimmer:DDA']);
      const nhr = parseFloat(d['NHR']);
      const hnr = parseFloat(d['HNR']);
      const rpde = parseFloat(d['RPDE']);
      const dfa = parseFloat(d['DFA']);
      const spread1 = parseFloat(d['spread1']);
      const spread2 = parseFloat(d['spread2']);
      const d2 = parseFloat(d['D2']);
      const ppe = parseFloat(d['PPE']);
      const status = parseInt(d['status']);
      
      // Skip rows with invalid/missing data
      if (
        isNaN(mdvpFo) || isNaN(mdvpFhi) || isNaN(mdvpFlo) || 
        isNaN(mdvpJitter) || isNaN(mdvpJitterAbs) || isNaN(mdvpRAP) || 
        isNaN(mdvpPPQ) || isNaN(jitterDDP) || isNaN(mdvpShimmer) || 
        isNaN(mdvpShimmerDB) || isNaN(shimmerAPQ3) || isNaN(shimmerAPQ5) || 
        isNaN(mdvpAPQ) || isNaN(shimmerDDA) || isNaN(nhr) || 
        isNaN(hnr) || isNaN(rpde) || isNaN(dfa) || 
        isNaN(spread1) || isNaN(spread2) || isNaN(d2) || 
        isNaN(ppe) || isNaN(status)
      ) {
        return null;
      }

      return {
        mdvpFo, mdvpFhi, mdvpFlo, mdvpJitter, mdvpJitterAbs, mdvpRAP,
        mdvpPPQ, jitterDDP, mdvpShimmer, mdvpShimmerDB, shimmerAPQ3,
        shimmerAPQ5, mdvpAPQ, shimmerDDA, nhr, hnr, rpde, dfa,
        spread1, spread2, d2, ppe, status
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
  console.log("📐 Creating tensors for Parkinson's disease...");

  // Compute MIN/MAX for all 22 features
  const mins = {
    mdvpFo: Math.min(...encodedData.map(r => r.mdvpFo)),
    mdvpFhi: Math.min(...encodedData.map(r => r.mdvpFhi)),
    mdvpFlo: Math.min(...encodedData.map(r => r.mdvpFlo)),
    mdvpJitter: Math.min(...encodedData.map(r => r.mdvpJitter)),
    mdvpJitterAbs: Math.min(...encodedData.map(r => r.mdvpJitterAbs)),
    mdvpRAP: Math.min(...encodedData.map(r => r.mdvpRAP)),
    mdvpPPQ: Math.min(...encodedData.map(r => r.mdvpPPQ)),
    jitterDDP: Math.min(...encodedData.map(r => r.jitterDDP)),
    mdvpShimmer: Math.min(...encodedData.map(r => r.mdvpShimmer)),
    mdvpShimmerDB: Math.min(...encodedData.map(r => r.mdvpShimmerDB)),
    shimmerAPQ3: Math.min(...encodedData.map(r => r.shimmerAPQ3)),
    shimmerAPQ5: Math.min(...encodedData.map(r => r.shimmerAPQ5)),
    mdvpAPQ: Math.min(...encodedData.map(r => r.mdvpAPQ)),
    shimmerDDA: Math.min(...encodedData.map(r => r.shimmerDDA)),
    nhr: Math.min(...encodedData.map(r => r.nhr)),
    hnr: Math.min(...encodedData.map(r => r.hnr)),
    rpde: Math.min(...encodedData.map(r => r.rpde)),
    dfa: Math.min(...encodedData.map(r => r.dfa)),
    spread1: Math.min(...encodedData.map(r => r.spread1)),
    spread2: Math.min(...encodedData.map(r => r.spread2)),
    d2: Math.min(...encodedData.map(r => r.d2)),
    ppe: Math.min(...encodedData.map(r => r.ppe)),
  };

  const maxs = {
    mdvpFo: Math.max(...encodedData.map(r => r.mdvpFo)),
    mdvpFhi: Math.max(...encodedData.map(r => r.mdvpFhi)),
    mdvpFlo: Math.max(...encodedData.map(r => r.mdvpFlo)),
    mdvpJitter: Math.max(...encodedData.map(r => r.mdvpJitter)),
    mdvpJitterAbs: Math.max(...encodedData.map(r => r.mdvpJitterAbs)),
    mdvpRAP: Math.max(...encodedData.map(r => r.mdvpRAP)),
    mdvpPPQ: Math.max(...encodedData.map(r => r.mdvpPPQ)),
    jitterDDP: Math.max(...encodedData.map(r => r.jitterDDP)),
    mdvpShimmer: Math.max(...encodedData.map(r => r.mdvpShimmer)),
    mdvpShimmerDB: Math.max(...encodedData.map(r => r.mdvpShimmerDB)),
    shimmerAPQ3: Math.max(...encodedData.map(r => r.shimmerAPQ3)),
    shimmerAPQ5: Math.max(...encodedData.map(r => r.shimmerAPQ5)),
    mdvpAPQ: Math.max(...encodedData.map(r => r.mdvpAPQ)),
    shimmerDDA: Math.max(...encodedData.map(r => r.shimmerDDA)),
    nhr: Math.max(...encodedData.map(r => r.nhr)),
    hnr: Math.max(...encodedData.map(r => r.hnr)),
    rpde: Math.max(...encodedData.map(r => r.rpde)),
    dfa: Math.max(...encodedData.map(r => r.dfa)),
    spread1: Math.max(...encodedData.map(r => r.spread1)),
    spread2: Math.max(...encodedData.map(r => r.spread2)),
    d2: Math.max(...encodedData.map(r => r.d2)),
    ppe: Math.max(...encodedData.map(r => r.ppe)),
  };

  console.log("📊 Data ranges (sample):", { 
    mdvpFo: [mins.mdvpFo, maxs.mdvpFo],
    hnr: [mins.hnr, maxs.hnr],
    rpde: [mins.rpde, maxs.rpde]
  });

  // Normalize all 22 features
  const xs = encodedData.map(r => [
    normalize(r.mdvpFo, mins.mdvpFo, maxs.mdvpFo),
    normalize(r.mdvpFhi, mins.mdvpFhi, maxs.mdvpFhi),
    normalize(r.mdvpFlo, mins.mdvpFlo, maxs.mdvpFlo),
    normalize(r.mdvpJitter, mins.mdvpJitter, maxs.mdvpJitter),
    normalize(r.mdvpJitterAbs, mins.mdvpJitterAbs, maxs.mdvpJitterAbs),
    normalize(r.mdvpRAP, mins.mdvpRAP, maxs.mdvpRAP),
    normalize(r.mdvpPPQ, mins.mdvpPPQ, maxs.mdvpPPQ),
    normalize(r.jitterDDP, mins.jitterDDP, maxs.jitterDDP),
    normalize(r.mdvpShimmer, mins.mdvpShimmer, maxs.mdvpShimmer),
    normalize(r.mdvpShimmerDB, mins.mdvpShimmerDB, maxs.mdvpShimmerDB),
    normalize(r.shimmerAPQ3, mins.shimmerAPQ3, maxs.shimmerAPQ3),
    normalize(r.shimmerAPQ5, mins.shimmerAPQ5, maxs.shimmerAPQ5),
    normalize(r.mdvpAPQ, mins.mdvpAPQ, maxs.mdvpAPQ),
    normalize(r.shimmerDDA, mins.shimmerDDA, maxs.shimmerDDA),
    normalize(r.nhr, mins.nhr, maxs.nhr),
    normalize(r.hnr, mins.hnr, maxs.hnr),
    normalize(r.rpde, mins.rpde, maxs.rpde),
    normalize(r.dfa, mins.dfa, maxs.dfa),
    normalize(r.spread1, mins.spread1, maxs.spread1),
    normalize(r.spread2, mins.spread2, maxs.spread2),
    normalize(r.d2, mins.d2, maxs.d2),
    normalize(r.ppe, mins.ppe, maxs.ppe),
  ]);

  const ys = encodedData.map(r => r.status);

  console.log("🔢 Sample X row (normalized):", xs[0].slice(0, 5), "...");
  console.log("🔢 Sample Y:", ys[0]);
  console.log("📊 Class distribution - Parkinson's:", ys.filter(y => y === 1).length, "Healthy:", ys.filter(y => y === 0).length);

  return {
    xsTensor: tf.tensor2d(xs),
    ysTensor: tf.tensor2d(ys, [ys.length, 1]),
    mins,
    maxs
  };
};

/* ---------------------------------------------------
   CREATE PARKINSON'S DISEASE MODEL
--------------------------------------------------- */
export const createParkinsonModel = () => {
  console.log("🧠 Creating Parkinson's Disease model...");

  const model = tf.sequential();

  // Input layer (22 features - voice measurements)
  model.add(tf.layers.dense({
    units: 128,
    activation: "relu",
    inputShape: [22],
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

  console.log("✅ Parkinson's disease model ready.");
  model.summary();
  return model;
};

/* ---------------------------------------------------
   TRAIN PARKINSON'S DISEASE MODEL
--------------------------------------------------- */
export const trainParkinsonModel = async (csvData, epochs, onProgress) => {
  console.log("🚀 PARKINSON'S DISEASE TRAINING STARTED — Epochs:", epochs);

  try {
    const parsed = parseCSV(csvData);
    
    if (parsed.length === 0) {
      throw new Error("No data parsed from CSV");
    }

    const encoded = encodeParkinsonData(parsed);
    
    if (encoded.length === 0) {
      throw new Error("No valid data after encoding");
    }

    const { xsTensor, ysTensor, mins, maxs } = createTensors(encoded);

    const model = createParkinsonModel();

    // Train with validation split
    const history = await model.fit(xsTensor, ysTensor, {
      epochs,
      batchSize: 16, // Smaller batch size for potentially smaller dataset
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
    await model.save("indexeddb://parkinson_model");
    localStorage.setItem('parkinson_normalization', JSON.stringify({ mins, maxs }));

    console.log("💾 Saved model → indexeddb://parkinson_model");

    // Upload to Supabase
    console.log("☁️ Uploading Parkinson's disease model to Supabase Storage...");

    const saveResults = await model.save(tf.io.withSaveHandler(async (artifacts) => {
      try {
        // Create model.json
        const modelJSON = {
          modelTopology: artifacts.modelTopology,
          weightsManifest: [{
            paths: ['parkinson_model.weights.bin'],
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
        await uploadToSupabase("global/parkinson_model.json", jsonBlob);
        console.log("✅ Uploaded parkinson_model.json");

        // Upload weights.bin
        const weightsBlob = new Blob(
          [artifacts.weightData], 
          { type: 'application/octet-stream' }
        );
        await uploadToSupabase("global/parkinson_model.weights.bin", weightsBlob);
        console.log("✅ Uploaded parkinson_model.weights.bin");

        // Upload normalization parameters
        const normBlob = new Blob(
          [JSON.stringify({ mins, maxs })], 
          { type: 'application/json' }
        );
        await uploadToSupabase("global/parkinson_normalization.json", normBlob);
        console.log("✅ Uploaded parkinson_normalization.json");

        console.log("☁️ All Parkinson's disease model files successfully uploaded!");

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

    console.log("✅ Parkinson's disease training completed successfully!");

    return {
      success: true,
      finalLoss: history.history.loss[history.history.loss.length - 1],
      finalAccuracy: history.history.acc[history.history.acc.length - 1],
      uploadStatus: 'completed'
    };

  } catch (error) {
    console.error("❌ Parkinson's disease training failed:", error);
    throw error;
  }
};