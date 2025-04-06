document.getElementById("fetchRecords").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "Fetching records...";

  const apiUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api/records"
      : "https://your-production-url.com/api/records"; // ✅ Use full URL in production

  console.log("📡 Fetching from:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      headers: { Accept: "application/json" }, // ✅ Ensure JSON response
    });

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    output.textContent = `❌ Error fetching records: ${error.message}`;
    console.error("❌ Fetch error:", error);
  }
});
