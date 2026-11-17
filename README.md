# CAN_LOGGER

## Language and getting started

The desktop app opens in English by default. Use **🌐 فارسی / 🌐 English** at the top to switch languages; your selection is remembered on this device when local storage is available. Persian retains the original interface and diagnostic logic.

1. Choose one or more `.log` or `.blf` files in **Add files**.
2. Select the device model if you know it.
3. Choose **Explore requests**, or add two files and choose **Compare files**. Device reference files are optional.

English covers the main workflow and many diagnostic explanations; unusual or custom reference descriptions may still contain Persian. User-supplied file names, reference titles, diagnostic values and analysis are not changed. A warning is evidence for review, not a confirmed fault. CAN results require informed review.

## Rebuilding the embedded desktop document

`CAN_Exchange_Distribution (1).html` is the original distribution. The scripts and styles under `tools/` add the language controls, task cards and summaries without changing the underlying parser. Run `python3 tools/build_language.py --html-only` to update the standalone `app/index.html` without changing the desktop app. The HTML preview may therefore contain features not yet present in the desktop app.

When desktop integration is requested, `python3 tools/build_language.py` also regenerates the compressed document and SHA-256 digest in `Marja_CAN.py`. `Build_Marja.bat` builds the Windows desktop package and runs its smoke test. The preview's summaries use the existing application analysis functions; counts describe the selected run or the comparison's current filters, and are not confirmed faults.

The HTML preview colours checked response fields and known lengths: green for matching checked header and known length, orange for a matching header with shorter data, red for a checked mismatch, and neutral where there is insufficient information. Green does not verify every payload value. The assessment follows the selected reference; where the EP6 FD3F length is longer than 77 bytes, acceptance depends on the specification version and remains neutral. Byte tooltips group documented fields and show recorded values and PDF references for selected built-in BCMi, NBCM and SBCM definitions. Coverage is partial; incomplete groups, unknown fields and variant-dependent settings are identified rather than guessed. A selected reference must match the actual ECU. In exchange reports, ISO-TP frame headers, identifiers, session timing pairs and documented data bytes are annotated only when the recorded frames exactly reconstruct the associated message; unassociated raw CAN frames remain uninterpreted.

## Testing

For desktop testing, create a virtual environment and install `PyQt6` and `PyQt6-WebEngine`, plus the platform's Qt/WebEngine system libraries. Run `python Marja_CAN.py --smoke-test` in a graphical environment. The optional browser smoke test uses `playwright-core` and a Chromium executable: `NODE_PATH=<node_modules> CHROMIUM=<chromium-path> node tests/browser-smoke.cjs`. It opens both sample log formats and exercises navigation and language switching. It does not replace the desktop smoke test or validate every diagnostic interpretation.

`tests/english-coverage.cjs` scans all 183 requests in the included BUSMASTER sample under each built-in model mapping (using the sample address pair), compares the two sample files, imports the BCMi PDF, and checks live language switching. The alternate model mappings are presentation tests, not assertions that those models describe the sample vehicle. This is regression coverage, not a guarantee for all possible log contents or custom references.

`tests/usability.cjs` checks empty-state guidance, adding a file, request navigation, Persian guidance and a narrow viewport. `tests/explorer.cjs` checks the task cards, diagnostic and comparison summary counts against the underlying analysis, filters, language changes and navigation. `tests/review-status.cjs` covers status colours, short and unknown lengths, hover and keyboard explanations across report views. `tests/diag-groups.cjs` checks documented multi-byte and multi-bit groups, reference isolation and incomplete data. These tests do not replace hands-on usability testing with intended users or the desktop smoke test.
