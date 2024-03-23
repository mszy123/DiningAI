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
    chrome.storage.local.get(null, function (items) {
        const recipesContainer = document.getElementById('menu');
        recipesContainer.innerHTML = ''; // Clear previous content

        if (Object.keys(items).length === 0) {
            recipesContainer.textContent = 'No saved recipes.';
            return;
        }

        Object.keys(items).forEach(key => {
            if (key.startsWith('recipe_')) {
                const recipe = items[key];
                const recipeElement = document.createElement('div');
                recipeElement.className = "savedRecipe";
                recipeElement.style.marginBottom = '10px';

                const recipeName = document.createElement('h3');
                recipeName.textContent = recipe.name;

                // Create a container for the buttons to align them side by side
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.alignItems = 'center';
                buttonContainer.style.justifyContent = 'start';
                buttonContainer.style.marginTop = '5px';

                // "Show/More Details" button
                const showButton = document.createElement('button');
                showButton.textContent = 'More Details';
                showButton.className = "showBtn"; // Assuming you have CSS for this

                // "Delete" button using Material Icons
                const deleteButton = document.createElement('span');
                deleteButton.classList.add('material-icons');
                deleteButton.textContent = 'delete_outline'; // Using 'delete_outline' for outlined delete icon
                deleteButton.style.color = 'gray';
                deleteButton.style.cursor = 'pointer';
                deleteButton.style.fontSize = '20px';
                deleteButton.style.marginTop = '3px';
                deleteButton.style.marginLeft = '5px';
                deleteButton.style.border = 'solid 1px #c7c7c7'; // Apply a border for the outline with the specified color
                deleteButton.style.padding = '4px'; // Add some padding inside the border
                deleteButton.style.borderRadius = '24px'; // Optional: apply border-radius for rounded corners
                deleteButton.style.display = 'inline-flex'; // Use inline-flex to center the icon vertically
                deleteButton.style.alignItems = 'center';
                deleteButton.style.justifyContent = 'center';
                deleteButton.setAttribute('title', 'Delete Recipe');

                // Event listener for the "Show/More Details" button
                const ingredientsList = document.createElement('ul');
                const instructions = document.createElement('p');

                showButton.addEventListener('click', () => {
                    const isHidden = ingredientsList.style.display === 'none';
                    ingredientsList.style.display = isHidden ? 'block' : 'none';
                    instructions.style.display = isHidden ? 'block' : 'none';
                    showButton.textContent = isHidden ? 'Hide Details' : 'More Details'; // Toggle button text
                });

                // Event listener for the "Delete" button
                deleteButton.addEventListener('click', function () {
                    chrome.storage.local.remove(key, function () {
                        console.log(`Recipe ${key} deleted.`);
                        displaySavedRecipes(); // Refresh the list of recipes
                    });
                });

                // Constructing the ingredients list and instructions (Initially hidden)
                recipe.ingredients.forEach(ingredient => {
                    const ingredientItem = document.createElement('li');
                    ingredientItem.textContent = ingredient;
                    ingredientsList.appendChild(ingredientItem);
                });
                ingredientsList.style.display = 'none'; // Initially hide the ingredients list

                instructions.textContent = `Instructions: ${recipe.instructions}`;
                instructions.style.display = 'none'; // Initially hide the instructions

                // Append buttons to the container
                buttonContainer.appendChild(showButton);
                buttonContainer.appendChild(deleteButton);

                // Append elements to the recipeElement
                recipeElement.appendChild(recipeName);
                recipeElement.appendChild(buttonContainer);
                recipeElement.appendChild(ingredientsList);
                recipeElement.appendChild(instructions);

                // Append the recipeElement to the recipesContainer
                recipesContainer.appendChild(recipeElement);
            }
        });
    });
}

