const form = document.getElementById("applicationForm");
const button = document.getElementById("submitBtn");
const status = document.getElementById("status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  button.disabled = true;
  button.textContent = "Sending...";
  status.textContent = "";

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Make sure Terms and Conditions were accepted
    if (!formData.has("terms")) {
      throw new Error("Please accept the Terms and Conditions.");
    }

    // Convert checkbox value to Boolean
    data.terms = true;

    const response = await fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Submission failed");
    }

    status.textContent =
      "Application received! Thank you for applying for an EcoCash Loan. We'll review your details and be in touch soon.";

    form.reset();

  } catch (error) {
    console.error("Submission error:", error);
    status.textContent =
      error.message || "Could not submit. Please try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Submit Application";
  }
});
