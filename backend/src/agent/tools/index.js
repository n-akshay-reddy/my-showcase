import {setTheme} from "./ui/theme.js";
import { navigateToPage } from "./ui/navigateToPage.js";
import { openProfile } from "./ui/openProfile.js";
import { composeEmail } from "./ui/composeEmail.js";


const ALL_TOOLS = [setTheme,navigateToPage,openProfile,composeEmail];

// After AI replies, the code needs the full tool to validate its arguments or run execute().
export const TOOLS = Object.fromEntries(ALL_TOOLS.map((tool) => [tool.name, tool]));

// For AI purpose
export function describeToolsForPrompt() {
    return ALL_TOOLS.map((tool) =>`- ${tool.name}: ${tool.description} Args: ${JSON.stringify(tool.args)}`).join("\n");
}