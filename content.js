// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "fetchMenu") {
      // Your logic here
      console.log("Hey");
      const menuItems = scrapeMenuItems();
      //let prompt = getMenuItemsAsString(menuItems);
      let recipiesString = getRecipes(menuItems);
      console.log(recipiesString);
      sendResponse({data: menuItems});
      //sendResponse({data: "Sample response from content script"});
    }
    // Return true if you will asynchronously send a response
    return true;
  }
);


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

function getMenuItemsAsString(menuItems) {
  let message = "Here are the current menu items in the dining hall:\n\n";
  
  // Assuming menuItems is an array of strings
  menuItems.forEach((item, index) => {
    // Append each item as a list element
    message += `${index + 1}. ${item}\n`;
  });
  console.log(message);
  return message;
}

async function getRecipes(menuItems){
  let msg = getMenuItemsAsString(menuItems);
  let chatGPTResponse = callChatGPT(msg);
  let recipes = parseMealOptions(chatGPTResponse);
  console.log("R" + recipes);
  return recipes;
}

async function parseMealOptions(response) {
  // First, split the response into lines
  const lines = response.split('\n');
  
  // Filter out the lines that contain meal options, which start with a digit followed by a period
  const mealOptionLines = lines.filter(line => line.trim().match(/^\d+\./));
  
  // Now, process each line to extract the meal option text
  const mealOptions = mealOptionLines.map(line => {
    // Remove the leading number and period, then trim whitespace
    return line.replace(/^\d+\.\s*/, '').trim();
  });
  
  return mealOptions;
}


// Define an array to store chat messages
let jarvisMessages = [
  {
      "role": "system",
      "content": "You are DiningAI, you generate only 6 creative food options people could make using the menu items in their dining hall. Only list the foods and how to make them, no other text. No markup styling"
  }];

await async function callChatGPT(msg) {
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