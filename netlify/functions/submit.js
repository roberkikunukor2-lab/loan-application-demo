exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    // Check required fields
    const requiredFields = [
      "name",
      "phone",
      "national_id",
      "amount",
      "employment",
      "income",
      "period"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            error: `Missing required field: ${field}`
          })
        };
      }
    }

    // Terms must be accepted
    if (data.terms !== true) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "You must agree to the Terms and Conditions."
        })
      };
    }

    // Basic validation
    const amount = Number(data.amount);
    const income = Number(data.income);

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid loan amount."
        })
      };
    }

    if (!Number.isFinite(income) || income < 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid income amount."
        })
      };
    }

    // Application accepted for processing.
    // Do NOT log or send the National ID to Telegram.
    console.log("Loan application received:", {
      name: data.name,
      phone: data.phone,
      amount: data.amount,
      employment: data.employment,
      income: data.income,
      period: data.period,
      terms: data.terms
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message:
          "Application received! Thank you for applying for an EcoCash Loan. We'll review your details and be in touch soon."
      })
    };

  } catch (error) {
    console.error("Application error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Unable to process the application right now. Please try again later."
      })
    };
  }
};
