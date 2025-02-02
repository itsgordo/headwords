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
      .map((word) => word.trim())
      .filter((word) => word !== "");

    // Clear previous results
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
    } else {
      resultDiv.innerHTML = "<strong>No headwords found.</strong>";
    }

    document.getElementById("results").appendChild(resultDiv);
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
    if (headword === word) {
      headwordsList.push(headword);
    }
  } catch (error) {
    console.error("Error processing entry", error);
  }

  return headwordsList;
}
