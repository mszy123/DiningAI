var currentMenu = [];

document.addEventListener('DOMContentLoaded', () => {
    displaySavedRecipes();

    document.getElementById('fetchMenuButton').addEventListener('click', () => {

        // Retrieve the selected dietary restriction
        const selectedDiet = document.querySelector('input[name="diet"]:checked').value;

        // Send the selected dietary restriction to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "fetchMenu", diet: selectedDiet }, function (response) {
                if (chrome.runtime.lastError) {
                    // Handle the error, e.g., show a message in the popup
                    document.getElementById('menu').textContent = 'Error: ' + chrome.runtime.lastError.message;
                    console.error(chrome.runtime.lastError.message);
                    return;
                }

                // Display the fetched menu data in the popup, including handling based on the dietary restriction if applicable
                if (response && response.data) {
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
});


function displaySavedRecipes() {
    // Fetch all saved recipes from Chrome's local storage
    chrome.storage.local.get(null, function (items) {
        const recipesContainer = document.getElementById('menu'); // Assuming you want to display the recipes here
        recipesContainer.innerHTML = ''; // Clear previous content

        // Check if there are any saved recipes
        if (Object.keys(items).length === 0) {
            recipesContainer.textContent = 'No saved recipes.';
            return;
        }

        // Iterate through all saved recipes and display them
        Object.keys(items).forEach(key => {
            if (key.startsWith('recipe_')) { // Make sure it's a recipe item
                const recipe = items[key];
                const recipeElement = document.createElement('div');
                recipeElement.className = "savedRecipe";
                recipeElement.style.marginBottom = '10px';

                const recipeName = document.createElement('h3');
                recipeName.textContent = recipe.name;

                const ingredientsList = document.createElement('ul');
                recipe.ingredients.forEach(ingredient => {
                    const ingredientItem = document.createElement('li');
                    ingredientItem.textContent = ingredient;
                    ingredientsList.appendChild(ingredientItem);
                });

                const instructions = document.createElement('p');
                instructions.textContent = `Instructions: ${recipe.instructions}`;

                // Append elements to the recipeElement
                recipeElement.appendChild(recipeName);
                recipeElement.appendChild(ingredientsList);
                recipeElement.appendChild(instructions);

                // Append the recipeElement to the recipesContainer
                recipesContainer.appendChild(recipeElement);
            }
        });
    });
}