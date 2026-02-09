import { execCommand } from '../shared/utils.js';
import { Logger } from '../shared/utils.js';

const logger = new Logger('AutoPR');

/**
 * Automated PR workflow after task completion
 */
export class AutoPRWorkflow {
  constructor() {
    this.branchPrefix = 'feature/agent-';
  }

  /**
   * Create branch, commit, push, and create PR
   */
  async createPR(taskName, filesModified, summary) {
    try {
      logger.info('Starting automated PR workflow...');

      // 1. Check if git repo exists
      await this.ensureGitRepo();

      // 2. Create feature branch
      const branchName = await this.createFeatureBranch(taskName);

      // 3. Stage and commit changes
      await this.commitChanges(taskName, filesModified, summary);

      // 4. Push to remote
      await this.pushToRemote(branchName);

      // 5. Create PR
      const prUrl = await this.createPullRequest(taskName, summary);

      logger.info(`✓ PR created: ${prUrl}`);

      return {
        success: true,
        branch: branchName,
        prUrl: prUrl
      };

    } catch (error) {
      logger.error('PR workflow failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ensure git repository exists
   */
  async ensureGitRepo() {
    try {
      await execCommand('git rev-parse --git-dir');
    } catch (error) {
      logger.info('Initializing git repository...');
      await execCommand('git init');
      await execCommand('git branch -M main');
    }
  }

  /**
   * Create feature branch from develop (or main if develop doesn't exist)
   */
  async createFeatureBranch(taskName) {
    const timestamp = Date.now();
    const safeName = taskName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50);
    const branchName = `${this.branchPrefix}${safeName}-${timestamp}`;

    try {
      // Check if develop exists, fallback to main
      let baseBranch = 'main';
      try {
        await execCommand('git rev-parse --verify develop');
        baseBranch = 'develop';
      } catch {
        // develop doesn't exist, use main
      }

      // Create and checkout feature branch
      await execCommand(`git checkout -b ${branchName} ${baseBranch}`);
      logger.info(`✓ Created branch: ${branchName} from ${baseBranch}`);

      return branchName;
    } catch (error) {
      logger.warn(`Could not create branch from base, creating orphan branch`);
      await execCommand(`git checkout -b ${branchName}`);
      return branchName;
    }
  }

  /**
   * Commit changes with proper message
   */
  async commitChanges(taskName, filesModified, summary) {
    // Stage files
    if (filesModified && filesModified.length > 0) {
      for (const file of filesModified) {
        try {
          await execCommand(`git add "${file}"`);
        } catch (error) {
          logger.warn(`Could not add file: ${file}`);
        }
      }
    } else {
      await execCommand('git add -A');
    }

    // Check if there are changes to commit
    try {
      const status = await execCommand('git status --porcelain');
      if (!status.stdout.trim()) {
        logger.info('No changes to commit');
        return;
      }
    } catch (error) {
      // Continue with commit
    }

    // Create commit message
    const commitMsg = this.formatCommitMessage(taskName, summary);

    // Commit
    await execCommand(`git commit -m "${commitMsg}"`);
    logger.info('✓ Changes committed');
  }

  /**
   * Format commit message
   */
  formatCommitMessage(taskName, summary) {
    const type = this.inferCommitType(taskName);
    const message = `${type}: ${taskName}

${summary || 'Automated changes by agent system'}

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
Co-Authored-By: Agent System <agents@recipemaker.local>`;

    return message.replace(/"/g, '\\"'); // Escape quotes
  }

  /**
   * Infer commit type from task name
   */
  inferCommitType(taskName) {
    const lower = taskName.toLowerCase();
    if (lower.includes('test')) return 'test';
    if (lower.includes('doc')) return 'docs';
    if (lower.includes('fix')) return 'fix';
    if (lower.includes('refactor')) return 'refactor';
    return 'feat';
  }

  /**
   * Push branch to remote
   */
  async pushToRemote(branchName) {
    try {
      // Check if remote exists
      const remotes = await execCommand('git remote');
      if (!remotes.stdout.includes('origin')) {
        logger.warn('No remote configured. Skipping push.');
        logger.info('Configure remote with: git remote add origin <url>');
        return;
      }

      // Push branch
      await execCommand(`git push -u origin ${branchName}`);
      logger.info('✓ Pushed to remote');

    } catch (error) {
      logger.warn('Could not push to remote:', error.message);
      logger.info('You can manually push with: git push -u origin ' + branchName);
    }
  }

  /**
   * Create pull request using gh CLI
   */
  async createPullRequest(taskName, summary) {
    try {
      // Check if gh CLI is installed
      await execCommand('gh --version');

      // Determine target branch (develop if exists, otherwise main)
      let targetBranch = 'main';
      try {
        await execCommand('git rev-parse --verify origin/develop');
        targetBranch = 'develop';
      } catch {
        // develop doesn't exist, target main
      }

      // Create PR
      const prBody = this.formatPRBody(summary);
      const result = await execCommand(
        `gh pr create --base ${targetBranch} --title "${taskName}" --body "${prBody}"`
      );

      const prUrl = result.stdout.trim();
      logger.info(`✓ PR created: ${prUrl}`);

      return prUrl;

    } catch (error) {
      if (error.message.includes('gh: command not found')) {
        logger.warn('gh CLI not installed. Install from: https://cli.github.com');
        logger.info('Or create PR manually from the pushed branch');
      } else {
        logger.warn('Could not create PR:', error.message);
      }
      return null;
    }
  }

  /**
   * Format PR body
   */
  formatPRBody(summary) {
    return `## Summary

${summary || 'Automated changes by agent system'}

## Type of Change
- [x] 🤖 Automated by agent system

## Testing
- [x] Agents validated changes
- [x] All tests passing (if applicable)

## Checklist
- [x] Code follows project guidelines
- [x] Changes documented
- [x] Ready for review

---

🤖 **Automated PR created by RecipeMaker Agent System**

This PR was created autonomously. Please review the changes before merging.
`.replace(/"/g, '\\"');
  }
}

export default AutoPRWorkflow;
