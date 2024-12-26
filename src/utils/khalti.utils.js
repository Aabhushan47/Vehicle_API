const axios = require("axios");

// Function to initialize Khalti Payment
async function initializeKhaltiPayment(details) {
    const headersList = {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
    };

    const bodyContent = JSON.stringify(details);

    try {
        const response = await axios.post(
            `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
            bodyContent,
            { headers: headersList }
        );
        return response.data;
    } catch (error) {
        console.error("Error initializing Khalti payment:", error);
        throw error;
    }
}

// // Function to verify Khalti Payment
async function verifyKhaltiPayment(pidx) {
    const headersList = {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
    };

    const bodyContent = JSON.stringify({ pidx });

    try {
        const response = await axios.post(`${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`, bodyContent, {
            headers: headersList
        });
        return response.data;
    } catch (error) {
        console.error("Error verifying Khalti payment:", error);
        throw error;
    }
}

module.exports = { verifyKhaltiPayment, initializeKhaltiPayment };
