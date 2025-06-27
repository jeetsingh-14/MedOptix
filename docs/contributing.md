# Contributing to MedOptix

Thank you for your interest in contributing to MedOptix! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

## Code of Conduct

We expect all contributors to adhere to the following code of conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Be open to different viewpoints and experiences

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
   ```bash
   git clone https://github.com/your-username/medoptix.git
   cd medoptix
   ```
3. **Set up the development environment**
   - For Windows: `setup.bat`
   - For Unix/Linux/Mac: `./setup.sh`
4. **Create a new branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Understand the architecture**
   - Review the [architecture documentation](architecture.md)
   - Understand the [A/B testing methodology](ab_testing.md) if relevant to your changes

2. **Make your changes**
   - Follow the [coding standards](#coding-standards)
   - Add or update tests as necessary
   - Add or update documentation as necessary

3. **Test your changes**
   - Run the existing tests
   - Manually test the functionality

4. **Commit your changes**
   - Use clear and descriptive commit messages
   - Reference issue numbers in commit messages when applicable
   ```bash
   git commit -m "Add feature X, resolves #123"
   ```

5. **Push your changes** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a pull request** from your fork to the main repository

## Pull Request Process

1. **Create a pull request** from your fork to the main repository
2. **Fill out the pull request template** with:
   - Description of the changes
   - Issue number(s) addressed
   - Testing performed
   - Screenshots (if applicable)
3. **Address review feedback** if requested
4. **Update your PR** with requested changes if necessary
5. Once approved, your PR will be merged by a maintainer

## Coding Standards

### Python

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide
- Use docstrings for functions, classes, and modules
- Use type hints where appropriate
- Maximum line length: 100 characters
- Use meaningful variable and function names

### JavaScript/React

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ES6+ features
- Use functional components with hooks for React
- Use PropTypes for component props
- Use meaningful component and variable names

## Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting a pull request
- Aim for good test coverage of your code

### Running Tests

```bash
# Run Python tests
pytest

# Run JavaScript tests
cd client/medoptix-dashboard
npm test
```

## Documentation

- Update documentation for any changes to functionality
- Document new features, APIs, or configuration options
- Use clear, concise language
- Include examples where appropriate

## Feature Requests

If you have an idea for a new feature:

1. Check if the feature has already been requested or implemented
2. Open an issue describing the feature and its benefits
3. Discuss the feature with the maintainers
4. If approved, you can implement the feature yourself or wait for someone else to implement it

## Bug Reports

If you find a bug:

1. Check if the bug has already been reported
2. Open an issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment information (OS, browser, etc.)

## Adding New Components

### Backend Components

1. Place new ETL components in the `scripts/` directory
2. Place new API endpoints in the `api/` directory
3. Update database schema in `scripts/load.py` if necessary
4. Document the changes in the architecture documentation

### Frontend Components

1. Place new React components in the `client/medoptix-dashboard/src/components/` directory
2. Place new pages in the `client/medoptix-dashboard/src/pages/` directory
3. Update the navigation if necessary
4. Ensure responsive design for all screen sizes

## Thank You!

Your contributions help make MedOptix better for everyone. We appreciate your time and effort!