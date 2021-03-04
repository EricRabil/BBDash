import { ContentCategories } from "@bbdash/shared";

export const categoryNames: Record<keyof typeof ContentCategories, string> = {
    assignment: "Assignment",
    discussionBoard: "Discussion Board",
    group: "Group",
    lti: "Instruction Tool",
    tools: "Tools",
    info: "Information",
    organization: "Organizational Info",
    navigation: "Links",
    unknown: "Unknown"
};
