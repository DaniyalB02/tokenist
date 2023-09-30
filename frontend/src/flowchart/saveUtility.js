// saveUtility.js
export const saveCirclesToFile = (circles) => {
  const json = JSON.stringify(circles);

  // Create a Blob (a binary large object) with the JSON data
  const blob = new Blob([json], { type: 'application/json' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'circles.json'; // Specify the file name

  // Trigger a click event on the link element to start the download
  a.click();

  // Revoke the URL to free up resources
  URL.revokeObjectURL(url);
};
