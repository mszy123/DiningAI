//material icons
var link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
link.rel = 'stylesheet';
document.head.appendChild(link);

//let content script know to scrape menu
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "fetchMenu") {
      console.log("Received diet restriction:", request.diet);
      const menuItems = scrapeMenuItems();

      let recipesString = getRecipes(menuItems, request.diet);
      console.log(recipesString);

      getRecipes(menuItems, request.diet).then(recipesObj => {
        displayRecipesOnPage(recipesObj);
      }).catch(error => {
        console.error('Error fetching or displaying recipes:', error);
      });

      sendResponse({ data: menuItems });
    }
    return true;
  }
);


async function displayRecipesOnPage(recipesObj) {
  if (!recipesObj || !recipesObj.recipes) {
    console.error('Invalid or missing recipes object');
    return;
  }

  const container = document.querySelector('.menus-section_menuBackground_1UmC8');
  if (!container) {
    console.error('Container element not found');
    return;
  }


  //check if a recipes container already exists, and if so, remove it
  const existingRecipesContainer = document.getElementById('recipes-container');
  if (existingRecipesContainer) {
    existingRecipesContainer.parentNode.removeChild(existingRecipesContainer);
  }

  //create a container for all recipes to keep them organized
  const recipesContainer = document.createElement('div');
  recipesContainer.id = 'recipes-container';
  recipesContainer.style = 'padding: 30px'; // Example styling, adjust as needed

  //add the recipe name
  const title = document.createElement('h1');
  title.textContent = "Your Recommended Recipes:";
  title.style.fontWeight = 'bold'; // Make the text bold
  title.style.color = '#862633'; // Set the text color to maroon
  title.style.fontSize = '24px'; // Set the font size to 24px
  title.style.marginBottom = '10px';
  recipesContainer.appendChild(title);

  recipesObj.recipes.forEach((recipe, index) => {
    //create a div for each recipe
    const recipeDiv = document.createElement('div');
    recipeDiv.style = 'margin-bottom: 20px; border: 1px solid gray; border-radius: 24px; padding: 15px;'; // Example styling, adjust as needed


    //add the recipe name
    const recipeName = document.createElement('h2');
    recipeName.textContent = recipe.name;
    recipeDiv.appendChild(recipeName);


    //add the ingredients list
    const ingredientsList = document.createElement('ul');
    recipe.ingredients.forEach((ingredient) => {
      const item = document.createElement('li');
      item.textContent = ingredient;
      ingredientsList.appendChild(item);
    });
    recipeDiv.appendChild(ingredientsList);

    //add the instructions
    const instructions = document.createElement('p');
    instructions.textContent = `Instructions: ${recipe.instructions}`;
    instructions.style.marginBottom = '5px';
    recipeDiv.appendChild(instructions);

    //material icon star for saving the recipe
    const saveIcon = document.createElement('span');
    saveIcon.classList.add('material-icons');
    saveIcon.textContent = 'star_border';
    saveIcon.style.cursor = 'pointer';
    saveIcon.setAttribute('title', 'Save Recipe');

    saveIcon.addEventListener('click', function () {
      const isSaved = saveIcon.textContent === 'star';

      saveIcon.textContent = isSaved ? 'star_border' : 'star';


      const recipeData = { recipe: recipe, key: `recipe_${index}` }; 

      //send the recipe data to the background script, toggling saved state
      chrome.runtime.sendMessage({ action: isSaved ? "removeRecipe" : "saveRecipe", data: recipeData }, function (response) {
        console.log('Response received from background:', response);
      });
    });

    recipeDiv.appendChild(saveIcon);

    recipesContainer.appendChild(recipeDiv);
  });

  container.appendChild(recipesContainer);
}



function scrapeMenuItems() {
  let items = [];
  const elements = document.querySelectorAll('.menu-item');
  elements.forEach(element => {
    items.push(element.textContent.trim());
  });
  return items;
}

function getMenuItemsAsString(menuItems, diet) {
  let message = `Here are the current menu items in the dining hall. The user has a ${diet} diet restriction. Make 6 recipes in JSON format for them:\n\n`;

  menuItems.forEach((item, index) => {
    message += `${index + 1}. ${item}\n`;
  });
  console.log(message);
  return message;
}

async function getRecipes(menuItems, diet) {
  let msg = getMenuItemsAsString(menuItems, diet);
  let chatGPTResponse = await callChatGPT(msg);
  let cleanedResponse;

  cleanedResponse = chatGPTResponse
    .split('\n') 
    .filter(line => !line.includes("json```") && !line.includes("```")) //remove lines containing specific substrings
    .join('\n'); 

  try {
    // Parse the cleaned JSON string into an object
    const responseObj = JSON.parse(cleanedResponse);

    console.log("Recipes received:", JSON.stringify(responseObj, null, 2));

    return responseObj;
  } catch (error) {
    console.error("Failed to parse cleaned chatGPTResponse as JSON:", error);
    return null;
  }
}




let jarvisMessages = [
  {
    "role": "system",
    "content": "You are DiningAI, you generate only 6 creative food options people could make using the menu items in their dining hall. Output only a json called 'recipes' with a list of recipes. Each recipe has a name, list of ingredients and instructions. Do not generate markup. The user does not have access to a kitchen or appliances, only can combine the foods given."
  }];

async function callChatGPT(msg) {
  if (jarvisMessages.length > 5) {
    jarvisMessages.shift();
  }

  jarvisMessages.push({ role: "user", content: msg });

  //prepare the request payload
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: jarvisMessages
    })
  };

  try {
    const response = await fetch('https://lit-plateau-37817-170e49ac4c7d.herokuapp.com/chatgpt-proxy', requestOptions);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const completion = await response.json();

    const chatResponse = completion.choices[0].message.content;
    console.log(chatResponse);


    return chatResponse;
  } catch (error) {
    console.error('There was a problem with the proxy server:', error);
    return null;
  }
}