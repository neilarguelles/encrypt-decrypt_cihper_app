// Classical ciphers use the English alphabet. Other characters pass through.
export function transform(text, algorithm, key, mode = 'encrypt') {
  if (!['caesar', 'vigenere', 'atbash', 'railfence'].includes(algorithm)) throw new Error('Choose a valid cipher.');
  if (!['encrypt', 'decrypt'].includes(mode)) throw new Error('Choose a valid operation.');

  if (algorithm === 'atbash') {
    return [...text].map(letter => {
      if (!/^[a-zA-Z]$/.test(letter)) return letter;
      const base = letter === letter.toUpperCase() ? 65 : 97;
      return String.fromCharCode(base + 25 - (letter.charCodeAt(0) - base));
    }).join('');
  }

  if (algorithm === 'railfence') {
    if (!/^\d+$/.test(String(key)) || Number(key) < 2 || Number(key) > 100) {
      throw new Error('Choose a whole-number rail count from 2 to 100.');
    }
    const rails = Number(key);
    const characters = [...text];
    const pattern = [];
    let row = 0;
    let direction = 1;

    for (let index = 0; index < characters.length; index += 1) {
      pattern.push(row);
      if (row === 0) direction = 1;
      else if (row === rails - 1) direction = -1;
      row += direction;
    }

    if (mode === 'encrypt') {
      return Array.from({ length: rails }, (_, rail) => characters.filter((_, index) => pattern[index] === rail).join('')).join('');
    }

    const railCharacters = Array.from({ length: rails }, (_, rail) => characters.filter((_, index) => pattern[index] === rail));
    const railOffsets = Array(rails).fill(0);
    return pattern.map(rail => railCharacters[rail][railOffsets[rail]++]).join('');
  }

  const direction = mode === 'encrypt' ? 1 : -1;
  let shifts;
  if (algorithm === 'caesar') {
    if (!/^\d+$/.test(String(key)) || Number(key) > 25) throw new Error('Enter a whole-number shift from 0 to 25.');
    shifts = [Number(key)];
  } else {
    if (!/^[a-zA-Z]+$/.test(String(key))) throw new Error('Use a keyword containing only letters A–Z.');
    shifts = [...String(key).toUpperCase()].map(letter => letter.charCodeAt(0) - 65);
  }
  let position = 0;
  return [...text].map(letter => {
    if (!/^[a-zA-Z]$/.test(letter)) return letter;
    const base = letter === letter.toUpperCase() ? 65 : 97;
    const shift = shifts[position++ % shifts.length] * direction;
    return String.fromCharCode(base + (letter.charCodeAt(0) - base + shift + 26) % 26);
  }).join('');
}
