var currentMenu = [];

document.getElementById('fetchMenuButton').addEventListener('click', () => {
    // Retrieve the selected dietary restriction
    const selectedDiet = document.querySelector('input[name="diet"]:checked').value;

    // Send the selected dietary restriction to the content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "fetchMenu", diet: selectedDiet}, function(response) {
            if (chrome.runtime.lastError) {
                // Handle the error, e.g., show a message in the popup
                document.getElementById('menu').textContent = 'Error: ' + chrome.runtime.lastError.message;
                console.error(chrome.runtime.lastError.message);
                return;
            }

            // Display the fetched menu data in the popup, including handling based on the dietary restriction if applicable
            if(response && response.data) {
                // Example: Update the display based on the response and selected dietary restriction
                document.getElementById('menu').textContent = response.data;
                currentMenu = response.data;
            } else {
                document.getElementById('menu').textContent = 'No data received.';
            }
        });
    });
    console.log(currentMenu); // Note: This will log the initial state of currentMenu before the asynchronous response is received
});
