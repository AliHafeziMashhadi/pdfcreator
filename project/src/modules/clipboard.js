export function setupClipboard() {
  document.getElementById("copy-customer-quote").addEventListener("click", copyCustomerQuote);
  document.getElementById("copy-intel").addEventListener("click", copyIntel);
}

function copyCustomerQuote() {
  let customerQuoteText = document.getElementById("customer-quote-output").innerText;
  let lines = customerQuoteText.split("\n");
  if (lines[0].trim().toLowerCase().includes("customer's quote")) {
    lines.shift();
  }
  customerQuoteText = lines.join("\n").trim();
  copyTextToClipboard(customerQuoteText);
}

function copyIntel() {
  const intelText = document.getElementById("intel-output").innerText;
  copyTextToClipboard(intelText);
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch((err) => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    alert("Copied to clipboard!");
  } catch (err) {
    alert("Unable to copy automatically. Please copy manually.");
  }
  document.body.removeChild(textArea);
}