# Contributing to FinTrace

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please respect all contributors and maintainers.

## Getting Started

1. Fork the repository
2. Create feature branch: `git checkout -b feature/xyz`
3. Make changes
4. Write/update tests
5. Commit: `git commit -m 'Add feature xyz'`
6. Push: `git push origin feature/xyz`
7. Submit Pull Request

## Development Standards

### Commits

Use conventional commits:
```
feat: add transaction import feature
fix: resolve database connection timeout
docs: update API documentation
style: format code with prettier
test: add unit tests for fraud detection
refactor: simplify graph traversal logic
chore: update dependencies
```

### Code Style

- **TypeScript**: Follow Google style guide
- **Python**: Follow PEP 8
- **Format**: Use Prettier (TS) and Black (Python)
- **Lint**: Use ESLint and Pylint

### Testing

- Backend: Minimum 70% coverage
- Frontend: Unit test critical components
- ML: Test model accuracy and edge cases

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG
5. Request review from maintainers
6. Address review feedback

## Reporting Issues

Include:
- Clear description of problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs if applicable

## Feature Requests

Describe:
- Use case and benefit
- Proposed implementation (if applicable)
- Potential impact
- Priority level

## Questions?

Open an issue or contact the team at dev@fintrace.io
