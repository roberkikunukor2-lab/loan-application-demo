exports.handler = async (event) => {
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
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            error: `Missing required field: ${field}`
          })
        };
      }
    }

    // Check Terms
    if (data.terms !== true && data.terms !== "true") {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Please accept the Terms and Conditions."
        })
      };
    }

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

    // Get environment variables
    const rawSupabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Environment check:", {
      hasUrl: Boolean(rawSupabaseUrl),
      hasKey: Boolean(supabaseKey)
    });

    if (!rawSupabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Server configuration error."
        })
      };
    }

    // Remove trailing slashes
    const supabaseUrl = rawSupabaseUrl.trim().replace(/\/+$/, "");

    // Build Supabase REST URL
    const supabaseEndpoint =
      `${supabaseUrl}/rest/v1/loan_applications`;

    // Log endpoint only — never log the secret key
    console.log("Supabase endpoint:", supabaseEndpoint);

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

    const response = await fetch(supabaseEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(application)
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Supabase response:", errorText);

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Could not save the application."
        })
      };
    }

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
    console.error("Function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Unable to process the application right now."
      })
    };
  }
};
