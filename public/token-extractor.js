// GharSeKro.com OAuth Token Extractor
// Copy and paste this into the browser console when you're on the API callback page

(function () {
  console.log("🚀 GharSeKro.com OAuth Token Extractor");
  console.log("Current URL:", window.location.href);

  try {
    // Get the page content
    const pageText = document.body.innerText || document.body.textContent;
    console.log("Page content:", pageText);

    // Extract JSON with temptoken
    const jsonMatch = pageText.match(/\{[^}]*"temptoken"[^}]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      console.log("Found JSON:", jsonStr);

      const tokenData = JSON.parse(jsonStr);
      const tempToken = tokenData.temptoken;

      if (tempToken) {
        console.log("✅ Extracted token:", tempToken);

        // Store token and user data
        localStorage.setItem("tempAuthToken", tempToken);
        localStorage.setItem("tempUserName", "Abhay Pandey");
        localStorage.setItem("tempUserEmail", "robertsteeve789@gmail.com");
        localStorage.setItem(
          "tempUserProfile",
          "https://lh3.googleusercontent.com/a/ACg8ocIuN-QOmHeJdd44Ihn3fAZwNtSR18bi8xIyu0R6Y2Tkr0OxFyeS=s96-c"
        );

        console.log("✅ Data stored in localStorage");

        // Redirect to shop setup
        console.log("🔄 Redirecting to shop setup...");
        window.location.href = "http://localhost:8081/setup";
      } else {
        console.error("❌ No temptoken found in JSON");
      }
    } else {
      console.error("❌ No JSON with temptoken found on page");
    }
  } catch (error) {
    console.error("❌ Error extracting token:", error);
  }
})();
