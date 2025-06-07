// Find and click Section 21 button
console.log('🔍 Looking for Section 21 button...');
const section21Button = document.querySelector('[data-testid="section-section21-nav-button"]');
if (section21Button) {
  console.log('✓ Section 21 button found');
  section21Button.scrollIntoView();
  setTimeout(() => {
    section21Button.click();
    console.log('✅ Clicked Section 21 button');
  }, 100);
} else {
  console.log('❌ Section 21 button not found, trying alternative selectors...');
  
  // Try looking for buttons with "21" or "Mental" in text
  const allButtons = document.querySelectorAll('button');
  console.log('Total buttons found:', allButtons.length);
  
  for(let i = 0; i < allButtons.length; i++) {
    const btn = allButtons[i];
    if(btn.textContent && (btn.textContent.includes("21") || btn.textContent.includes("Mental"))) {
      console.log('Found potential Section 21 button:', btn.textContent, 'at index', i);
      btn.scrollIntoView();
      setTimeout(() => {
        btn.click();
        console.log('✅ Clicked potential Section 21 button');
      }, 100);
      break;
    }
  }
}
