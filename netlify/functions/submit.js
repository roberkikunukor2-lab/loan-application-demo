const form = document.getElementById("applicationForm");
const submitBtn = document.getElementById("submitBtn");
const status = document.getElementById("status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  status.textContent = "";

  try {
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      national_id: formData.get("national_id"),
      amount: formData.get("amount"),
      employment: formData.get("employment"),
      income: formData.get("income"),
      period: formData.get("period"),
      terms: formData.get("terms") !== null
    };

    const response = await fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not submit. Please try again.");
    }

    status.textContent =
      result.message ||
      "Application received! Thank you for applying. We'll review your details and be in touch soon.";

    form.reset();

  } catch (error) {
    status.textContent =
      error.message || "Could not submit. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Application";
  }
});
