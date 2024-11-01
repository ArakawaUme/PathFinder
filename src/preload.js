const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

// Define the relative path
const filesDir = path.join(__dirname, 'Files');

// Create Files directory if it doesn't exist
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
}

contextBridge.exposeInMainWorld('electronAPI', {
    saveToFile: (fileName, content) => {
        try {
            const filePath = path.join(filesDir, fileName);
            fs.appendFileSync(filePath, content);
            return true;
        } catch (error) {
            console.error('Error saving file:', error);
            return false;
        }
    }
});
