// Test Section 21 navigation and implementation
console.log('🔍 Testing Section 21 navigation...');

// Check if Section 21 button exists
const section21Button = document.querySelector('[data-testid="section-section21-nav-button"]');
if (section21Button) {
  console.log('✅ Section 21 navigation button found!');
  console.log('Button text:', section21Button.textContent);
  
  // Try to click it
  section21Button.scrollIntoView();
  setTimeout(() => {
    section21Button.click();
    console.log('✅ Clicked Section 21 button');
    
    // Wait for component to load and check for Section 21 form
    setTimeout(() => {
      const section21Form = document.querySelector('.section21-form');
      if (section21Form) {
        console.log('✅ Section 21 form loaded successfully!');
        
        // Test radio button interaction
        const mentalHealthRadio = document.querySelector('input[name="mentalHealthConsultation"][value="YES"]');
        if (mentalHealthRadio) {
          console.log('✅ Mental health consultation radio button found');
          
          // Test clicking the radio button
          mentalHealthRadio.click();
          console.log('✅ Clicked mental health consultation YES radio');
          
          // Check if the value was set
          setTimeout(() => {
            if (mentalHealthRadio.checked) {
              console.log('🎉 SUCCESS: Radio button value persisted!');
              console.log('🎉 Section 21 simplified implementation is working!');
            } else {
              console.log('❌ Radio button value did not persist');
            }
          }, 500);
        } else {
          console.log('❌ Mental health consultation radio button not found');
        }
      } else {
        console.log('❌ Section 21 form not found after navigation');
      }
    }, 1000);
  }, 100);
} else {
  console.log('❌ Section 21 navigation button not found');
  
  // List all available section buttons for debugging
  const allSectionButtons = document.querySelectorAll('[data-testid*="section-"]');
  console.log('Available section buttons:', allSectionButtons.length);
  allSectionButtons.forEach((btn, index) => {
    console.log(`${index}: ${btn.getAttribute('data-testid')} - ${btn.textContent?.trim()}`);
  });
}
