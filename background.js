chrome.commands.onCommand.addListener((command) => {
  if (command === 'add_bookmark') {
    addCurrentTabAsBookmark();
  }
});

function addCurrentTabAsBookmark() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab.url;
    const title = tab.title;
    chrome.bookmarks.create({ title, url }, () => {
      // Show the popup to allow the user to edit the bookmark title
      chrome.browserAction.setPopup({ popup: 'popup.html' });
      chrome.browserAction.openPopup();
      // Reset the popup to its default state after it's been opened
      setTimeout(() => {
        chrome.browserAction.setPopup({ popup: '' });
      }, 100);
    });
  });
}
