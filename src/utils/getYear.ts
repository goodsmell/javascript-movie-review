export const getYear = (date: string) => {
  const parseDate = date.split("-");
  return parseDate[0];
};
