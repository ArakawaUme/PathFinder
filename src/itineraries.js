const fs = require('fs');
const path = require('path');

// Create directory for notes if it doesn't exist
let pathName = path.join(__dirname, 'TravelNotes');
if (!fs.existsSync(pathName)) {
  fs.mkdirSync(pathName);
}

// Fetch country details from API
async function fetchCountryDetails(countryName) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Country not found');
    }

    const country = data[0];
    return {
      name: country.name.common,
      code: country.cca2.toLowerCase(),
      continent: country.continents[0],
      region: country.region,
      subregion: country.subregion,
      capital: country.capital?.[0] || 'N/A',
      languages: Object.values(country.languages || {}).join(', '),
      timezones: country.timezones.join(', ')
    };
  } catch (error) {
    throw new Error('Error fetching country details: ' + error.message);
  }
}

// Format note content
function formatNoteContent(countryDetails, userName, notes) {
  const date = new Date().toLocaleString();
  return `Country: ${countryDetails.name}
Country Code: ${countryDetails.code}
Added by: ${userName}
Date: ${date}

Continent: ${countryDetails.continent}
Region: ${countryDetails.region}
Subregion: ${countryDetails.subregion || 'N/A'}
Capital: ${countryDetails.capital}
Languages: ${countryDetails.languages}
Time Zones: ${countryDetails.timezones}

Travel Notes:
${notes}`;
}

// CRUD Operations
document.getElementById('btnCreate').addEventListener('click', async function() {
  const countryInput = document.getElementById('countrySelect').value;
  const userName = document.getElementById('travelerName').value;
  const notes = document.getElementById('fileContents').value;

  if (!countryInput || !userName || !notes) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    // Fetch country details
    const countryDetails = await fetchCountryDetails(countryInput);
    
    // Generate filename
    const fileName = `${countryDetails.code}_${userName.replace(/\s+/g, '_').toLowerCase()}.txt`;
    const filePath = path.join(pathName, fileName);
    
    // Format content
    const content = formatNoteContent(countryDetails, userName, notes);
    
    // Save file
    fs.writeFile(filePath, content, function(err) {
      if (err) {
        showToast('Error saving note: ' + err.message, 'error');
        return;
      }
      showToast('Note saved successfully! Your travel experience has been documented.', 'success');
      loadSavedNotes(); // Refresh the notes list
    });
  } catch (error) {
    showToast('Unable to save note. Please try again.', 'error');
  }
});

document.getElementById('btnRead').addEventListener('click', async function() {
  const countryInput = document.getElementById('countrySelect').value;
  const userName = document.getElementById('travelerName').value;

  if (!countryInput || !userName) {
    showToast('Please enter country and name', 'error');
    return;
  }

  try {
    const countryDetails = await fetchCountryDetails(countryInput);
    const fileName = `${countryDetails.code}_${userName.replace(/\s+/g, '_').toLowerCase()}.txt`;
    const filePath = path.join(pathName, fileName);
    
    fs.readFile(filePath, 'utf-8', function(err, data) {
      if (err) {
        showToast('No notes found for this combination', 'error');
        return;
      }
      document.getElementById('fileContents').value = data.split('\n\nTravel Notes:\n')[1] || data;
      showToast('Note loaded successfully!', 'success');
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.getElementById('btnDelete').addEventListener('click', async function() {
  const countryInput = document.getElementById('countrySelect').value;
  const userName = document.getElementById('travelerName').value;

  if (!countryInput || !userName) {
    showToast('Please enter country and name', 'error');
    return;
  }

  try {
    const countryDetails = await fetchCountryDetails(countryInput);
    const fileName = `${countryDetails.code}_${userName.replace(/\s+/g, '_').toLowerCase()}.txt`;
    const filePath = path.join(pathName, fileName);
    
    fs.unlink(filePath, function(err) {
      if (err) {
        showToast('No notes found to delete', 'error');
        return;
      }
      document.getElementById('fileContents').value = '';
      showToast('Note deleted successfully! The travel record has been removed.', 'success');
      loadSavedNotes(); // Refresh the notes list
    });
  } catch (error) {
    showToast('Unable to delete note. Please try again.', 'error');
  }
});

// Toast notification function
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icon based on type
  const icon = type === 'success' ? 'check' : 'exclamation';
  
  // Set title based on type
  const title = type === 'success' ? 'Success' : 'Error';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Add this function to load and display all saved notes
async function loadSavedNotes() {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';

  try {
    const files = fs.readdirSync(pathName);
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(pathName, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        
        // Parse the content
        const lines = content.split('\n');
        const country = lines[0].split(': ')[1];
        const code = lines[1].split(': ')[1];
        const author = lines[2].split(': ')[1];
        const date = lines[3].split(': ')[1];
        
        const notesIndex = content.indexOf('Travel Notes:');
        const notes = content.slice(notesIndex + 13).trim();
        const details = content.slice(content.indexOf('Continent:'), content.indexOf('Travel Notes:')).trim();

        noteCard.innerHTML = `
          <div class="note-header">
            <div>
              <div class="note-title">${country}</div>
              <div class="note-meta">Written by ${author} · ${new Date(date).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="note-details">
            ${details.split('\n').map(line => {
              const [key, value] = line.split(': ');
              return `<p><strong>${key}</strong> ${value}</p>`;
            }).join('')}
          </div>
          <div class="note-content">${notes}</div>
          <div class="note-actions">
            <button class="icon-btn edit-btn" title="Edit note">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="icon-btn delete-btn" title="Delete note">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;

        // Add delete event listener
        const deleteBtn = noteCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to delete this note?')) {
            try {
              fs.unlinkSync(filePath);
              noteCard.style.animation = 'slideOut 0.3s ease forwards';
              setTimeout(() => {
                loadSavedNotes(); // Reload the notes after deletion
                showToast('Note deleted successfully!', 'success');
              }, 300);
            } catch (error) {
              showToast('Error deleting note: ' + error.message, 'error');
            }
          }
        });

        // Add edit event listener
        const editBtn = noteCard.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
          document.getElementById('countrySelect').value = country;
          document.getElementById('travelerName').value = author;
          document.getElementById('fileContents').value = notes;
          document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        });

        notesList.appendChild(noteCard);
      }
    }

    if (files.length === 0) {
      notesList.innerHTML = `
        <div class="empty-state">
          <p>No travel notes saved yet</p>
        </div>
      `;
    }
  } catch (error) {
    showToast('Error loading notes: ' + error.message, 'error');
  }
}

// Load saved notes when the page loads
document.addEventListener('DOMContentLoaded', loadSavedNotes);
