document.addEventListener('DOMContentLoaded', () => {
    const addBookmarkBtn = document.getElementById('add-bookmark');
    const bookmarksList = document.getElementById('bookmarks-list');
    const bookmarkUrlInput = document.getElementById('bookmark-url');
    const bookmarkTitleInput = document.getElementById('bookmark-title');

    const editModal = document.getElementById('edit-modal');
    const editBookmarkTitleInput = document.getElementById('edit-bookmark-title');
    const editBookmarkUrlInput = document.getElementById('edit-bookmark-url');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');
    let currentEditBookmarkId = null;

    function getAllBookmarks(bookmarkTreeNodes) {
        let bookmarks = [];
        for (let node of bookmarkTreeNodes) {
            if (node.children) {
                bookmarks = bookmarks.concat(getAllBookmarks(node.children));
            }
            if (node.url) {
                bookmarks.push(node);
            }
        }
        return bookmarks;
    }

    function deleteBookmark(bookmarkId) {
        chrome.bookmarks.remove(bookmarkId, () => {
            updateBookmarksList();
        });
    }

    function openEditModal(bookmark) {
        currentEditBookmarkId = bookmark.id;
        editBookmarkTitleInput.value = bookmark.title;
        editBookmarkUrlInput.value = bookmark.url;
        editModal.classList.remove('hidden');
    }

    function closeEditModal() {
        currentEditBookmarkId = null;
        editModal.classList.add('hidden');
    }

    function saveEdit() {
        if (currentEditBookmarkId) {
            const newTitle = editBookmarkTitleInput.value;
            const newUrl = editBookmarkUrlInput.value;
            chrome.bookmarks.update(currentEditBookmarkId, { title: newTitle, url: newUrl }, () => {
                updateBookmarksList();
                closeEditModal();
            });
        }
    }

    saveEditBtn.addEventListener('click', saveEdit);
    cancelEditBtn.addEventListener('click', closeEditModal);


    // Get the current tab's title and URL and fill the input fields
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        bookmarkUrlInput.value = tab.url;
        bookmarkTitleInput.value = tab.title;
    });

    addBookmarkBtn.addEventListener('click', () => {
        const url = bookmarkUrlInput.value;
        const title = bookmarkTitleInput.value;
        addBookmark(url, title);
    });


    function addCurrentTabAsBookmark() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            const url = tab.url;
            const title = tab.title;
            addBookmark(url, title);
        });
    }

    function addBookmark(url, title) {
        chrome.bookmarks.create({ title, url }, () => {
            updateBookmarksList();
        });
    }

    function updateBookmarksList() {
        bookmarksList.innerHTML = '';
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            const bookmarks = getAllBookmarks(bookmarkTreeNodes);
            bookmarks.forEach((bookmark) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = bookmark.url;
                a.textContent = bookmark.title;
                a.target = '_blank';
                li.appendChild(a);

                // Add an edit button to each bookmark item
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => {
                    openEditModal(bookmark);
                });
                li.appendChild(editButton);

                // Add a delete button to each bookmark item
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    deleteBookmark(bookmark.id);
                });
                li.appendChild(deleteButton);

                bookmarksList.appendChild(li);
            });
        });
    }


    function getBookmarks(bookmarkTreeNode) {
        let bookmarks = [];
        if (bookmarkTreeNode.children) {
            bookmarkTreeNode.children.forEach(child => {
                bookmarks = bookmarks.concat(getBookmarks(child));
            });
        }

        if (bookmarkTreeNode.url) {
            bookmarks.push(bookmarkTreeNode);
        }

        return bookmarks;
    }

    updateBookmarksList();
});
