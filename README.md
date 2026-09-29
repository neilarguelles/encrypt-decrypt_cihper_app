# Cipher Studio

A simple Ionic React midterm app for encrypting and decrypting text with Caesar, Vigenère, Atbash, and Rail Fence ciphers. React handles state, Ionic provides the app shell and buttons, and Vite runs and builds the project.

## What you need

1. **Node.js and npm:** already installed on this computer (Node 26.8.2, npm 11.19.1). For another computer, use a supported Node LTS release from https://nodejs.org/.
2. **Visual Studio Code:** optional editor, https://code.visualstudio.com/.
3. **Chrome or Edge:** run the app and use developer tools' device mode to preview a phone layout.
4. **Android Studio:** needed only if your teacher requires an Android APK, not for the browser demo. https://developer.android.com/studio

## Run the project

Open a PowerShell terminal in this folder:

```powershell
npm install
npm run dev
```

Open the local URL printed in the terminal (normally http://127.0.0.1:5173). Keep the terminal running; press Ctrl+C to stop. If dependencies are already installed, you only need `npm run dev`.

```powershell
npm test
npm run build
npm run preview
```

These commands test the cipher logic, build into `dist`, and preview that build. No database, API key, paid account, or backend is needed. Text is processed in the app and is not saved. Fonts load from Google Fonts with local fallbacks.

## How to use it

1. Select Encrypt or Decrypt.
2. Choose Caesar, Vigenère, Atbash, or Rail Fence.
3. Enter plaintext for encryption or ciphertext for decryption.
4. Set a shift (Caesar), keyword (Vigenère), or rail count (Rail Fence). Atbash does not need a key.
5. Press the action button. Copy the result or choose **Reverse it**, then press the action button again to recover the original text.

Changing the input, operation, method, or key clears old results to prevent confusion. “Try an example” fills in a message and matching key.

## Explain it during your presentation

Both algorithms number English letters from A = 0 through Z = 25.

- **Caesar:** encrypt using `(letter + shift) mod 26`; decrypt using `(letter - shift + 26) mod 26`. With shift 3, `Hello, World!` becomes `Khoor, Zruog!`.
- **Vigenère:** repeat the keyword across the input's English letters, then apply the corresponding letter's shift. With keyword `LEMON`, `ATTACK AT DAWN!` becomes `LXFOPV EF RNHR!`. Decryption subtracts those same shifts.
- **Atbash:** swap each letter with its opposite from the other end of the alphabet: A ↔ Z, B ↔ Y, and so on. `Hello, World!` becomes `Svool, Dliow!`. The same mapping encrypts and decrypts, so no key is required.
- **Rail Fence:** write the whole message diagonally across the selected number of rails, then read each rail from top to bottom. With 3 rails, `HELLOWORLD` becomes `HOLELWRDLO`. Decryption fills the rails in order and follows the zigzag path back. Spaces and punctuation are transposed as characters too.
- Caesar, Vigenère, and Atbash preserve uppercase/lowercase and leave spaces, punctuation, digits, emoji, and letters outside A–Z/a–z in place. Nonletters do not advance the Vigenère keyword. Rail Fence moves every character, including spaces and punctuation.
- Shift 0 is valid and leaves the text unchanged. Vigenère keys must contain only A–Z letters, without spaces. Rail Fence uses a whole-number rail count from 2 to 100.
- These classical ciphers demonstrate cryptography concepts; they are not suitable for protecting sensitive data.

## Code map

- `src/main.jsx`: Ionic interface, form state, validation messages, and copy/reverse actions.
- `src/styles.css`: responsive layout and colors.
- `src/ciphers.js`: encryption/decryption logic, separate from the interface.
- `tests/ciphers.test.js`: known examples, alphabet wrapping, round trips, and invalid keys.

## Optional: build Android locally

The Capacitor packages are already installed in this project. To build or run the app locally as Android, install Android Studio and its recommended SDK tools. See https://capacitorjs.com/docs/getting-started/environment-setup.

From this project folder, run these commands once:

```powershell
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

After web changes, run `npm run build` and `npx cap sync android` again. In Android Studio, run on an emulator or USB-debugging-enabled phone, or build a debug APK. GitHub Actions generates its own Android project and APK, so you do not need Android Studio just to download the GitHub build.

## Official references

- Ionic React: https://ionicframework.com/docs/react
- Ionic project creation: https://ionicframework.com/docs/cli/commands/start
- Capacitor Android: https://capacitorjs.com/docs/android

This starter assumes your assignment means **Caesar cipher** when it says “Cipher,” and does not mandate Angular. Confirm those two details against your teacher's rubric.

## GitHub downloads

The workflow in `.github/workflows/build-downloads.yml` builds both the Android debug APK and browser version whenever code is pushed to `main` or `master`. After the workflow finishes, open the repository’s **Actions** tab, select **Build downloadable app**, open the latest successful run, and download `cipher-studio-android-apk` or `cipher-studio-web` under Artifacts. Action artifacts are temporary and retained for 30 days.

For a permanent public download, push a version tag after the workflow is on GitHub:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

The tag workflow publishes a GitHub Release containing the APK and web ZIP. Anyone can download those assets without signing in when the repository is public. The Android output is a debug APK for direct installation, not a Play Store release build.

Capacitor dependencies are in `package.json`. To build Android locally, install Android Studio and its SDK, then run `npm run build`, `npx cap add android` once, `npx cap sync android`, and open the `android` folder in Android Studio. GitHub Actions creates the Android platform during CI, so the generated folder does not need to be committed.
