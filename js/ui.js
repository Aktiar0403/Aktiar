document.addEventListener('DOMContentLoaded', () => {
  console.log("Accordion setup starting");

  document.querySelectorAll('.accordion-button').forEach(button => {
    button.addEventListener('click', () => {
      console.log("Accordion button clicked!");
      const content = button.nextElementSibling;
      if (content) content.classList.toggle('show');
    });
  });

  console.log("Accordion setup done");
});
