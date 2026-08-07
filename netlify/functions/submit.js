exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    // Required fields
    const required = [
      "name",
      "phone",
      "national_id",
      "amount",
      "employment",
      "income",
      "period"
    ];

    for (const field of required) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        String(data[field]).trim() === ""
      ) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: `Missing required field: ${field}`
          })
        };
      }
    }

    // Terms must be accepted
    if (data.terms !== true && data.terms !== "true") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Please accept the Terms and Conditions."
        })
      };
    }

    // Validate numbers
    const amount = Number(data.amount);
    const income = Number(data.income);

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid loan amount."
        })
      };
    }

    if (!Number.isFinite(income) || income < 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid income amount."
        })
      };
    }

    // Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are missing.");

      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Server configuration error."
        })
      };
    }

    // Save EVERYTHING from the form
    const application = {
      name: String(data.name).trim(),
      phone: String(data.phone).trim(),
      national_id: String(data.national_id).trim(),
      amount: amount,
      employment: String(data.employment).trim(),
      income: income,
      period: String(data.period).trim(),
      terms: true
    };

    const response = await fetch(
      `${supabaseUrl}/rest/v1/loan_applications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(application)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error:", errorText);

      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Could not save the application."
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Application received successfully."
      })
    };

  } catch (error) {
    console.error("Submission error:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Unable to process the application right now."
      })
    };
  }
};
