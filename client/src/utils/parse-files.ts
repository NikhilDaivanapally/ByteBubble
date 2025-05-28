const parseFiles = (files: FileList | File[] | any[]) => {
  const fileArray = Array.from(files);
  return Promise.all(
    fileArray.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            name: file.name || "",
            size: file.size,
            url: URL.createObjectURL(file),
            blob: e.target?.result,
          });
        };
      });
    })
  );
};

export { parseFiles };
