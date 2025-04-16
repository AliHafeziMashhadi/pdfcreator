export function setupRugHandlers() {
  document.getElementById("add-rug").addEventListener("click", addRugInput);
  document.getElementById("rug-container").addEventListener("click", handleRugDelete);
  document.getElementById("rug-container").addEventListener("change", handleUnitChange);
}

function addRugInput() {
  const rugContainer = document.getElementById("rug-container");
  const newRugNumber = rugContainer.children.length + 1;
  const rugInput = document.createElement("div");
  rugInput.className = "rug-input";
  rugInput.id = `rug-${newRugNumber}`;
  rugInput.innerHTML = `
    <span id="rug-label-${newRugNumber}">Rug #${newRugNumber}</span>

    <label for="width${newRugNumber}" class="dimension-label">Width:</label>
    <input type="number" id="width${newRugNumber}" name="width${newRugNumber}">

    <label for="length${newRugNumber}" class="dimension-label">Length:</label>
    <input type="number" id="length${newRugNumber}" name="length${newRugNumber}">

    <div class="area-container">
      <label for="area${newRugNumber}">Area (sq meter):</label>
      <input type="number" id="area${newRugNumber}" name="area${newRugNumber}" placeholder="Enter area in sq meter">
    </div>

    <input type="text" id="notes${newRugNumber}" class="notes-input" placeholder="Notes for Rug #${newRugNumber}">

    <label for="unit${newRugNumber}">Unit:</label>
    <select id="unit${newRugNumber}" name="unit${newRugNumber}">
      <option value="ft" selected>ft</option>
      <option value="in">in</option>
      <option value="sq meter">sq meter</option>
    </select>

    <button class="delete-rug" data-rug-id="${newRugNumber}">Delete</button>
  `;
  rugContainer.appendChild(rugInput);
  updateRugIndices();
}

function handleRugDelete(event) {
  if (event.target.classList.contains("delete-rug")) {
    const rugId = event.target.getAttribute("data-rug-id");
    deleteRug(rugId);
  }
}

function deleteRug(rugId) {
  const rugElement = document.getElementById(`rug-${rugId}`);
  if(rugElement) {
    rugElement.parentNode.removeChild(rugElement);
    updateRugIndices();
  }
}

function handleUnitChange(e) {
  if (e.target.tagName.toLowerCase() === "select" && e.target.name.includes("unit")) {
    const rugDiv = e.target.closest(".rug-input");
    if (!rugDiv) return;
    const unit = e.target.value;
    const dimensionLabels = rugDiv.querySelectorAll('.dimension-label');
    const dimensionInputs = rugDiv.querySelectorAll('input[id^="width"], input[id^="length"]');
    const areaContainer = rugDiv.querySelector('.area-container');

    if (unit === "sq meter") {
      dimensionLabels.forEach(label => label.style.display = "none");
      dimensionInputs.forEach(inp => inp.style.display = "none");
      if (areaContainer) areaContainer.style.display = "flex";
    } else {
      dimensionLabels.forEach(label => label.style.display = "inline-block");
      dimensionInputs.forEach(inp => inp.style.display = "inline-block");
      if (areaContainer) areaContainer.style.display = "none";
    }
  }
}

function updateRugIndices() {
  const rugs = document.querySelectorAll("#rug-container .rug-input");
  rugs.forEach((rug, index) => {
    const newIndex = index + 1;
    rug.id = `rug-${newIndex}`;

    // Update label
    const span = rug.querySelector("span");
    if (span) {
      span.id = `rug-label-${newIndex}`;
      span.textContent = `Rug #${newIndex}`;
    }

    // Width
    const widthInput = rug.querySelector('input[id^="width"]');
    if (widthInput) {
      widthInput.id = `width${newIndex}`;
      widthInput.name = `width${newIndex}`;
    }

    // Length
    const lengthInput = rug.querySelector('input[id^="length"]');
    if (lengthInput) {
      lengthInput.id = `length${newIndex}`;
      lengthInput.name = `length${newIndex}`;
    }

    // Area
    const areaInput = rug.querySelector('input[id^="area"]');
    if (areaInput) {
      areaInput.id = `area${newIndex}`;
      areaInput.name = `area${newIndex}`;
      const areaLabel = rug.querySelector('label[for^="area"]');
      if (areaLabel) {
        areaLabel.setAttribute("for", `area${newIndex}`);
      }
    }

    // Notes
    const notesInput = rug.querySelector('input[id^="notes"]');
    if (notesInput) {
      notesInput.id = `notes${newIndex}`;
      notesInput.placeholder = `Notes for Rug #${newIndex}`;
    }

    // Unit
    const unitSelect = rug.querySelector('select[id^="unit"]');
    if (unitSelect) {
      unitSelect.id = `unit${newIndex}`;
      unitSelect.name = `unit${newIndex}`;
    }

    // Delete Button
    const deleteButton = rug.querySelector('button.delete-rug');
    if (deleteButton) {
      deleteButton.setAttribute("data-rug-id", newIndex);
    }
  });
}

export { updateRugIndices };