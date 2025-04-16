export function setupQuestionHandlers() {
  document.getElementById("question2").addEventListener("change", handleQuestion2Change);
  document.getElementById("question2a").addEventListener("change", handleQuestion2aChange);
  document.getElementById("question4").addEventListener("change", handleQuestion4Change);
}

function handleQuestion2Change() {
  const question2Value = this.value;
  if (question2Value === "yes") {
    document.getElementById("question2-details").style.display = "block";
  } else {
    document.getElementById("question2-details").style.display = "none";
    document.getElementById("question2a-details").style.display = "none";
  }
}

function handleQuestion2aChange() {
  const question2aValue = this.value;
  document.getElementById("question2a-details").style.display = question2aValue === "yes" ? "block" : "none";
}

function handleQuestion4Change() {
  const question4Value = this.value;
  document.getElementById("question4-details").style.display = question4Value === "yes" ? "block" : "none";
}