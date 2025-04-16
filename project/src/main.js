import { setupRugHandlers } from './modules/rugHandlers.js';
import { setupQuestionHandlers } from './modules/questionHandlers.js';
import { setupClipboard } from './modules/clipboard.js';
import { setupPdfQuote } from './modules/pdfQuote.js';
import { setupCalculator } from './modules/calculator.js';

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
  setupRugHandlers();
  setupQuestionHandlers();
  setupClipboard();
  setupPdfQuote();
  setupCalculator();
});