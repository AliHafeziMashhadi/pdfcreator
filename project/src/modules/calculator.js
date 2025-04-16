import { updatePdfSection } from './pdfQuote.js';

export function setupCalculator() {
  document.getElementById("calculate").addEventListener("click", calculatePricing);
}

function formatRugsMentioned(rugsArray) {
  if (rugsArray.length === 0) {
    return "";
  }
  if (rugsArray.length === 1) {
    return `including ${rugsArray[0]} rugs.`;
  } else if (rugsArray.length === 2) {
    return `including ${rugsArray[0]} and ${rugsArray[1]} rugs.`;
  } else {
    const allButLast = rugsArray.slice(0, -1);
    const last = rugsArray[rugsArray.length - 1];
    return `including ${allButLast.join(", ")}, and ${last} rugs.`;
  }
}

function getRugDetails() {
  let rugDetails = "";
  const rugElements = document.querySelectorAll("#rug-container .rug-input");
  rugElements.forEach((rug, index) => {
    const newIndex = index + 1;
    const unitSelect = rug.querySelector('select[id^="unit"]');
    const notesInput = rug.querySelector('input[id^="notes"]');
    const notes = notesInput ? notesInput.value : "No notes";
    const unit = unitSelect ? unitSelect.value : "ft";

    if (unit === "sq meter") {
      const areaInput = rug.querySelector('input[id^="area"]');
      const areaVal = areaInput ? areaInput.value : "N/A";
      rugDetails += `Rug #${newIndex} - Area: ${areaVal} meter, Notes: ${notes}<br>`;
    } else {
      const widthInput = rug.querySelector('input[id^="width"]');
      const lengthInput = rug.querySelector('input[id^="length"]');
      const widthVal = widthInput ? widthInput.value : "N/A";
      const lengthVal = lengthInput ? lengthInput.value : "N/A";
      rugDetails += `Rug #${newIndex} - Size: ${widthVal} x ${lengthVal} ${unit}, Notes: ${notes}<br>`;
    }
  });
  return rugDetails;
}

function getQuestionsAnswers() {
  const question1 = document.getElementById("question1").value || "N/A";
  const question2 = document.getElementById("question2").value || "N/A";
  const question2a = document.getElementById("question2a").value || "N/A";
  const question2aa = document.getElementById("question2aa").value || "N/A";
  const question3 = document.getElementById("question3").value || "N/A";
  const question3a = document.getElementById("question3a").value || "N/A";
  const question4 = document.getElementById("question4").value || "N/A";
  const question4a = document.getElementById("question4a").value || "N/A";
  const question5 = document.getElementById("question5").value || "N/A";
  const question6 = document.getElementById("question6").value || "N/A";
  const question7 = document.getElementById("question7").value || "N/A";

  let questionsAnswers = `
1. Can you tell me anything you know about the rugs (e.g., handmade, sizes, fiber content, where you got them from)?<br>
${question1}<br><br>
2. Any stains or odors?<br>
${question2}<br><br>
3. Have you ever cleaned these particular rugs?<br>
${question3}<br><br>
4. Have you ever worked with a professional rug cleaning company before?<br>
${question4}<br><br>
5. Any kids or pets in the house?<br>
${question5}<br><br>
6. What's most important for you, price, turnaround time or quality? Or is there a specific time you need these by?<br>
${question6}<br><br>
7. Have I asked about everything that's important to you?<br>
${question7}<br><br>
  `;

  if (question2 === "yes") {
    questionsAnswers += `
So after the rugs were stained, did you ever try cleaning them yourself?<br>
${question2a}<br><br>
    `;
    if (question2a === "yes") {
      questionsAnswers += `
How did that go? Did any dyes bleed?<br>
${question2aa}<br><br>
      `;
    }
  }

  questionsAnswers += `
If yes, how long ago did you clean them? If not, how long have you had the rugs?<br>
${question3a}<br><br>
  `;

  if (question4 === "yes") {
    questionsAnswers += `
What did you like or not like about working with them?<br>
${question4a}<br><br>
    `;
  }

  return questionsAnswers;
}

function calculatePricing() {
  // 1) Collect user inputs
  const agentName = document.getElementById("agent").value || "Ali";
  const customerName = document.getElementById("customer-name").value || "";
  const serviceOption = document.getElementById("service-option").value || "both";

  // 2) Gather rugs mentioned
  const checkedRugs = Array.from(document.querySelectorAll('input[name="rugs-mentioned"]:checked'))
    .map(el => el.value.toLowerCase());
  const rugsMentionedText = formatRugsMentioned(checkedRugs);

  // 3) Collect rug data
  const rugElements = document.querySelectorAll("#rug-container .rug-input");
  if (rugElements.length === 0) {
    alert("Please add at least one rug before calculating.");
    return;
  }

  // We'll store objects of form: { areaSqFt, displayString }
  const rugsData = [];

  rugElements.forEach((rug, idx) => {
    const unitSelect = rug.querySelector('select[id^="unit"]');
    const unit = unitSelect ? unitSelect.value : "ft";

    let areaSqFt = 0;
    let displayStr = "";

    if (unit === "sq meter") {
      // read area
      const areaInput = rug.querySelector('input[id^="area"]');
      const sqMVal = parseFloat(areaInput.value) || 0;
      areaSqFt = sqMVal * 10.7639; // 1 sq m ~ 10.7639 sq ft
      if (sqMVal > 0) {
        displayStr = `${sqMVal} meter`;
      }
    } else {
      // read width & length
      const widthInput = rug.querySelector('input[id^="width"]');
      const lengthInput = rug.querySelector('input[id^="length"]');
      let widthVal = parseFloat(widthInput.value) || 0;
      let lengthVal = parseFloat(lengthInput.value) || 0;

      if (unit === "in") {
        widthVal /= 12;
        lengthVal /= 12;
      }
      areaSqFt = widthVal * lengthVal;
      if (widthVal > 0 && lengthVal > 0) {
        displayStr = `${widthVal.toFixed(2)} ft x ${lengthVal.toFixed(2)} ft`;
      }
    }

    // If valid area
    if (areaSqFt > 0 && displayStr) {
      rugsData.push({
        areaSqFt,
        display: displayStr
      });
    }
  });

  if (rugsData.length === 0) {
    alert("Please enter valid dimensions (or area) for at least one rug.");
    return;
  }

  // 4) Pricing constants
  const pricingWithoutPud = { Economy: 1.95, Midrange: 3.95, Premium: 5.95 };
  const minimumWithoutPud = { Economy: 75, Midrange: 105, Premium: 135 };

  const pricingWithPud = { Economy: 2.45, Midrange: 4.45, Premium: 6.45 };
  const minimumWithPud = { Economy: 75, Midrange: 105, Premium: 135 };

  const minimumTotalWithPud = 400;

  // 5) Calculate per-rug costs
  const rugCostsWithoutPud = { Economy: [], Midrange: [], Premium: [] };
  const rugCostsWithPud = { Economy: [], Midrange: [], Premium: [] };

  rugsData.forEach(rug => {
    const sqFt = rug.areaSqFt;
    // Drop-off
    for (const tier of Object.keys(pricingWithoutPud)) {
      const cost = sqFt * pricingWithoutPud[tier];
      rugCostsWithoutPud[tier].push(Math.max(cost, minimumWithoutPud[tier]));
    }
    // Pickup & Delivery
    for (const tier of Object.keys(pricingWithPud)) {
      const cost = sqFt * pricingWithPud[tier];
      rugCostsWithPud[tier].push(Math.max(cost, minimumWithPud[tier]));
    }
  });

  // 6) Sum the costs
  const totalCostsWithoutPud = {};
  for (const tier of Object.keys(rugCostsWithoutPud)) {
    totalCostsWithoutPud[tier] = rugCostsWithoutPud[tier].reduce((a, b) => a + b, 0);
  }

  const totalCostsWithPud = {};
  const deliverySurcharge = {};
  for (const tier of Object.keys(rugCostsWithPud)) {
    const sum = rugCostsWithPud[tier].reduce((a, b) => a + b, 0);
    if (sum < minimumTotalWithPud) {
      deliverySurcharge[tier] = minimumTotalWithPud - sum;
      totalCostsWithPud[tier] = minimumTotalWithPud;
    } else {
      deliverySurcharge[tier] = 0;
      totalCostsWithPud[tier] = sum;
    }
  }

  // 7) Build the rug-by-rug breakdown
  let breakdown = "";
  rugsData.forEach((rug, i) => {
    breakdown += `Rug #${i+1} (${rug.display}):<br>`;
    for (const tier of Object.keys(pricingWithoutPud)) {
      const dropOffPrice = rugCostsWithoutPud[tier][i];
      const pickupPrice = rugCostsWithPud[tier][i];
      if (serviceOption === "pickup") {
        breakdown += `${tier}: $${pickupPrice.toFixed(2)} (Pickup)<br>`;
      } else if (serviceOption === "dropoff") {
        breakdown += `${tier}: $${dropOffPrice.toFixed(2)} (Drop Off)<br>`;
      } else {
        breakdown += `${tier}: $${dropOffPrice.toFixed(2)} (Drop Off) / $${pickupPrice.toFixed(2)} (Pickup)<br>`;
      }
    }
    breakdown += `<br>`;
  });

  // 8) Build the totals section
  if (serviceOption === "pickup") {
    breakdown += `Total if we pick up & deliver:<br>`;
    for (const [tier, cost] of Object.entries(totalCostsWithPud)) {
      if (deliverySurcharge[tier] > 0) {
        breakdown += `${tier}: $${cost.toFixed(2)} (including $${deliverySurcharge[tier].toFixed(2)} surcharge)<br>`;
      } else {
        breakdown += `${tier}: $${cost.toFixed(2)}<br>`;
      }
    }
  } else if (serviceOption === "dropoff") {
    breakdown += `Total if you drop off:<br>`;
    for (const [tier, cost] of Object.entries(totalCostsWithoutPud)) {
      breakdown += `${tier}: $${cost.toFixed(2)}<br>`;
    }
  } else {
    breakdown += `Total if you drop off:<br>`;
    for (const [tier, cost] of Object.entries(totalCostsWithoutPud)) {
      breakdown += `${tier}: $${cost.toFixed(2)}<br>`;
    }
    breakdown += `<br>`;
    breakdown += `Total if we pick up & deliver:<br>`;
    for (const [tier, cost] of Object.entries(totalCostsWithPud)) {
      if (deliverySurcharge[tier] > 0) {
        breakdown += `${tier}: $${cost.toFixed(2)} (including $${deliverySurcharge[tier].toFixed(2)} surcharge)<br>`;
      } else {
        breakdown += `${tier}: $${cost.toFixed(2)}<br>`;
      }
    }
  }

  // 9) Retrieve General Notes
  const generalNotesValue = document.getElementById("general-notes").value || "";

  // 10) Build final quote text
  const greeting = customerName.trim() ? `Hi ${customerName},<br><br>` : "";
  const dropoffNote = (serviceOption === "dropoff" || serviceOption === "both")
    ? `<br><br>We offer drop off at two locations: West LA by appointment (ask us for the link) and Canoga Park (Monday-Friday 9AM-6PM, Saturday 10:30AM-4:30PM).`
    : "";

  const customerQuote = `
${greeting}
This is ${agentName} with Babash Rug Services. Thanks for reaching out!<br><br>
Your price will vary depending on whether you want pickup and delivery and which of our tiers interests you. Here's a breakdown:<br><br>
${breakdown}<br>
Please let me know if you have any questions, we're happy to help!<br><br>
Visit <a href="https://babashrug.com/before-after/">https://babashrug.com/before-after/</a> to see examples of the different kinds of rugs we clean here daily${rugsMentionedText ? ", " + rugsMentionedText : ""}${dropoffNote}<br><br>
${agentName}<br>
Babash Rug Services - Rug Cleaning & Rug Repair<br>
<a href="https://babashrug.com">https://babashrug.com</a><br>
39+ Years of Proud Experience<br>
Rated 5.0 Stars out of 500+ Reviews<br>
WoolSafe & IICRC Certified Specialists
  `;

  // Display the quote
  const customerQuoteOutput = document.getElementById("customer-quote-output");
  customerQuoteOutput.innerHTML = `<h2>Customer's Quote</h2>` + customerQuote;

  // 11) Build Intel Section
  const intel = `
<h2>Intel</h2>
<h3>General Notes</h3>
${generalNotesValue.replace(/\n/g, '<br>')}
<h3>Rug Details</h3>
${getRugDetails()}
<h3>Questions & Answers</h3>
${getQuestionsAnswers()}
  `;
  document.getElementById("intel-output").innerHTML = intel;

  // 12) Update PDF section
  updatePdfSection(rugsData);

  // 13) Blink the Calculate button
  const calcButton = document.getElementById("calculate");
  calcButton.classList.add("blink-green");
  setTimeout(() => calcButton.classList.remove("blink-green"), 500);
}