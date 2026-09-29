import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { IonApp, IonContent, IonPage, IonButton, IonIcon, setupIonicReact } from '@ionic/react';
import { lockClosedOutline, arrowForwardOutline, copyOutline, swapHorizontalOutline } from 'ionicons/icons';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './styles.css';
import { transform } from './ciphers';

setupIonicReact({ mode: 'md' });

function getWalkthrough(input, algorithm, key, mode) {
  if (algorithm === 'railfence') {
    if (!/^\d+$/.test(String(key)) || Number(key) < 2 || Number(key) > 100) return [];
    const characters = [...input];
    const rails = Number(key);
    const pattern = [];
    let row = 0;
    let direction = 1;

    for (let index = 0; index < characters.length; index += 1) {
      pattern.push(row);
      if (row === 0) direction = 1;
      else if (row === rails - 1) direction = -1;
      row += direction;
    }

    const cipherOrder = characters.map((_, index) => index).sort((left, right) => pattern[left] - pattern[right]);
    return characters.slice(0, 12).map((character, index) => mode === 'encrypt'
      ? { input: character, rail: pattern[index], position: cipherOrder.indexOf(index) + 1 }
      : { input: character, rail: pattern[cipherOrder[index]], position: cipherOrder[index] + 1 });
  }

  if (algorithm === 'atbash') {
    return [...input].filter(letter => /[a-z]/i.test(letter)).slice(0, 8).map(letter => {
      const base = letter === letter.toUpperCase() ? 65 : 97;
      const value = letter.charCodeAt(0) - base;
      return { input: letter, output: String.fromCharCode(base + 25 - value), amount: value };
    });
  }

  if (algorithm === 'caesar') {
    if (!/^\d+$/.test(String(key)) || Number(key) > 25) return [];
  } else if (!/^[a-z]+$/i.test(String(key))) {
    return [];
  }

  const keyword = algorithm === 'vigenere' ? [...String(key).toUpperCase()] : [];
  let letterIndex = 0;

  return [...input].filter(letter => /[a-z]/i.test(letter)).slice(0, 8).map(letter => {
    const base = letter === letter.toUpperCase() ? 65 : 97;
    const keywordLetter = algorithm === 'vigenere' ? keyword[letterIndex % keyword.length] : null;
    const amount = algorithm === 'caesar' ? Number(key) : keywordLetter.charCodeAt(0) - 65;
    const direction = mode === 'encrypt' ? 1 : -1;
    const result = String.fromCharCode(base + (letter.charCodeAt(0) - base + amount * direction + 26) % 26);
    letterIndex += 1;

    return { input: letter, key: algorithm === 'caesar' ? `${amount}` : keywordLetter, output: result, amount };
  });
}

function App() {
  const [algorithm, setAlgorithm] = useState('caesar');
  const [mode, setMode] = useState('encrypt');
  const [shift, setShift] = useState('3');
  const [keyword, setKeyword] = useState('LEMON');
  const [railCount, setRailCount] = useState('3');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const encrypting = mode === 'encrypt';
  const usesKey = algorithm !== 'atbash';
  const methodName = algorithm === 'caesar' ? 'CAESAR' : algorithm === 'vigenere' ? 'VIGENÈRE' : algorithm === 'atbash' ? 'ATBASH' : 'RAIL FENCE';
  const key = algorithm === 'caesar' ? shift : algorithm === 'vigenere' ? keyword : railCount;
  const walkthrough = getWalkthrough(input, algorithm, key, mode);
  function invalidate() { setOutput(''); setError(''); setNotice(''); }
  function run(event) {
    event.preventDefault();
    setNotice('');
    if (!input.trim()) { setError('Enter a message first.'); setOutput(''); return; }
    try { setOutput(transform(input, algorithm, key, mode)); setError(''); }
    catch (err) { setError(err.message); setOutput(''); }
  }
  function example() {
    invalidate(); setShift('3'); setKeyword('LEMON');
    setInput(algorithm === 'caesar' ? (encrypting ? 'Hello, World!' : 'Khoor, Zruog!') : algorithm === 'vigenere' ? (encrypting ? 'ATTACK AT DAWN!' : 'LXFOPV EF RNHR!') : algorithm === 'atbash' ? (encrypting ? 'Hello, World!' : 'Svool, Dliow!') : (encrypting ? 'HELLOWORLD' : 'HOLELWRDLO'));
  }
  async function copy() {
    try { await navigator.clipboard.writeText(output); setNotice('Result copied.'); }
    catch { setNotice('Copy is unavailable. Select and copy the result manually.'); }
  }
  return <IonApp><IonPage><IonContent><main className="shell">
    <header><a className="brand" href="./"><span className="brand-icon"><IonIcon icon={lockClosedOutline} /></span>Cipher Studio</a><span className="badge">A little mystery. Made simple.</span></header>
    <section className="intro"><span className="eyebrow">YOUR MESSAGE, REIMAGINED</span><h1>Turn words into<br /><em>something secret.</em></h1><p>Explore the art of classic encryption.<br />Four ciphers. One simple workspace.</p></section>
    <div className="workspace"><section className="editor panel" aria-label="Cipher workspace">
      <div className="section-top"><h2>Let’s transform your text</h2><span className="step">01 — INPUT</span></div>
      <div className="segmented" aria-label="Operation">{['encrypt', 'decrypt'].map(item => <button key={item} type="button" aria-pressed={mode === item} className={mode === item ? 'active' : ''} onClick={() => { setMode(item); invalidate(); }}><IonIcon icon={item === 'encrypt' ? lockClosedOutline : swapHorizontalOutline} />{item === 'encrypt' ? 'Encrypt' : 'Decrypt'}</button>)}</div>
      <form onSubmit={run}>
        <label htmlFor="algorithm">Encryption method</label><select id="algorithm" value={algorithm} onChange={e => { setAlgorithm(e.target.value); invalidate(); }}><option value="caesar">Caesar cipher</option><option value="vigenere">Vigenère cipher</option><option value="atbash">Atbash cipher</option><option value="railfence">Rail Fence cipher</option></select>
        <div className="label-row"><label htmlFor="message">{encrypting ? 'Plaintext' : 'Ciphertext'}</label><button type="button" className="text-button" onClick={example}>Try an example</button></div>
        <textarea id="message" placeholder={encrypting ? 'Your secret starts here…' : 'Paste your encrypted message…'} value={input} onChange={e => { setInput(e.target.value); invalidate(); }} />
        <div className="field-footer"><span>{algorithm === 'railfence' ? 'All characters move along the rails' : 'Spaces, punctuation & case are preserved'}</span><span>{input.length} characters</span></div>
        {usesKey ? <><label htmlFor="key">{algorithm === 'caesar' ? 'Shift key' : algorithm === 'vigenere' ? 'Keyword' : 'Number of rails'}</label>
        <input id="key" type={algorithm === 'vigenere' ? 'text' : 'number'} min={algorithm === 'caesar' ? '0' : '2'} max={algorithm === 'caesar' ? '25' : algorithm === 'railfence' ? '100' : undefined} step="1" autoComplete="off" spellCheck="false" value={algorithm === 'caesar' ? shift : algorithm === 'vigenere' ? keyword : railCount} onChange={e => { algorithm === 'caesar' ? setShift(e.target.value) : algorithm === 'vigenere' ? setKeyword(e.target.value) : setRailCount(e.target.value); invalidate(); }} aria-describedby="key-help" />
        <p className="hint" id="key-help">{algorithm === 'caesar' ? 'Choose a whole number from 0 to 25. A shift of 3 turns A into D.' : algorithm === 'vigenere' ? 'Letters A–Z only. The keyword repeats across the message’s letters.' : 'Choose a whole number from 2 to 100. The message is written diagonally across the rails.'}</p></> : <p className="hint atbash-hint">Atbash needs no key. Each letter maps to its opposite: A ↔ Z, B ↔ Y, and so on.</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <IonButton expand="block" type="submit">{encrypting ? 'Encrypt message' : 'Decrypt message'}<IonIcon slot="end" icon={arrowForwardOutline} /></IonButton>
      </form>
    </section>
    <section className="result panel" aria-label="Result"><div className="section-top"><h2>Your result</h2><span className="step">02 — OUTPUT</span></div><span className="result-tag">{methodName} / {encrypting ? 'ENCRYPTION' : 'DECRYPTION'}</span>
      {output ? <textarea className="output" aria-label="Transformed message" readOnly value={output} /> : <div className="empty"><span className="empty-icon"><IonIcon icon={lockClosedOutline} /></span><h3>A new version awaits</h3><p>Enter your text, choose a key,<br />and watch your message transform.</p></div>}
      <div className="result-actions"><IonButton fill="outline" disabled={!output} onClick={copy}><IonIcon slot="start" icon={copyOutline} />Copy result</IonButton><button className="text-button" disabled={!output} onClick={() => { setInput(output); setMode(encrypting ? 'decrypt' : 'encrypt'); invalidate(); }}>Reverse it ↔</button></div>
      <p className="notice" role="status" aria-live="polite">{notice || (output ? 'Done! Reverse it to recover your original message.' : 'Your result will appear here.')}</p>
      <section className="walkthrough" aria-label="How the cipher works">
        <div className="walkthrough-heading"><span className="eyebrow">HOW IT WORKS</span><span className="walkthrough-count">{walkthrough.length ? `FIRST ${walkthrough.length} ${algorithm === 'railfence' ? 'CHARACTERS' : 'LETTERS'}` : 'LIVE WALKTHROUGH'}</span></div>
        <h3>{algorithm === 'caesar' ? 'Each letter moves by the same shift.' : algorithm === 'vigenere' ? 'Each keyword letter sets a new shift.' : algorithm === 'atbash' ? 'Each letter swaps with its alphabet opposite.' : encrypting ? 'Follow the zigzag, then read each rail.' : 'Read the rails, then follow the zigzag.'}</h3>
        {walkthrough.length ? <div className="letter-steps">{walkthrough.map((step, index) => <div className="letter-step" key={`${index}-${step.input}`}>
          <span className="step-caption">{algorithm === 'railfence' ? `CHARACTER ${index + 1}` : algorithm === 'caesar' ? `LETTER ${index + 1}` : `STEP ${index + 1}`}</span>
          <div className="step-equation">{algorithm === 'railfence' ? <><strong>{step.input === ' ' ? '␠' : step.input === '\n' ? '↵' : step.input}</strong><span className="step-arrow">→</span><span>rail {step.rail + 1}</span></> : <><span>{step.input}</span>{algorithm === 'atbash' ? <span className="step-operator">↔</span> : <><span className="step-operator">{encrypting ? '+' : '−'}</span><span>{algorithm === 'caesar' ? step.amount : `${step.key} (${step.amount})`}</span><span className="step-arrow">→</span></>}<strong>{step.output}</strong></>}</div>
          <span className="step-caption">{algorithm === 'railfence' ? `${encrypting ? 'Cipher' : 'Plaintext'} position ${step.position}` : algorithm === 'caesar' ? 'letter + shift' : algorithm === 'vigenere' ? `keyword: ${step.key}` : 'alphabet opposite'}</span>
        </div>)}</div> : <p className="walkthrough-empty">{algorithm === 'atbash' ? 'Enter a message to see each letter swap with its alphabet opposite.' : algorithm === 'railfence' ? 'Enter a message and choose 2 to 100 rails to see where each character moves.' : `Enter a message and a valid ${algorithm === 'caesar' ? 'shift from 0 to 25' : 'A–Z keyword'} to see each letter transform.`}</p>}
        <p className="walkthrough-note">{algorithm === 'caesar' ? `A = 0 through Z = 25. ${encrypting ? 'Add' : 'Subtract'} ${/^\d+$/.test(shift) ? shift : 'the shift'} (wrapping around the alphabet).` : algorithm === 'vigenere' ? `A = 0 through Z = 25. ${encrypting ? 'Add' : 'Subtract'} each keyword letter’s value; the keyword advances only on letters. Spaces and punctuation stay in place.` : algorithm === 'atbash' ? 'Atbash reverses the alphabet (A ↔ Z, B ↔ Y). Applying it twice returns the original text.' : 'The rail count controls the zigzag depth. Spaces and punctuation are transposed along with letters.'}</p>
      </section>
    </section></div>
    <section className="learn"><div><span className="eyebrow">BEHIND THE CIPHER</span><h2>{algorithm === 'caesar' ? 'A small shift. A different message.' : algorithm === 'vigenere' ? 'One keyword. A changing shift.' : algorithm === 'atbash' ? 'Opposite letters make the secret.' : 'A zigzag hides the message.'}</h2></div><p>{algorithm === 'caesar' ? 'Caesar moves every letter by the same number of positions in the alphabet. Decryption shifts it back by the same amount.' : algorithm === 'vigenere' ? 'Vigenère uses each keyword letter as a shift: A = 0, B = 1, and so on. Decryption subtracts those shifts. Spaces do not advance the keyword.' : algorithm === 'atbash' ? 'Atbash pairs the alphabet from opposite ends: A with Z, B with Y, and C with X. The same substitution encrypts and decrypts.' : 'Rail Fence writes the message diagonally across a set number of rows, then reads across each row. Decryption fills the rails and follows the zigzag path back.'}</p></section>
    <footer><span>Cipher Studio · Midterm project</span><span>For learning classic ciphers, not protecting sensitive information.</span></footer>
  </main></IonContent></IonPage></IonApp>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
