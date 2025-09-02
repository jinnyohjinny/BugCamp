// Secret Safe - Client-side Application Logic

// Function to display secrets in the UI
function display(title, content) {
    const secretsList = document.getElementById('secrets');
    if (!secretsList) return;
    
    // Create list item element
    const listItem = document.createElement('li');
    listItem.className = 'secret-item';
    
    // Create title element
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    
    // Create content element
    const contentElement = document.createElement('p');
    contentElement.textContent = content;
    
    // Append elements to list item
    listItem.appendChild(titleElement);
    listItem.appendChild(contentElement);
    
    // Add to secrets list
    secretsList.appendChild(listItem);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // The secret.js file will be loaded automatically and call display() for each secret
    console.log('Secret Safe application initialized');
});