// 133.js
const { chromium } = require('playwright');

async function runChrome133Detection() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Adjust for your OS
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  });

  const page = await context.newPage();

  // Connect to local server with COOP/COEP headers
  await page.goto('http://localhost:8080');

  const results = await page.evaluate(async () => {
    const output = {};

    function timeExecution(fn) {
      const start = performance.now();
      const result = fn();
      return `${(performance.now() - start).toFixed(5)} ms`;
    }

    function supportsFeature(callback) {
      try {
        return callback() ? 'true' : 'false';
      } catch {
        return 'false';
      }
    }

    // Energy Saver Freezing Test
    output.energySaverFreezing = timeExecution(() => {
      const start = performance.now();
      while (performance.now() - start < 50) {}
    });

    //WebAssembly Memory64 Test
    output.wasmMemory64 = (() => {
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

    //  Atomics.pause() Test
    output.atomicsPauseTiming = (() => {
      try {
        const sab = new SharedArrayBuffer(16);
        const int32 = new Int32Array(sab);
        return timeExecution(() => Atomics.pause(int32, 0, 10));
      } catch (e) {
        return `Error: ${e.message}`;
      }
    })();

    //  Popover API Test
    output.popoverHintSupported = supportsFeature(() => {
      const button = document.createElement('button');
      button.setAttribute('popover', 'hint');
      return button.popover === 'hint';
    });

    //  CSS :open pseudo-class
    output.cssOpenPseudoClass = supportsFeature(() => CSS.supports('selector(:open)'));

    //  CSS Advanced attr() Function
    output.cssAttrAdvanced = supportsFeature(() => CSS.supports('width', 'attr(data-width number)'));

    // Animation.overallProgress
    output.animationOverallProgress = supportsFeature(() => {
      const anim = new Animation();
      return typeof anim.overallProgress !== 'undefined';
    });

    //  Storage Access Headers
    output.storageAccessHeaders = supportsFeature(() => {
      return document.featurePolicy?.allowsFeature('storage-access');
    });

    //  Multiple Import Maps
    output.multipleImportMaps = (() => {
      try {
        const script1 = document.createElement('script');
        script1.type = 'importmap';
        script1.textContent = JSON.stringify({ imports: { 'mod-a': './a.js' } });

        const script2 = document.createElement('script');
        script2.type = 'importmap';
        script2.textContent = JSON.stringify({ imports: { 'mod-b': './b.js' } });

        document.head.append(script1, script2);
        return document.querySelectorAll('script[type="importmap"]').length === 2 ? 'true' : 'false';
      } catch {
        return 'false';
      }
    })();

    //  CSP Hash Reporting Check
    output.cspHashReporting = supportsFeature(() => 'reportOnly' in document);

    // WebAuthn getClientCapabilities
    output.webAuthnClientCapabilities = await (async () => {
      if (typeof PublicKeyCredential?.getClientCapabilities !== 'function') return 'Not Supported';
      try {
        const capabilities = await PublicKeyCredential.getClientCapabilities();
        return JSON.stringify(capabilities);
      } catch (e) {
        return `Error: ${e.message}`;
      }
    })();

    // FileSystemObserver API
    output.fileSystemObserver = supportsFeature(() => typeof FileSystemObserver === 'function');

    // DOM state-preserving move
    output.domMoveBefore = supportsFeature(() => typeof Node.prototype.moveBefore === 'function');

    // WebGPU 1-component vertex formats
    output.webGPU1ComponentVertex = supportsFeature(() => typeof GPUBuffer !== 'undefined');

    return output;
  });

  //  Print results
  console.log('\n---  Full Chrome 133 Bot Detection Results ---');
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}: ${value}`);
  }

  await browser.close();
}

runChrome133Detection().catch(console.error);
