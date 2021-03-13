import GitInfo from "react-git-info/macro";

const gitInfo = GitInfo();

export const GIT_HASH = gitInfo.commit.shortHash;