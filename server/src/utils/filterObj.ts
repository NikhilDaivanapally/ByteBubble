const filterObj = ( obj:any, ...allowedFields:any) => {
  return Object.keys(obj).reduce((acc: any, val) => {
    if (allowedFields.includes(val)) {
      acc[val] = obj[val];
    }
    return acc;
  }, {});
};

export { filterObj };
