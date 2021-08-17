const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
export const onFileInputChangeGetFile = (setFile) => (event) => {
  if (event.target.files && event.target.files.length > 0) {
    const inputFile = event.target.files[0];
    readFileAsync(inputFile).then((text) => {
      setFile({name: inputFile.name, text});
    });
  }
};
