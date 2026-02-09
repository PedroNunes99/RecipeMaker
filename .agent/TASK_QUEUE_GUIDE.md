# Task Queue & Auto-PR Guide

## Overview

The agent system now supports:
- ✅ **Task Queuing**: Queue multiple tasks to run sequentially
- ✅ **Auto PRs**: Automatically create PRs after each completed task
- ✅ **Dev/Prod Workflow**: Proper branch management (main, develop, feature/*)

## Quick Start

### 1. Configure Git Workflow

```bash
# Initialize git if not done
git init
git branch -M main

# Create develop branch
git checkout -b develop
git push -u origin develop

# Go back to main
git checkout main

# Set up remote
git remote add origin https://github.com/yourusername/recipemaker.git
git push -u origin main
```

### 2. Enable Auto-PR

Edit `.agent/.env`:
```env
AUTO_PR=true
AUTO_PUSH=true
GITHUB_REPO=yourusername/recipemaker
```

### 3. Install GitHub CLI (for PR creation)

```bash
# Windows
winget install GitHub.cli

# Or download from: https://cli.github.com

# Authenticate
gh auth login
```

## Usage

### Queue Multiple Tasks

```javascript
import TaskQueueManager from './.agent/task-queue.js';

const manager = new TaskQueueManager();
await manager.initialize();

// Add tasks
manager.addTasks([
  {
    description: 'Add loading spinners',
    assignedAgent: 'developer',
    action: 'implement-feature',
    metadata: { requirements: '...' }
  },
  {
    description: 'Write tests for spinners',
    assignedAgent: 'tester',
    action: 'write-tests',
    metadata: { requirements: '...' }
  },
  {
    description: 'Document loading states',
    assignedAgent: 'documenter',
    action: 'document-feature',
    metadata: { requirements: '...' }
  }
]);

// Process all tasks
await manager.processQueue();
```

### What Happens Automatically

For each task:
1. ✅ Agent completes the work
2. ✅ Creates feature branch: `feature/agent-task-name-timestamp`
3. ✅ Commits changes with proper message
4. ✅ Pushes to remote
5. ✅ Creates PR to `develop` (or `main` if develop doesn't exist)
6. ✅ Moves to next task

## Git Branch Strategy

```
main (production)
  ↑ PR merge
develop (integration)
  ↑ PR from features
feature/agent-add-loading-spinners-1707484800
feature/agent-write-tests-1707484850
feature/agent-document-feature-1707484900
```

## Example Workflow

### Scenario: Add 3 features autonomously

```bash
cd .agent
node task-queue.js
```

This will:
1. Process Task 1: Add feature
   - Agent implements
   - Creates `feature/agent-add-feature-xxx`
   - Commits and pushes
   - Creates PR #1 to develop

2. Process Task 2: Write tests
   - Agent writes tests
   - Creates `feature/agent-write-tests-xxx`
   - Commits and pushes
   - Creates PR #2 to develop

3. Process Task 3: Document
   - Agent documents
   - Creates `feature/agent-document-xxx`
   - Commits and pushes
   - Creates PR #3 to develop

You now have 3 PRs ready to review and merge!

## Commit Message Format

Agents use conventional commits:

```
feat: Add loading spinners to all async operations

Added loading spinners for better UX during API calls.
Components updated:
- RecipeList
- IngredientManager
- RecipeDetail

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
Co-Authored-By: Agent System <agents@recipemaker.local>
```

## PR Template

PRs include:
- Summary of changes
- Type of change (feat, fix, test, docs)
- Testing checklist
- Agent information
- Ready-to-review format

## Configuration

### .agent/.env

```env
# Enable auto-PR workflow
AUTO_PR=true        # Create PRs automatically
AUTO_PUSH=true      # Push to remote automatically

# GitHub settings
GITHUB_REPO=your_username/recipemaker
GITHUB_TOKEN=ghp_xxx  # Optional, gh CLI uses its own auth
```

### Disable Auto-PR

If you want manual control:
```env
AUTO_PR=false
AUTO_PUSH=false
```

Agents will still commit locally, but won't push or create PRs.

## Manual PR Creation

If auto-PR is disabled or fails:

```bash
# See what agents committed
git log

# Push manually
git push -u origin feature/agent-task-name

# Create PR manually
gh pr create --base develop --title "Feature: task name"
```

## Best Practices

1. **Review PRs**: Always review agent PRs before merging
2. **Test Locally**: Pull feature branches and test
3. **Small Tasks**: Queue small, focused tasks for easier review
4. **Develop First**: Merge PRs to develop, then develop → main
5. **CI/CD**: Set up GitHub Actions to test PRs automatically

## Example Task Queue

```javascript
const commonTasks = [
  // Phase 1: Testing
  { description: 'Setup testing infrastructure', agent: 'developer' },
  { description: 'Write component tests', agent: 'tester' },

  // Phase 2: Error Handling
  { description: 'Add error boundaries', agent: 'developer' },
  { description: 'Add loading states', agent: 'developer' },
  { description: 'Test error scenarios', agent: 'tester' },

  // Phase 3: Documentation
  { description: 'Generate API docs', agent: 'documenter' },
  { description: 'Update README', agent: 'documenter' },

  // Phase 4: Quality
  { description: 'Run full validation', agent: 'validator' },
  { description: 'Security scan', agent: 'validator' }
];
```

## Troubleshooting

### "No remote configured"
```bash
git remote add origin https://github.com/user/repo.git
```

### "gh: command not found"
```bash
# Install GitHub CLI
winget install GitHub.cli
gh auth login
```

### "develop branch not found"
```bash
# Create develop branch
git checkout -b develop
git push -u origin develop
```

### PRs going to wrong branch
Edit `.agent/workflows/auto-pr-workflow.js` and change target branch logic.

## Monitoring

Check task progress:
```javascript
const status = manager.getStatus();
console.log(`Queued: ${status.queued}`);
console.log(`Completed: ${status.completed}`);
```

## Next Steps

1. Set up CI/CD pipeline for PR validation
2. Add PR review automation
3. Configure branch protection rules
4. Set up automated testing on PRs

---

🤖 **Automated Development with Agent System**
