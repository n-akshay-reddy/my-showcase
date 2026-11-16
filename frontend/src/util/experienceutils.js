const TOP_COUNT = 5;

const parseDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day || 1);
};

const formatMonth = (value) => parseDate(value).toLocaleString("en", { month: "short", year: "numeric" });

export const getPeriod = ({ start, end }) => `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;

export function getTenure({ start, end }) {
    const from = parseDate(start);
    const to = end ? parseDate(end) : new Date();
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
        months--;
        days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [[years, "yr"], [months, "mo"], [days, "day"]]
        .filter(([count]) => count > 0)
        .map(([count, unit]) => `${count} ${unit}${count === 1 ? "" : "s"}`);
    return parts.join(" ") || "0 days";
}


export const getSortedHighlights = (company) => [...company.highlights].sort((a, b) => a.rank - b.rank);
export const getTopHighlights = (company) => getSortedHighlights(company).slice(0, TOP_COUNT);