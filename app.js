const apiKey = "5f268843-117b-41a8-90a0-4f4bea9b1832";
const url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";

// Event listener for form submission
document
  .getElementById("wordForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const words = document
      .getElementById("wordInput")
      .value.split("\n")
      .map((word) => word.trim()) // Convert input words to lowercase
      .filter((word) => word !== "");

    // Show loading message and hide results
    document.getElementById("loadingMessage").style.display = "block";
    document.getElementById("results").innerHTML = "";

    // Collect matched headwords while maintaining order
    const orderedResults = (
      await Promise.all(
        words.map(async (word) => {
          const matchedHeadwords = await searchWord(word);
          return matchedHeadwords.length > 0
            ? matchedHeadwords.join(", ")
            : null;
        })
      )
    ).filter((result) => result !== null); // Remove null entries (words with no match)

    // Hide loading message and show results
    document.getElementById("loadingMessage").style.display = "none";

    // Display results
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("result");

    if (orderedResults.length > 0) {
      resultDiv.innerHTML = `<strong>Headwords:</strong><br>${orderedResults
        .map(
          (word) =>
            `<a href="https://www.merriam-webster.com/dictionary/${word}" target="_blank">${word}</a>`
        )
        .join("<br>")}`;
      document.getElementById("downloadContainer").style.display = "flex"; // Make buttons visible
    } else {
      resultDiv.innerHTML = "<strong>No headwords found.</strong>";
      document.getElementById("downloadContainer").style.display = "none"; // Keep them hidden
    }

    document.getElementById("results").appendChild(resultDiv);

    document
      .getElementById("downloadTxt")
      .addEventListener("click", function () {
        downloadTxt(orderedResults);
      });
    document
      .getElementById("downloadExcel")
      .addEventListener("click", function () {
        downloadExcel(orderedResults);
      });
  });

// Function to search for a word and return matched headwords
async function searchWord(word) {
  try {
    const response = await fetch(`${url}${word}?key=${apiKey}`);
    if (!response.ok) throw new Error(`Failed to fetch data for ${word}`);

    const jsonData = await response.json();
    return findHeadwords(jsonData, word);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Function to find headwords from the API response
function findHeadwords(jsonData, word) {
  const headwordsList = [];

  try {
    const headword = jsonData[0].hwi.hw.replace(/\*/g, ""); // Remove '*'
    if (headword.toLowerCase() === word.toLowerCase()) {
      headwordsList.push(headword);
    }
  } catch (error) {
    console.error("Error processing entry", error);
  }

  return headwordsList;
}

// Function to export to TXT
function downloadTxt(results) {
  const blob = new Blob([results.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "orderedResults.txt";
  link.click();
}

// Function to export to Excel
function downloadExcel(results) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ...results.map((word) => [word]),
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Headwords");
  // Save Excel file
  XLSX.writeFile(wb, "orderedResults.xlsx");
}
