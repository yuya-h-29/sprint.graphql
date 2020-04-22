const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
// Update your schema so it fully represents your Pokemon data object!
// Add to your Schema so you can also access Types and Attacks!
const schema = buildSchema(`

  type Pokemon {
    id: String
    name: String!
    attacks: Attacks
    types: [String]
  }

  type Attacks {
    fast: [Attack]
    special: [Attack]
  }

  type Attack {
    name: String
    type: String
    damage: Int
    Pokemon:[Pokemon]
  }

  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String, id: Int): Pokemon
    Attacks(type: String!):[Attack]
    type(name: String!): [Pokemon]
    attack(name: String!): Attack
  }
`);
// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    if (typeof request.id === "number") {
      // console.log("aaaaaaa", request);
      return data.pokemon[request.id - 1];
    } else {
      return data.pokemon.find((pokemon) => pokemon.name === request.name);
    }
  },
  Attacks: (request) => {
    return data.attacks[request.type];
    // request.type => fast / special
  },

  type: (request) => {
    return data.pokemon.filter((obj) => {
      return obj.types.includes(request.name);
    }); //types[request.name]);
    //return => [data.pokemon[0],[1],...]
  },

  attack: (request) => {
    // return {
    //   name: "Tackle",
    //   type: "Normal",
    //   damage: 12,
    // };
    let fastOrSpecial;
    // console.log("AAAA", fastOrSpecial);
    let attackType;
    let attackDamage;
    for (const obj of data.attacks.fast) {
      if (obj.name === request.name) {
        fastOrSpecial = "fast";
        attackType = obj.type;
        attackDamage = obj.damage;
        break;
      }
      for (const obj of data.attacks.special) {
        if (obj.name === request.name) {
          fastOrSpecial = "special";
          attackType = obj.type;
          attackDamage = obj.damage;
          break;
        }
      }
    }
    // console.log("BBBB", fastOrSpecial);
    const result = [];
    for (let index = 0; index < data.pokemon.length; index++) {
      for (const attack of data.pokemon[index].attacks[fastOrSpecial]) {
        if (attack.name === request.name) {
          result.push(data.pokemon[index]);
        }
      }
    }
    let finalResult = {
      name: request.name,
      type: attackType,
      damage: attackDamage,
      Pokemon: result,
    };
    return finalResult;
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
