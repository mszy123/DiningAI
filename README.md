# DiningAI Chrome Extension
## Created by Matthew Szypula & Kerry Cassidy

**Introduction:** Hi! I'm Matthew Szypula and I'm a sophmore at Colgate majoring in Computer Science and Mathematical Economics. 

I'm Kerry Cassidy and major in Economics but am really interested in CS. I did some UI design for this extension

### Link to Pitch & Demo Video: https://youtu.be/TxKR5SOE8AA

### Purpose & Motivation
Everyone knows how sometimes there's not that much variety in the dining halls, or if you have any dietary restrictions it is hard to find creative and unique meals... That is where Dining AI helps! Dining AI uses the power of AI to generate unique meal options based on any dining restrictions and the current menu in the dining halls! No more wandering around the dining halls looking for something good to eat, make it yourself with the help of Dining AI. 

### How it Works
Dining AI is a chrome extension that when a user presses the generate button in the extension, the popup.js file tells the Chrome messaging API to send a message to my content.js file to inject a content script into the Colgate Dine on Campus Website, from there it scrapes the site for the current menu offerings by looking for items with the menu-item class. It them prepares and cleans the data to send to the ChatGPT API on the proxy server I created (so I don't have any client-facing API keys exposed). The data is then sent back to the extension and through a HTML injection each recipe, ingredients and instructions are intuitively displayed on the Colgate Dine on Campus website. The user then has the option to save their favorite recipes which get stored in Chrome local storage and displayed in the extension popup (from which the user can choose to delete any already saved recipes)

### Development Process
I began with designing the popup for the extension and simply scraping and printing the current menu offerings in the dining hall. Then I progressed to calling the ChatGPT API to make a json detailing recipes that could be made using the given ingredients. Using the json I could dynamically add HTML elements to the webpage through my content script. Then I began working on the saving ability, allowing users to save and delete their favorite recipes in the extension. I followed this up by doing UI design to ensure a seamless user experience. I then built a proxy server to handle api requests to ensure API security.

### How to Use
- Navigate to https://dineoncampus.com/colgate/whats-on-the-menu
- Open the Dining AI Extension in Chrome
- Select any dietary restrictions or none
- Press generate recipes
- The recipes will appear at the top of the Dine On Campus webpage
- Click the star at the bottom of each recipe to save it to the extension
- Open the extension again to see/delete any saved recipes
- Click more details to see ingredients, instructions

### Difficulties & Challenges
The first difficulty I encountered is that the different javascript files I had needed to "talk" to one another so the extension knew when to inject the content script which led to me discovering the Chrome messaging API and storage API which allowed me to send messages across files to trigger events. Another difficulty is Chrome has a content security policy that does not allow me to call any remote code in my extension, leading me to create a proxy server in Heroku to manage calls to the ChatGPT API. The third difficulty is getting ChatGPT to always output the same format so my program can parse it and display the recipes to the user, leading me to fine-tune a ChatGPT model to output it in a JSON format and convert it, along with some prompt engineering. 

### Go-to-Market Strategy
This extension is readily scalable due to the scalable Heroku flask server the ChatGPT API is implemented on. It also adheres to all Chrome Extension policies such as it's CSP allowing it to be published on the Chrome Web Store. The API keys used are also securely stored in a .env file on the proxy server. This also works on any Dine On Campus site, meaning it is scalable to other colleges and universities that have Dine On Campus access

### How To Install This Extension
- Clone this github repo
- Go to chrome://extensions/
- Click 'Load Unpacked' in the top left corner
- Select the folder of this repo (DiningAI)
- Go to the extension bar in the Chrome tab and pin the extension, then click the DiningAI icon to use

### Images
![Screenshot](https://github.com/mszy123/DiningAI/blob/main/Screenshot%202024-03-24%20094657.png)






