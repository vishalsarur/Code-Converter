const inputCodeElem = document.getElementById('input-code');
const outputCodeElem = document.getElementById('output-code');
const sourceLanguageSelect = document.getElementById('source-language');
const targetLanguageSelect = document.getElementById('target-language');
const convertButton = document.getElementById('convert-button');
const swapButton = document.getElementById('swap-button');
const errorMessageDiv = document.getElementById('error-message');

function setIsLoading(loading) {
  convertButton.disabled = loading;
  swapButton.disabled = loading;
  inputCodeElem.disabled = loading;
  sourceLanguageSelect.disabled = loading;
  targetLanguageSelect.disabled = loading;

  if (loading) {
    convertButton.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="spinner -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Converting...
      </span>
    `;
  } else {
    convertButton.textContent = 'Convert Code';
  }
}

function setErrorMessage(message) {
  if (message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
  } else {
    errorMessageDiv.textContent = '';
    errorMessageDiv.classList.add('hidden');
  }
}

async function convertCode() {
  setIsLoading(true);
  setErrorMessage('');
  outputCodeElem.value = '';

  const inputCode = inputCodeElem.value;
  const sourceLanguage = sourceLanguageSelect.value;
  const targetLanguage = targetLanguageSelect.value;

  if (!inputCode.trim()) {
    setErrorMessage('Please enter code to convert.');
    setIsLoading(false);
    return;
  }

  const prompt = `Convert the following code from ${sourceLanguage} to ${targetLanguage}. Provide only the converted code, without any additional text or explanations. If the code is invalid or cannot be converted, return an empty string.

\`\`\`${sourceLanguage}
${inputCode}
\`\`\`
`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  };

  const apiKey = "AIzaSyDuEfa_XRDPa_gYglBd6zQxUeyskb7NTYs"; // Insert key 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      outputCodeElem.value = result.candidates[0].content.parts[0].text.trim();
    } else {
      setErrorMessage('No conversion result or unexpected API response structure.');
    }
  } catch (error) {
    setErrorMessage(`Failed to convert code: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
}

function swapLanguages() {
  const source = sourceLanguageSelect.value;
  const target = targetLanguageSelect.value;

  sourceLanguageSelect.value = target;
  targetLanguageSelect.value = source;

  inputCodeElem.value = outputCodeElem.value;
  outputCodeElem.value = '';
  inputCodeElem.placeholder = `Enter ${sourceLanguageSelect.value} code here...`;
}

convertButton.addEventListener('click', convertCode);
swapButton.addEventListener('click', swapLanguages);
sourceLanguageSelect.addEventListener('change', () => {
  inputCodeElem.placeholder = `Enter ${sourceLanguageSelect.value} code here...`;
});
