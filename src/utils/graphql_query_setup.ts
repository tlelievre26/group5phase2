import { graphql } from "@octokit/graphql";
import { GITHUB_TOKEN } from "./config";

const graphqlWithAuth = graphql.defaults({ //Instatiates the graphql client with the token
    headers: {
        authorization: `token ${GITHUB_TOKEN}`
    }
});

export default graphqlWithAuth; //Exports the graphql client to be queried from other files