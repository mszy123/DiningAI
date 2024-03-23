// content.js

// Create a link element for the Material Icons stylesheet
var link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
link.rel = 'stylesheet';
document.head.appendChild(link);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "fetchMenu") {
      console.log("Received diet restriction:", request.diet); // Logging the received diet restriction
      const menuItems = scrapeMenuItems();

      // Assuming you may want to adjust getMenuItemsAsString or getRecipes to consider the dietary restriction
      let recipesString = getRecipes(menuItems, request.diet); // Now passing the diet restriction to getRecipes
      console.log(recipesString);

      getRecipes(menuItems, request.diet).then(recipesObj => { // Also passing the diet restriction here
        displayRecipesOnPage(recipesObj);
      }).catch(error => {
        console.error('Error fetching or displaying recipes:', error);
      });

      sendResponse({ data: menuItems });
    }
    // Return true if you will asynchronously send a response
    return true;
  }
);


async function displayRecipesOnPage(recipesObj) {
  if (!recipesObj || !recipesObj.recipes) {
    console.error('Invalid or missing recipes object');
    return;
  }

  // Select the first container matching the specified class name.
  const container = document.querySelector('.menus-section_menuBackground_1UmC8');
  if (!container) {
    console.error('Container element not found');
    return;
  }


  // Check if a recipes container already exists, and if so, remove it
  const existingRecipesContainer = document.getElementById('recipes-container');
  if (existingRecipesContainer) {
    existingRecipesContainer.parentNode.removeChild(existingRecipesContainer);
  }

  // Create a container for all recipes to keep them organized
  const recipesContainer = document.createElement('div');
  recipesContainer.id = 'recipes-container';
  recipesContainer.style = 'padding: 30px'; // Example styling, adjust as needed

  // Add the recipe name
  const title = document.createElement('h1');
  title.textContent = "Your Recommended Recipes:";
  title.style.fontWeight = 'bold'; // Make the text bold
  title.style.color = '#862633'; // Set the text color to maroon
  title.style.fontSize = '24px'; // Set the font size to 24px
  title.style.marginBottom = '10px';
  recipesContainer.appendChild(title);

  recipesObj.recipes.forEach((recipe, index) => {
    // Create a div for each recipe
    const recipeDiv = document.createElement('div');
    recipeDiv.style = 'margin-bottom: 20px; border: 1px solid gray; border-radius: 24px; padding: 15px;'; // Example styling, adjust as needed


    // Add the recipe name
    const recipeName = document.createElement('h2');
    recipeName.textContent = recipe.name;
    recipeDiv.appendChild(recipeName);


    // Add the ingredients list
    const ingredientsList = document.createElement('ul');
    recipe.ingredients.forEach((ingredient) => {
      const item = document.createElement('li');
      item.textContent = ingredient;
      ingredientsList.appendChild(item);
    });
    recipeDiv.appendChild(ingredientsList);

    // Add the instructions
    const instructions = document.createElement('p');
    instructions.textContent = `Instructions: ${recipe.instructions}`;
    instructions.style.marginBottom = '5px';
    recipeDiv.appendChild(instructions);

    // Create a Material Icon star for saving the recipe
    const saveIcon = document.createElement('span');
    saveIcon.classList.add('material-icons');
    saveIcon.textContent = 'star_border'; // Use 'star_border' for not saved, 'star' for saved
    saveIcon.style.cursor = 'pointer';
    saveIcon.setAttribute('title', 'Save Recipe');

    // Add an event listener to the Save button
    saveIcon.addEventListener('click', function () {
      // Determine the current state based on the icon
      const isSaved = saveIcon.textContent === 'star';

      // Toggle the icon based on whether the recipe is currently saved
      saveIcon.textContent = isSaved ? 'star_border' : 'star';

      // Define the recipe data to send
      const recipeData = { recipe: recipe, key: `recipe_${index}` }; // Ensure 'index' is defined in your loop or context

      // Send the recipe data to the background script, toggling saved state
      chrome.runtime.sendMessage({ action: isSaved ? "removeRecipe" : "saveRecipe", data: recipeData }, function (response) {
        console.log('Response received from background:', response);
      });
    });

    // Append the Save icon to the recipe div
    recipeDiv.appendChild(saveIcon);

    // Append each recipe div to the recipes container
    recipesContainer.appendChild(recipeDiv);
  });

  // Append the recipes container at the end of the container's existing content.
  // This naturally places it below anything already inside the container.
  container.appendChild(recipesContainer);
}



function scrapeMenuItems() {
  let items = [];
  // Use the correct selector for menu items on the webpage
  const elements = document.querySelectorAll('.menu-item');
  elements.forEach(element => {
    // Adjust according to the structure of menu item. For instance:
    items.push(element.textContent.trim());
  });
  return items;
}

function getMenuItemsAsString(menuItems, diet) {
  let message = `Here are the current menu items in the dining hall. The user has a ${diet} diet restriction:\n\n`;

  // Assuming menuItems is an array of strings
  menuItems.forEach((item, index) => {
    // Append each item as a list element
    message += `${index + 1}. ${item}\n`;
  });
  console.log(message);
  return message;
}

async function getRecipes(menuItems, diet) {
  let msg = getMenuItemsAsString(menuItems, diet);
  let chatGPTResponse = await callChatGPT(msg);
  let cleanedResponse;

  // Check if the response starts with "json'''" and ends with "'''", then clean it accordingly
  if (chatGPTResponse.startsWith("json'''") && chatGPTResponse.endsWith("'''")) {
    // Remove "json'''" from the start and "'''" from the end
    cleanedResponse = chatGPTResponse.substring(6, chatGPTResponse.length - 3);
  } else {
    cleanedResponse = chatGPTResponse;
  }

  try {
    // Parse the cleaned JSON string into an object
    const responseObj = JSON.parse(cleanedResponse);

    // Log or manipulate the response object as needed
    console.log("Recipes received:", JSON.stringify(responseObj, null, 2));

    // Return the parsed object for further use
    return responseObj;
  } catch (error) {
    console.error("Failed to parse cleaned chatGPTResponse as JSON:", error);
    // Handle the error appropriately
    return null;
  }
}




// Define an array to store chat messages
let jarvisMessages = [
  {
    "role": "system",
    "content": "You are DiningAI, you generate only 6 creative food options people could make using the menu items in their dining hall. Output only a json called 'recipes' with a list of recipes. Each recipe has a name, list of ingredients and instructions. Do not generate markup. The user does not have access to a kitchen or appliances, only can combine the foods given."
  }];

async function callChatGPT(msg) {
  // Ensure the jarvisMessages array contains at most 5 messages
  if (jarvisMessages.length > 5) {
    jarvisMessages.shift(); // Remove the oldest message to keep the array size within limits
  }

  // Append user message to the jarvisMessages array
  jarvisMessages.push({ role: "user", content: msg });

  // Prepare the request payload
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Remove the Authorization header since the API key should be handled by your proxy server
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: jarvisMessages
    })
  };

  try {
    // Update the fetch URL to point to your proxy server
    const response = await fetch('https://lit-plateau-37817-170e49ac4c7d.herokuapp.com/chatgpt-proxy', requestOptions);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const completion = await response.json();

    // Get the chat response from the API response
    const chatResponse = completion.choices[0].message.content;
    console.log(chatResponse);


    return chatResponse;
  } catch (error) {
    console.error('There was a problem with the proxy server:', error);
    return null;
  }
}