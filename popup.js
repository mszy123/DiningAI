var currentMenu = [];

document.getElementById('fetchMenuButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "fetchMenu"}, function(response) {
            if (chrome.runtime.lastError) {
                // Handle the error, e.g., show a message in the popup
                document.getElementById('menu').textContent = 'Error: ' + chrome.runtime.lastError.message;
                console.error(chrome.runtime.lastError.message);
                return;
            }

            // Display the fetched menu data in the popup
            if(response && response.data) {

                document.getElementById('menu').textContent = response.data;
                currentMenu = response.data;
            } else {
                document.getElementById('menu').textContent = 'No data received.';
            }
        });
    });
    console.log(currentMenu);
});
