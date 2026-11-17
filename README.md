# CAN_LOGGER

## Language and getting started

The desktop app opens in English by default. Use **🌐 فارسی / 🌐 English** at the top to switch languages; your selection is remembered on this device when local storage is available. Persian retains the original interface and diagnostic logic.

1. Choose one or more `.log` or `.blf` files in **Add files**.
2. Select the device model if you know it.
3. Choose **Explore requests**, or add two files and choose **Compare files**. Device reference files are optional.

English covers the main workflow and many diagnostic explanations; unusual or custom reference descriptions may still contain Persian. User-supplied file names, reference titles, diagnostic values and analysis are not changed. A warning is evidence for review, not a confirmed fault. CAN results require informed review.

## Rebuilding the embedded desktop document

`CAN_Exchange_Distribution (1).html` is the original distribution. `tools/language.js`, `tools/diagnostic-translations.js`, `tools/usability.js` and `tools/language.css` add the language controls and guide without changing the underlying parser. After editing them, run `python3 tools/build_language.py`. This regenerates `app/index.html` and the compressed document and SHA-256 digest in `Marja_CAN.py`. `Build_Marja.bat` builds the Windows desktop package and runs its smoke test.

## Testing

For desktop testing, create a virtual environment and install `PyQt6` and `PyQt6-WebEngine`, plus the platform's Qt/WebEngine system libraries. Run `python Marja_CAN.py --smoke-test` in a graphical environment. The optional browser smoke test uses `playwright-core` and a Chromium executable: `NODE_PATH=<node_modules> CHROMIUM=<chromium-path> node tests/browser-smoke.cjs`. It opens both sample log formats and exercises navigation and language switching. It does not replace the desktop smoke test or validate every diagnostic interpretation.

`tests/english-coverage.cjs` scans all 183 requests in the included BUSMASTER sample under each built-in model mapping (using the sample address pair), compares the two sample files, imports the BCMi PDF, and checks live language switching. The alternate model mappings are presentation tests, not assertions that those models describe the sample vehicle. This is regression coverage, not a guarantee for all possible log contents or custom references.

`tests/usability.cjs` checks empty-state guidance, adding a file, request navigation, Persian guidance and a narrow viewport. It does not replace hands-on usability testing with intended users or the desktop smoke test.
