chrome.runtime.onInstalled.addListener(() => {
    console.log('Campus Menu Scraper installed.');
  });
  

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "saveRecipe" && request.data) {
      //extract recipe data and key from the request
      const { key, recipe } = request.data;
      //save the recipe to Chrome's local storage
      chrome.storage.local.set({[key]: recipe}, function() {
        console.log(`Recipe saved: ${key}`);
        sendResponse({status: 'success', key: key});
      });
      return true;  
    }
  });