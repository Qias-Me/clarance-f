// Find and click Section 21 button for testing
console.log('🔍 Looking for Section 21 button...');

// First try the exact data-testid
const section21Button = document.querySelector('[data-testid="section-section21-nav-button"]');
if (section21Button) {
  console.log('✓ Section 21 button found with data-testid');
  section21Button.scrollIntoView();
  setTimeout(() => {
    section21Button.click();
    console.log('✅ Clicked Section 21 button');
  }, 100);
} else {
  console.log('❌ Section 21 button not found with data-testid, trying alternative selectors...');
  
  // Try looking for buttons with "21" or "Mental" or "Psychological" in text
  const allButtons = document.querySelectorAll('button');
  console.log('Total buttons found:', allButtons.length);
  
  let found = false;
  for(let i = 0; i < allButtons.length; i++) {
    const btn = allButtons[i];
    if(btn.textContent && (
      btn.textContent.includes("21") || 
      btn.textContent.includes("Mental") || 
      btn.textContent.includes("Psychological") ||
      btn.textContent.includes("section21")
    )) {
      console.log('Found potential Section 21 button:', btn.textContent, 'at index', i);
      btn.scrollIntoView();
      setTimeout(() => {
        btn.click();
        console.log('✅ Clicked potential Section 21 button');
      }, 100);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log('❌ No Section 21 button found. Listing all buttons for debugging:');
    allButtons.forEach((btn, index) => {
      if (btn.textContent && btn.textContent.trim()) {
        console.log(`Button ${index}: "${btn.textContent.trim()}"`);
      }
    });
  }
}
