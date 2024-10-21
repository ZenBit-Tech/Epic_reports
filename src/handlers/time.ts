import { format, parseISO } from "date-fns";

const DATE_FORMAT = "dd/MM/yyyy";

const convertDateFormat = (dateString: string) => {
  if (!dateString) return undefined;

  const date = parseISO(dateString); // Parses the string in ISO format
  return format(date, DATE_FORMAT); // Formats the date to the desired format
};

export { convertDateFormat };
