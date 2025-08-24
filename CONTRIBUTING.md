# Contributing to CalmConnect

Thank you for your interest in contributing to CalmConnect! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork the Repository
- Fork the repository to your GitHub account
- Clone your fork locally

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Include tests for new features

### 4. Test Your Changes
```bash
npm install
npm run build
npm run dev
```

### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 6. Push and Create a Pull Request
```bash
git push origin feature/your-feature-name
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the project's style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No sensitive data is included

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Local testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Environment Variables
Copy `env.example` to `.env` and configure:
```env
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email
EMAIL_PASSWORD=your-app-password
```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible

### React Components
- Use functional components with hooks
- Follow naming conventions
- Keep components focused and reusable

### Backend
- Use async/await for database operations
- Implement proper error handling
- Add input validation

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Writing Tests
- Write tests for new features
- Maintain good test coverage
- Use descriptive test names

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Keep README updated

### API Documentation
- Document new API endpoints
- Include request/response examples
- Update API documentation

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Try to reproduce the bug
- Gather relevant information

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 90]
- Node.js version: [e.g., 20.x]

## Additional Information
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Before Requesting
- Check if the feature already exists
- Consider the impact on existing features
- Think about implementation complexity

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why this feature is needed

## Proposed Implementation
How you think it should work

## Alternatives Considered
Other approaches you've considered
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 📞 Getting Help

- Check the [README](README.md) for setup instructions
- Search existing issues for similar problems
- Join our community discussions
- Contact maintainers for urgent issues

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame

Thank you for contributing to CalmConnect! 🧘‍♀️✨
