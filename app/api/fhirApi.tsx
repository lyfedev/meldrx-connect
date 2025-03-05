import FHIR from "fhirclient";

export const getPatients = async () => {
  try {
    const response = await fetch("/api/patients"); // Adjust API URL if needed
    if (!response.ok) throw new Error("Failed to fetch patients");
    return await response.json();
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
};

export async function submitObservation(observation: any) {
  try {
    // Ensure the FHIR client is ready (SMART authentication)
    const client = await FHIR.oauth2.ready();

    // Send the observation to the FHIR server
    const response = await client.request({
      url: "/Observation",
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
      },
      body: JSON.stringify(observation),
    });

    console.log("✅ Successfully submitted observation:", response);
    return response;
  } catch (error) {
    console.error("❌ Error submitting observation:", error);
    throw error;
  }
}