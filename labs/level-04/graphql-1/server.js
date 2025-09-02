const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

const schema = buildSchema(`
  type Project {
    id: ID!
    name: String!
    description: String!
    status: String!
  }

  type SecretKey {
    id: ID!
    value: String!
  }

  type Query {
    projects: [Project]
    secretKeys: [SecretKey]
  }
`);

const projectsData = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern UI/UX',
    status: 'In Progress'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: 'Planning'
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migration from legacy database to modern cloud infrastructure',
    status: 'Completed'
  },
  {
    id: '4',
    name: 'Security Audit',
    description: 'Comprehensive security assessment and vulnerability testing',
    status: 'Scheduled'
  },
  {
    id: '5',
    name: 'API Integration',
    description: 'Integration with third-party payment and notification services',
    status: 'In Progress'
  }
];

const secretKeysData = [
  {
    id: '1',
    value: 'sk_prod_a8c9f2e1b6d4c7a3e9f1b2c5d8e4f7a9'
  }
];

const root = {
  projects: () => projectsData,
  secretKeys: () => secretKeysData
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false,
  introspection: true
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Project Management Platform running on port ${PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
});