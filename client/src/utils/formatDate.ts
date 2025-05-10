const formatDate = (date:string) => {
  const FromatDate = new Date(Date.parse(date)).toDateString();
  return { FromatDate };
};
export default formatDate;
