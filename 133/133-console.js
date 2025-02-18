// Playwright Results (from the run)
const playwrightResults = {
  energySaverFreezing: "50.00500 ms",
  wasmMemory64: '{"bufferType":"object","pages":6,"growthTime":"0.01000 ms"}',
  atomicsPauseTiming: "Error: Atomics.pause argument must be undefined or an integer",
  popoverHintSupported: "true",
  cssOpenPseudoClass: "true",
  cssAttrAdvanced: "false",
  animationOverallProgress: "true",
  storageAccessHeaders: "true",
  multipleImportMaps: "true",
  cspHashReporting: "false",
  webAuthnClientCapabilities: '{"conditionalCreate":false,"conditionalGet":true,"extension:appid":true,"extension:appidExclude":true,"extension:credBlob":true,"extension:credProps":true,"extension:credentialProtectionPolicy":true,"extension:enforceCredentialProtectionPolicy":true,"extension:getCredBlob":true,"extension:hmacCreateSecret":true,"extension:largeBlob":true,"extension:minPinLength":true,"extension:payment":true,"extension:prf":true,"hybridTransport":true,"passkeyPlatformAuthenticator":true,"relatedOrigins":true,"signalAllAcceptedCredentials":true,"signalCurrentUserDetails":true,"signalUnknownCredential":true,"userVerifyingPlatformAuthenticator":true}',
  fileSystemObserver: "true",
  domMoveBefore: "false",
  webGPU1ComponentVertex: "true"
};

async function getBrowserResults() {
  const results = {};

  function timeExecution(fn) {
    const start = performance.now();
    try {
      fn();
    } catch {}
    return `${(performance.now() - start).toFixed(5)} ms`;
  }

  function supportsFeature(callback) {
    try {
      return callback() ? "true" : "false";
    } catch {
      return "false";
    }
  }

  results.energySaverFreezing = timeExecution(() => {
    const start = performance.now();
    while (performance.now() - start < 50) {}
  });

  results.wasmMemory64 = (() => {
    try {
      const memory = new WebAssembly.Memory({ initial: 1, maximum: 10, shared: true, memory64: true });
      const start = performance.now();
      memory.grow(5);
      const timeTaken = `${(performance.now() - start).toFixed(5)} ms`;
      return JSON.stringify({
        bufferType: typeof memory.buffer,
        pages: memory.grow(0),
        growthTime: timeTaken,
      });
    } catch (e) {
      return `Error: ${e.message}`;
    }
  })();

  results.atomicsPauseTiming = (() => {
    try {
      const sab = new SharedArrayBuffer(16);
      const int32 = new Int32Array(sab);
      Atomics.pause(int32, 0, 10);
      return "Supported";
    } catch (e) {
      return `Error: ${e.message}`;
    }
  })();

  results.popoverHintSupported = supportsFeature(() => {
    const button = document.createElement("button");
    button.setAttribute("popover", "hint");
    return button.popover === "hint";
  });

  results.cssOpenPseudoClass = supportsFeature(() => CSS.supports("selector(:open)"));

  results.cssAttrAdvanced = supportsFeature(() => CSS.supports("width", "attr(data-width number)"));

  results.animationOverallProgress = supportsFeature(() => {
    const anim = new Animation();
    return typeof anim.overallProgress !== "undefined";
  });

  results.storageAccessHeaders = supportsFeature(() =>
    document.featurePolicy?.allowsFeature("storage-access")
  );

  results.multipleImportMaps = (() => {
    try {
      const script1 = document.createElement("script");
      script1.type = "importmap";
      script1.textContent = JSON.stringify({ imports: { "mod-a": "./a.js" } });

      const script2 = document.createElement("script");
      script2.type = "importmap";
      script2.textContent = JSON.stringify({ imports: { "mod-b": "./b.js" } });

      document.head.append(script1, script2);
      return document.querySelectorAll('script[type="importmap"]').length === 2 ? "true" : "false";
    } catch {
      return "false";
    }
  })();
  results.cspHashReporting = supportsFeature(() => "reportOnly" in document);
  results.webAuthnClientCapabilities = await (async () => {
    if (typeof PublicKeyCredential?.getClientCapabilities !== "function") return "Not Supported";
    try {
      const capabilities = await PublicKeyCredential.getClientCapabilities();
      return JSON.stringify(capabilities);
    } catch (e) {
      return `Error: ${e.message}`;
    }
  })();
  results.fileSystemObserver = supportsFeature(() => typeof FileSystemObserver === "function");
  results.domMoveBefore = supportsFeature(() => typeof Node.prototype.moveBefore === "function");
  results.webGPU1ComponentVertex = supportsFeature(() => typeof GPUBuffer !== "undefined");
  console.log("\n--- 🧪 Browser vs. Playwright Differences ---");
  let differencesFound = false;
  for (const [key, browserValue] of Object.entries(results)) {
    const playwrightValue = playwrightResults[key];
    if (browserValue !== playwrightValue) {
      console.log(`⚠️ ${key}:`);
      console.log(`   Browser: ${browserValue}`);
      console.log(`   Playwright: ${playwrightValue}\n`);
      differencesFound = true;
    }
  }
  if (!differencesFound) {
    console.log("✅ No differences found!");
  }
}
getBrowserResults();
//use this and paste over your playwright results to see differences 
